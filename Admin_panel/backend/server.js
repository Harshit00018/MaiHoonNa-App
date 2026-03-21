require('dotenv').config();

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/zones', require('./routes/zones'));
app.use('/api/users', require('./routes/users'));
app.use('/api/callbacks', require('./routes/callbacks'));
app.use('/api/teams', require('./routes/teams'));
app.use('/api/subscribers', require('./routes/subscribers'));
app.use('/api/beneficiaries', require('./routes/beneficiaries'));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'Admin Panel Backend running', port: PORT, time: new Date() });
});

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.path} not found` });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`🚀 Admin Panel Backend running on http://localhost:${PORT}`);
    console.log(`📌 Zones API: http://localhost:${PORT}/api/zones`);
});
