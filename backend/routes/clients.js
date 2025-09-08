// backend/routes/clients.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Create client
router.post('/', async (req, res) => {
  try {
    const { Nome, Endereco, Bairro, Telefone, Chassi } = req.body;
    const [result] = await db.query(
      `INSERT INTO Clientes (Nome, Endereco, Bairro, Telefone, Chassi) VALUES (?, ?, ?, ?, ?)`,
      [Nome, Endereco, Bairro, Telefone, Chassi]
    );
    const [rows] = await db.query(`SELECT * FROM Clientes WHERE ID_Cliente = ?`, [result.insertId]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// List / search clients
router.get('/', async (req, res) => {
  try {
    const q = req.query.q || '';
    const [rows] = await db.query(`SELECT * FROM Clientes WHERE Nome LIKE ? OR Telefone LIKE ? OR Chassi LIKE ? ORDER BY Data_Cadastro DESC`, [`%${q}%`, `%${q}%`, `%${q}%`]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Get single client with budgets
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const [[client]] = await db.query(`SELECT * FROM Clientes WHERE ID_Cliente = ?`, [id]);
    const [orc] = await db.query(`SELECT * FROM Orcamentos WHERE ID_Cliente = ? ORDER BY Data_Emissao DESC`, [id]);
    res.json({ client, orcamentos: orc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar cliente' });
  }
});

// Update client
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { Nome, Endereco, Bairro, Telefone, Chassi } = req.body;
    await db.query(`UPDATE Clientes SET Nome=?, Endereco=?, Bairro=?, Telefone=?, Chassi=? WHERE ID_Cliente=?`, [Nome, Endereco, Bairro, Telefone, Chassi, id]);
    const [[updated]] = await db.query(`SELECT * FROM Clientes WHERE ID_Cliente = ?`, [id]);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

// Delete client
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await db.query(`DELETE FROM Clientes WHERE ID_Cliente = ?`, [id]);
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar cliente' });
  }
});

module.exports = router;
