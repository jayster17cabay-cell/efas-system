// backend/routes/index.js
const express = require('express');
const router  = express.Router();
const { verifyToken, requireRole } = require('../middleware/auth');
const authCtrl   = require('../controllers/authController');
const driverCtrl = require('../controllers/driverController');
const { fileComplaint, getAllComplaints, updateComplaint,
        submitRating, getDriverRatings } = require('../controllers/complaintController');

// ── AUTH ────────────────────────────────────────────
router.post('/auth/login', authCtrl.login);
router.post('/auth/change-password', verifyToken, authCtrl.changePassword);

// ── DRIVER ──────────────────────────────────────────
// PUBLIC — QR scan (passenger)
router.get('/drivers/scan/:driverCode', driverCtrl.getDriverByQR);

// PROTECTED — admin/superadmin
router.get('/drivers', verifyToken, requireRole(['superadmin','admin']), driverCtrl.getAllDrivers);
router.post('/drivers', verifyToken, requireRole(['superadmin','admin']), driverCtrl.enrollDriver);
router.patch('/drivers/:id/status', verifyToken, requireRole(['superadmin','admin']), driverCtrl.updateDriverStatus);
router.get('/drivers/:id/qr-image', verifyToken, requireRole(['superadmin','admin']), driverCtrl.getQRImage);

// ── COMPLAINTS ──────────────────────────────────────
router.post('/complaints', fileComplaint);
router.get('/complaints', verifyToken, requireRole(['superadmin','admin']), getAllComplaints);
router.patch('/complaints/:id', verifyToken, requireRole(['superadmin','admin']), updateComplaint);

// ── RATINGS ─────────────────────────────────────────
router.post('/ratings', submitRating);
router.get('/ratings/driver/:driverCode', getDriverRatings);

// ── TRIPS ───────────────────────────────────────────
// STEP 1: Scan QR — pending trip (walang Trip ID pa)
router.post('/trips/scan', async (req, res) => {
  const db = require('../config/db');
  const { qr_code } = req.body;
  if (!qr_code) return res.status(400).json({ success: false, message: 'Kailangan ang qr_code.' });
  try {
    const [driverRows] = await db.execute(
      'SELECT id, assigned_route FROM drivers WHERE qr_code = ? AND status = "active"',
      [qr_code]
    );
    if (driverRows.length === 0) return res.status(404).json({ success: false, message: 'Driver hindi nahanap o hindi active.' });
    res.json({ success: true, message: 'Driver nahanap! Kumpirmahin ang pagsakay.', data: driverRows[0] });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// STEP 2: Boarding Confirmation — dito pa lang mag-create ng Trip ID
router.post('/trips/confirm-boarding', async (req, res) => {
  const db = require('../config/db');
  const { qr_code, destination } = req.body;
  if (!qr_code || !destination) return res.status(400).json({ success: false, message: 'Kailangan ang qr_code at destination.' });
  try {
    const [driverRows] = await db.execute(
      'SELECT id, assigned_route FROM drivers WHERE qr_code = ? AND status = "active"',
      [qr_code]
    );
    if (driverRows.length === 0) return res.status(404).json({ success: false, message: 'Driver hindi nahanap.' });

    const [tripResult] = await db.execute(
      `INSERT INTO trips 
        (driver_id, destination, origin, boarding_confirmed, confirmation_time, trip_status) 
       VALUES (?, ?, ?, 1, NOW(), 'active')`,
      [driverRows[0].id, destination, 'Passenger Location']
    );
    res.status(201).json({
      success: true,
      message: 'Boarding confirmed! Trip nagsimula!',
      data: { trip_id: tripResult.insertId, destination, authorized_route: driverRows[0].assigned_route }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// STEP 3: End Trip
router.patch('/trips/:id/end', async (req, res) => {
  const db = require('../config/db');
  try {
    await db.execute(
      'UPDATE trips SET trip_status = "completed", ended_at = NOW() WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Trip natapos!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── DRIVER CONCERNS ─────────────────────────────────
// Driver mag-submit ng concern
router.post('/concerns', verifyToken, requireRole(['driver']), async (req, res) => {
  const db = require('../config/db');
  const { concern_type, description } = req.body;
  if (!concern_type || !description) return res.status(400).json({ success: false, message: 'Kumpleto ang fields.' });
  try {
    const [driverRows] = await db.execute('SELECT id FROM drivers WHERE user_id = ?', [req.user.id]);
    if (driverRows.length === 0) return res.status(404).json({ success: false, message: 'Driver profile hindi nahanap.' });
    await db.execute(
      'INSERT INTO driver_concerns (driver_id, concern_type, description) VALUES (?, ?, ?)',
      [driverRows[0].id, concern_type, description]
    );
    res.status(201).json({ success: true, message: 'Concern na-submit! Tatanggap ng response ang admin.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Admin makita ang lahat ng driver concerns
router.get('/concerns', verifyToken, requireRole(['superadmin','admin']), async (req, res) => {
  const db = require('../config/db');
  try {
    const [rows] = await db.execute(
      `SELECT dc.*, u.full_name AS driver_name, d.plate_number, d.driver_code
       FROM driver_concerns dc
       JOIN drivers d ON d.id = dc.driver_id
       JOIN users u ON u.id = d.user_id
       ORDER BY dc.created_at DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// Admin mag-respond sa concern
router.patch('/concerns/:id', verifyToken, requireRole(['superadmin','admin']), async (req, res) => {
  const db = require('../config/db');
  const { status, admin_response } = req.body;
  try {
    await db.execute(
      'UPDATE driver_concerns SET status = ?, admin_response = ?, resolved_at = IF(? = "resolved", NOW(), NULL) WHERE id = ?',
      [status, admin_response, status, req.params.id]
    );
    res.json({ success: true, message: 'Concern na-update!' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ── STATS ───────────────────────────────────────────
router.get('/stats', verifyToken, requireRole(['superadmin','admin']), async (req, res) => {
  const db = require('../config/db');
  try {
    const [[{ total_drivers }]]    = await db.execute('SELECT COUNT(*) AS total_drivers FROM drivers');
    const [[{ active_drivers }]]   = await db.execute('SELECT COUNT(*) AS active_drivers FROM drivers WHERE status="active"');
    const [[{ total_complaints }]] = await db.execute('SELECT COUNT(*) AS total_complaints FROM complaints');
    const [[{ new_complaints }]]   = await db.execute('SELECT COUNT(*) AS new_complaints FROM complaints WHERE status="new"');
    const [[{ new_concerns }]]     = await db.execute('SELECT COUNT(*) AS new_concerns FROM driver_concerns WHERE status="new"');
    const [[{ scans_today }]]      = await db.execute('SELECT COUNT(*) AS scans_today FROM qr_scans WHERE DATE(scanned_at)=CURDATE()');
    res.json({ success: true, data: { total_drivers, active_drivers, total_complaints, new_complaints, new_concerns, scans_today } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

module.exports = router;