// backend/server.js
// Entry point ng E.F.A.S. backend server

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const routes  = require('./routes/index');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────
app.use('/api', routes);

// Health check
app.get('/', (req, res) => {
  res.json({
    system:  'E.F.A.S. — Electronic Feedback and Accountability System',
    location: 'Solano, Nueva Vizcaya',
    status:  '✅ Server is running',
    port:    PORT
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

// ── Start server ─────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   E.F.A.S. Backend Server                ║');
  console.log('║   Solano, Nueva Vizcaya                  ║');
  console.log(`║   Running on http://localhost:${PORT}       ║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});
