// backend/routes/index.js
// Lahat ng API routes ng EFAS

const express = require('express');
const router  = express.Router();

const { verifyToken, requireRole } = require('../middleware/auth');

// Controllers
const authCtrl      = require('../controllers/authController');
const driverCtrl    = require('../controllers/driverController');
const { fileComplaint, getAllComplaints, updateComplaint,
        submitRating, getDriverRatings } = require('../controllers/complaintController');

// ============================================================
// AUTH ROUTES
// ============================================================
// POST /api/auth/login
router.post('/auth/login', authCtrl.login);

// POST /api/auth/change-password  (login required)
router.post('/auth/change-password', verifyToken, authCtrl.changePassword);

// ============================================================
// DRIVER ROUTES
// ============================================================

// PUBLIC — ginagamit ng passenger pagkatapos mag-scan ng QR
// GET /api/drivers/scan/:driverCode
router.get('/drivers/scan/:driverCode', driverCtrl.getDriverByQR);

// PROTECTED — admin/superadmin only
// GET /api/drivers
router.get('/drivers',
  verifyToken,
  requireRole(['superadmin','admin']),
  driverCtrl.getAllDrivers
);

// POST /api/drivers  — mag-enroll ng bagong driver
router.post('/drivers',
  verifyToken,
  requireRole(['superadmin','admin']),
  driverCtrl.enrollDriver
);

// PATCH /api/drivers/:id/status  — suspend/activate
router.patch('/drivers/:id/status',
  verifyToken,
  requireRole(['superadmin','admin']),
  driverCtrl.updateDriverStatus
);

// GET /api/drivers/:id/qr-image  — i-regenerate ang QR image
router.get('/drivers/:id/qr-image',
  verifyToken,
  requireRole(['superadmin','admin']),
  driverCtrl.getQRImage
);

// ============================================================
// COMPLAINT ROUTES
// ============================================================

// PUBLIC — pwede kahit walang login (para sa passenger)
// POST /api/complaints
router.post('/complaints', fileComplaint);

// PROTECTED — admin/superadmin lang
// GET /api/complaints?status=new
router.get('/complaints',
  verifyToken,
  requireRole(['superadmin','admin']),
  getAllComplaints
);

// PATCH /api/complaints/:id
router.patch('/complaints/:id',
  verifyToken,
  requireRole(['superadmin','admin']),
  updateComplaint
);

// ============================================================
// RATING ROUTES
// ============================================================

// PUBLIC — passenger pwedeng mag-rate kahit walang login
// POST /api/ratings
router.post('/ratings', submitRating);

// GET /api/ratings/driver/:driverCode
router.get('/ratings/driver/:driverCode', getDriverRatings);

// ============================================================
// TRIP ROUTES
// ============================================================

// POST /api/trips/start  — mag-simula ng trip (public, QR scan)
router.post('/trips/start', async (req, res) => {
  const db = require('../config/db');
  const { qr_code, destination } = req.body;

  if (!qr_code || !destination) {
    return res.status(400).json({ success: false, message: 'Kailangan ang qr_code at destination.' });
  }

  try {
    const [driverRows] = await db.execute(
      'SELECT id, assigned_route FROM drivers WHERE qr_code = ? AND status = "active"',
      [qr_code]
    );
    if (driverRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Driver hindi nahanap o hindi active.' });
    }

    const driver = driverRows[0];
    const [tripResult] = await db.execute(
      'INSERT INTO trips (driver_id, destination, origin) VALUES (?, ?, ?)',
      [driver.id, destination, 'Passenger Location']
    );

    res.status(201).json({
      success: true,
      message: 'Trip nagsimula!',
      data: {
        trip_id:        tripResult.insertId,
        authorized_route: driver.assigned_route,
        destination
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// PATCH /api/trips/:id/end  — tapusin ang trip
router.patch('/trips/:id/end', async (req, res) => {
  const db = require('../config/db');
  try {
    await db.execute(
      'UPDATE trips SET status = "completed", ended_at = NOW() WHERE id = ?',
      [req.params.id]
    );
    res.json({ success: true, message: 'Trip natapos!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
});

// ============================================================
// DASHBOARD STATS — superadmin/admin
// GET /api/stats
// ============================================================
router.get('/stats',
  verifyToken,
  requireRole(['superadmin','admin']),
  async (req, res) => {
    const db = require('../config/db');
    try {
      const [[{ total_drivers }]]   = await db.execute('SELECT COUNT(*) AS total_drivers FROM drivers');
      const [[{ active_drivers }]]  = await db.execute('SELECT COUNT(*) AS active_drivers FROM drivers WHERE status="active"');
      const [[{ total_complaints }]]= await db.execute('SELECT COUNT(*) AS total_complaints FROM complaints');
      const [[{ new_complaints }]]  = await db.execute('SELECT COUNT(*) AS new_complaints FROM complaints WHERE status="new"');
      const [[{ scans_today }]]     = await db.execute('SELECT COUNT(*) AS scans_today FROM qr_scans WHERE DATE(scanned_at)=CURDATE()');

      res.json({
        success: true,
        data: { total_drivers, active_drivers, total_complaints, new_complaints, scans_today }
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Server error.' });
    }
  }
);

module.exports = router;
