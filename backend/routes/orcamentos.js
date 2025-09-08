// backend/routes/orcamentos.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const fs = require('fs');
const path = require('path');

// Create new orcamento (including services)
router.post('/', async (req, res) => {
  try {
    const {
      ID_Cliente,
      Data_Prevista_Conclusao,
      Status,
      Valor_Total,
      Valor_A_Vista,
      Valor_A_Prazo,
      Forma_Pagamento,
      QR_Code_Pix,
      Observacoes,
      Assinatura_Cliente,
      Servicos
    } = req.body;

    const Data_Emissao = new Date();
    const Data_Vencimento = new Date(Date.now() + 30*24*60*60*1000);

    const [result] = await db.query(
      `INSERT INTO Orcamentos (ID_Cliente, Data_Emissao, Data_Vencimento, Data_Prevista_Conclusao, Status, Valor_Total, Valor_A_Vista, Valor_A_Prazo, Forma_Pagamento, QR_Code_Pix, Observacoes, Assinatura_Cliente)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ID_Cliente, Data_Emissao, Data_Vencimento, Data_Prevista_Conclusao || null, Status || 'Aberto', Valor_Total || 0.00, Valor_A_Vista || 0.00, Valor_A_Prazo || 0.00, Forma_Pagamento || 'Dinheiro', QR_Code_Pix || null, Observacoes || null, Assinatura_Cliente || null]
    );

    const idOrc = result.insertId;

    // insert services
    if (Array.isArray(Servicos)) {
      for (const s of Servicos) {
        const valorTotal = (parseFloat(s.Quantidade) || 0) * (parseFloat(s.Valor_Unitario) || 0);
        await db.query(`INSERT INTO Servicos (ID_Orcamento, Descricao, Descricao_Livre, Quantidade, Valor_Unitario, Valor_Total) VALUES (?, ?, ?, ?, ?, ?)`,
          [idOrc, s.Descricao || 'Desamassar', s.Descricao_Livre || null, s.Quantidade || 1, s.Valor_Unitario || 0.00, valorTotal]);
      }
    }

    // update client's ultimo_orcamento
    if (ID_Cliente) {
      await db.query(`UPDATE Clientes SET Ultimo_Orcamento = ? WHERE ID_Cliente = ?`, [Data_Emissao, ID_Cliente]);
    }

    const [[created]] = await db.query(`SELECT * FROM Orcamentos WHERE ID_Orcamento = ?`, [idOrc]);
    res.json(created);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar orçamento' });
  }
});

// List orcamentos with filters
router.get('/', async (req, res) => {
  try {
    const { status, cliente, dateFrom, dateTo } = req.query;
    let where = 'WHERE 1=1';
    const params = [];
    if (status) { where += ' AND Status = ?'; params.push(status); }
    if (cliente) { where += ' AND ID_Cliente = ?'; params.push(cliente); }
    if (dateFrom) { where += ' AND Data_Emissao >= ?'; params.push(dateFrom); }
    if (dateTo) { where += ' AND Data_Emissao <= ?'; params.push(dateTo); }

    const [rows] = await db.query(`SELECT o.*, c.Nome as Nome_Cliente FROM Orcamentos o LEFT JOIN Clientes c ON o.ID_Cliente=c.ID_Cliente ${where} ORDER BY Data_Emissao DESC`, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar orçamentos' });
  }
});

// Get orcamento with services
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [[orc]] = await db.query(`SELECT o.*, c.Nome as Nome_Cliente, c.Telefone FROM Orcamentos o LEFT JOIN Clientes c ON o.ID_Cliente=c.ID_Cliente WHERE o.ID_Orcamento = ?`, [id]);
    const [servicos] = await db.query(`SELECT * FROM Servicos WHERE ID_Orcamento = ?`, [id]);
    res.json({ orc, servicos });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar orçamento' });
  }
});

// Update orcamento (general)
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updateFields = req.body;
    const keys = Object.keys(updateFields);
    if (keys.length === 0) return res.status(400).json({ error: 'No data' });

    const sets = keys.map(k => `${k} = ?`).join(', ');
    const params = keys.map(k => updateFields[k]);
    params.push(id);
    await db.query(`UPDATE Orcamentos SET ${sets} WHERE ID_Orcamento = ?`, params);
    const [[updated]] = await db.query(`SELECT * FROM Orcamentos WHERE ID_Orcamento = ?`, [id]);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar orçamento' });
  }
});

// Delete orcamento
router.delete('/:id', async (req, res) => {
  try {
    await db.query(`DELETE FROM Orcamentos WHERE ID_Orcamento = ?`, [req.params.id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar orçamento' });
  }
});

// Generate PDF for orcamento
router.get('/:id/pdf', async (req, res) => {
  try {
    const id = req.params.id;
    const [[orcRow]] = await db.query(`SELECT o.*, c.Nome as Nome_Cliente, c.Endereco, c.Bairro, c.Telefone, c.Chassi
      FROM Orcamentos o LEFT JOIN Clientes c ON o.ID_Cliente=c.ID_Cliente WHERE o.ID_Orcamento = ?`, [id]);

    const [servicos] = await db.query(`SELECT * FROM Servicos WHERE ID_Orcamento = ?`, [id]);

    if (!orcRow) return res.status(404).json({ error: 'Orçamento não encontrado' });

    // Create PDF
    const doc = new PDFDocument({ size: 'A4', margin: 40 });
    res.setHeader('Content-disposition', `inline; filename=orcamento_${id}.pdf`);
    res.setHeader('Content-type', 'application/pdf');

    // Header
    doc.fontSize(16).text(process.env.OFICINA_NOME || 'Oficina de Lanternagem', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(10).text(`Orçamento Nº ${id}`, { align: 'right' });
    doc.moveDown();

    // Client
    doc.fontSize(12).text(`Cliente: ${orcRow.Nome_Cliente || ''}`);
    doc.text(`Endereço: ${orcRow.Endereco || ''} - ${orcRow.Bairro || ''}`);
    doc.text(`Telefone: ${orcRow.Telefone || ''}`);
    doc.text(`Chassi: ${orcRow.Chassi || ''}`);
    doc.moveDown();

    // Table services
    doc.fontSize(11).text('Serviços / Peças:', { underline: true });
    doc.moveDown(0.5);

    servicos.forEach(s => {
      doc.text(`${s.Quantidade} x ${s.Descricao}${s.Descricao_Livre ? ' - ' + s.Descricao_Livre : ''}  |  Unit: R$ ${Number(s.Valor_Unitario).toFixed(2)}  |  Total: R$ ${Number(s.Valor_Total).toFixed(2)}`);
    });
    doc.moveDown(1);

    doc.fontSize(12).text(`Valor Total: R$ ${Number(orcRow.Valor_Total || 0).toFixed(2)}`, { align: 'right' });
    doc.moveDown(0.5);
    doc.fontSize(10).text('Condições de pagamento:');
    doc.text(`À vista: R$ ${Number(orcRow.Valor_A_Vista || 0).toFixed(2)}  |  A prazo: R$ ${Number(orcRow.Valor_A_Prazo || 0).toFixed(2)}  |  Forma: ${orcRow.Forma_Pagamento || ''}`);

    // QR code (se existir)
    if (orcRow.QR_Code_Pix) {
      const qrData = orcRow.QR_Code_Pix;
      const qrImgPath = path.join(__dirname, `../uploads/qr_${id}.png`);
      await QRCode.toFile(qrImgPath, qrData);
      doc.addPage();
      doc.image(qrImgPath, { fit: [250, 250], align: 'center' });
      fs.unlinkSync(qrImgPath);
    }

    // Signature (if present)
    if (orcRow.Assinatura_Cliente) {
      doc.addPage();
      // assinatura assumida como base64 data:image/png;base64,...
      const matches = orcRow.Assinatura_Cliente.match(/^data:image\/(png|jpeg);base64,(.+)$/);
      if (matches) {
        const buf = Buffer.from(matches[2], 'base64');
        doc.image(buf, 100, 150, { width: 300 });
      } else {
        doc.text('Assinatura disponível em anexo.');
      }
    }

    doc.end();
    doc.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
});

module.exports = router;
