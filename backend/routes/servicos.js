// backend/routes/servicos.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Add service to orcamento
router.post('/', async (req, res) => {
  try {
    const { ID_Orcamento, Descricao, Descricao_Livre, Quantidade, Valor_Unitario } = req.body;
    const Valor_Total = (parseFloat(Quantidade) || 0) * (parseFloat(Valor_Unitario) || 0);
    const [result] = await db.query(`INSERT INTO Servicos (ID_Orcamento, Descricao, Descricao_Livre, Quantidade, Valor_Unitario, Valor_Total) VALUES (?, ?, ?, ?, ?, ?)`,
      [ID_Orcamento, Descricao, Descricao_Livre || null, Quantidade || 1, Valor_Unitario || 0.00, Valor_Total]);
    const [[row]] = await db.query(`SELECT * FROM Servicos WHERE ID_Servico = ?`, [result.insertId]);

    // update orcamento total
    const [[ora]] = await db.query(`SELECT SUM(Valor_Total) as soma FROM Servicos WHERE ID_Orcamento = ?`, [ID_Orcamento]);
    await db.query(`UPDATE Orcamentos SET Valor_Total = ? WHERE ID_Orcamento = ?`, [ora.soma || 0.00, ID_Orcamento]);

    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar serviço' });
  }
});

// Update service
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { Quantidade, Valor_Unitario, Descricao_Livre } = req.body;
    const Valor_Total = (parseFloat(Quantidade) || 0) * (parseFloat(Valor_Unitario) || 0);
    await db.query(`UPDATE Servicos SET Quantidade=?, Valor_Unitario=?, Valor_Total=?, Descricao_Livre=? WHERE ID_Servico = ?`,
      [Quantidade, Valor_Unitario, Valor_Total, Descricao_Livre, id]);

    const [[s]] = await db.query(`SELECT * FROM Servicos WHERE ID_Servico = ?`, [id]);
    // update parent orcamento
    const [[ora]] = await db.query(`SELECT SUM(Valor_Total) as soma FROM Servicos WHERE ID_Orcamento = ?`, [s.ID_Orcamento]);
    await db.query(`UPDATE Orcamentos SET Valor_Total = ? WHERE ID_Orcamento = ?`, [ora.soma || 0.00, s.ID_Orcamento]);

    res.json(s);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar serviço' });
  }
});

// Delete service
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [[s]] = await db.query(`SELECT * FROM Servicos WHERE ID_Servico = ?`, [id]);
    await db.query(`DELETE FROM Servicos WHERE ID_Servico = ?`, [id]);
    if (s) {
      const [[ora]] = await db.query(`SELECT SUM(Valor_Total) as soma FROM Servicos WHERE ID_Orcamento = ?`, [s.ID_Orcamento]);
      await db.query(`UPDATE Orcamentos SET Valor_Total = ? WHERE ID_Orcamento = ?`, [ora.soma || 0.00, s.ID_Orcamento]);
    }
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar serviço' });
  }
});

module.exports = router;
