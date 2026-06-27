// backend/controllers/driverController.js

const db     = require('../config/db');
const bcrypt = require('bcryptjs');
const QRCode = require('qrcode');
require('dotenv').config();

// GET /api/drivers  — kuhanin lahat ng drivers (admin/superadmin)
const getAllDrivers = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM v_driver_summary ORDER BY full_name');
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/drivers/:driverCode  — public endpoint, ginagamit pagkatapos ng QR scan
// Returns driver profile ONLY — walang location, walang private info
const getDriverByQR = async (req, res) => {
  const { driverCode } = req.params; // EFAS-DRV-2024-001

  try {
    const [rows] = await db.execute(
      `SELECT
         d.driver_code, d.plate_number, d.body_number,
         d.ltfrb_license, d.assigned_route, d.status,
         d.qr_code, d.date_enrolled,
         u.full_name,
         ROUND(COALESCE(AVG(r.stars), 0), 1) AS avg_rating,
         COUNT(DISTINCT r.id) AS total_ratings
       FROM drivers d
       JOIN users u ON u.id = d.user_id
       LEFT JOIN ratings r ON r.driver_id = d.id
       WHERE d.qr_code = ?
       GROUP BY d.id`,
      [driverCode]
    );

    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Driver hindi nahanap.' });
    }

    const driver = rows[0];

    // Kung suspended, ipaalam sa passenger
    if (driver.status === 'suspended') {
      return res.json({
        success: true,
        data: driver,
        warning: '⚠️ Ang driver na ito ay kasalukuyang SUSPENDED. Mangyaring mag-report sa admin.'
      });
    }

    // Log ng scan (para sa audit)
    const [driverRow] = await db.execute('SELECT id FROM drivers WHERE qr_code = ?', [driverCode]);
    if (driverRow.length > 0) {
      await db.execute(
        'INSERT INTO qr_scans (driver_id, device_info) VALUES (?, ?)',
        [driverRow[0].id, req.headers['user-agent'] || 'unknown']
      );
    }

    res.json({ success: true, data: driver });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// POST /api/drivers  — mag-enroll ng bagong driver (admin lang)
const enrollDriver = async (req, res) => {
  const {
    full_name, email, password,
    plate_number, body_number, ltfrb_license,
    contact_number, assigned_route, date_enrolled
  } = req.body;

  // Basic validation
  if (!full_name || !email || !password || !plate_number || !body_number || !ltfrb_license) {
    return res.status(400).json({ success: false, message: 'Kumpleto ang mga required fields.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Gumawa ng user account para sa driver
    const passwordHash = await bcrypt.hash(password, 10);
    const [userResult] = await conn.execute(
      'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, "driver")',
      [full_name, email, passwordHash]
    );
    const userId = userResult.insertId;

    // 2. Gumawa ng driver code at QR code
    const driverSeq   = String(userId).padStart(3, '0');
    const year        = new Date().getFullYear();
    const driverCode  = `DRV-${year}-${driverSeq}`;
    const qrCode      = `EFAS-${driverCode}`;

    // 3. I-save ang driver profile
    await conn.execute(
      `INSERT INTO drivers
         (user_id, driver_code, plate_number, body_number, ltfrb_license,
          contact_number, assigned_route, qr_code, date_enrolled, enrolled_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, driverCode, plate_number, body_number, ltfrb_license,
       contact_number, assigned_route, qrCode,
       date_enrolled || new Date().toISOString().split('T')[0],
       req.user.id]
    );

    await conn.commit();

    // 4. I-generate ang QR Code image (base64 PNG)
    const qrData = JSON.stringify({
      system:      'EFAS',
      qr_code:     qrCode,
      driver_code: driverCode,
      issued_by:   'Solano Tricycle Authority, Nueva Vizcaya'
    });
    const qrImage = await QRCode.toDataURL(qrData, {
      width: 400,
      margin: 2,
      color: { dark: '#1A4A8A', light: '#FFFFFF' }
    });

    res.status(201).json({
      success: true,
      message: `Driver na-enroll! QR Code: ${qrCode}`,
      data: { driverCode, qrCode, qrImage }
    });

  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ success: false, message: 'Duplicate entry — email, plate, o body number ay ginamit na.' });
    }
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  } finally {
    conn.release();
  }
};

// PATCH /api/drivers/:id/status  — suspend o i-activate ang driver (admin/superadmin)
const updateDriverStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'active' | 'inactive' | 'suspended'

  const allowed = ['active', 'inactive', 'suspended'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  try {
    await db.execute('UPDATE drivers SET status = ? WHERE id = ?', [status, id]);
    res.json({ success: true, message: `Driver status na-update sa "${status}".` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/drivers/:id/qr-image  — i-generate ulit ang QR image (admin)
const getQRImage = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.execute(
      'SELECT d.qr_code, u.full_name, d.plate_number FROM drivers d JOIN users u ON u.id=d.user_id WHERE d.id=?',
      [id]
    );
    if (rows.length === 0) return res.status(404).json({ success: false, message: 'Driver hindi nahanap.' });

    const { qr_code, full_name, plate_number } = rows[0];
    const qrData = JSON.stringify({
      system: 'EFAS', qr_code, driver: full_name, plate: plate_number,
      issued_by: 'Solano Tricycle Authority, Nueva Vizcaya'
    });
    const qrImage = await QRCode.toDataURL(qrData, {
      width: 400, margin: 2,
      color: { dark: '#1A4A8A', light: '#FFFFFF' }
    });

    res.json({ success: true, data: { qrCode: qr_code, qrImage, full_name, plate_number } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllDrivers, getDriverByQR, enrollDriver, updateDriverStatus, getQRImage };
