// backend/routes/settings.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, 'logo' + Date.now() + ext);
  }
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    const [[row]] = await db.query(`SELECT * FROM Settings WHERE id = 1`);
    res.json(row);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar settings' });
  }
});

router.put('/', upload.single('logo'), async (req, res) => {
  try {
    const { nome_oficina, telefone, email, endereco, pix_key, preferencias_impressao } = req.body;
    let logo_path = null;
    if (req.file) logo_path = `/uploads/${req.file.filename}`;

    const [[cur]] = await db.query(`SELECT * FROM Settings WHERE id =1`);
    const newLogo = logo_path || cur.logo_path;

    await db.query(
      `UPDATE Settings SET nome_oficina=?, telefone=?, email=?, endereco=?, pix_key=?, preferencias_impressao=?, logo_path=? WHERE id=1`,
      [nome_oficina || cur.nome_oficina, telefone || cur.telefone, email || cur.email, endereco || cur.endereco, pix_key || cur.pix_key, preferencias_impressao || cur.preferencias_impressao, newLogo]
    );
    const [[updated]] = await db.query(`SELECT * FROM Settings WHERE id = 1`);
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar settings' });
  }
});

module.exports = router;
