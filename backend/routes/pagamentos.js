// backend/routes/pagamentos.js
const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/', async (req, res) => {
  try {
    const { ID_Orcamento, Valor, Forma_Pagamento, Confirmado } = req.body;
    const [result] = await db.query(`INSERT INTO Pagamentos (ID_Orcamento, Valor, Forma_Pagamento, Confirmado) VALUES (?, ?, ?, ?)`,
      [ID_Orcamento, Valor || 0.00, Forma_Pagamento || 'Dinheiro', Confirmado ? 1 : 0]);
    const [[row]] = await db.query(`SELECT * FROM Pagamentos WHERE ID_Pagamento = ?`, [result.insertId]);
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao registrar pagamento' });
  }
});

module.exports = router;
