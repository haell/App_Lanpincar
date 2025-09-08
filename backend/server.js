// backend/server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const multer = require('multer');

const clientsRouter = require('./routes/clients');
const orcamentosRouter = require('./routes/orcamentos');
const servicosRouter = require('./routes/servicos');
const pagamentosRouter = require('./routes/pagamentos');
const settingsRouter = require('./routes/settings');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/clients', clientsRouter);
app.use('/api/orcamentos', orcamentosRouter);
app.use('/api/servicos', servicosRouter);
app.use('/api/pagamentos', pagamentosRouter);
app.use('/api/settings', settingsRouter);

// Simple healthcheck
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
