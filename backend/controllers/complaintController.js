// backend/controllers/complaintController.js

const db = require('../config/db');

// POST /api/complaints  — mag-file ng complaint (public, kahit walang account)
const fileComplaint = async (req, res) => {
  const {
    qr_code,          // QR code ng driver na na-scan
    complaint_type,
    description,
    incident_date,
    incident_time,
    contact_number
  } = req.body;

  if (!qr_code || !complaint_type || !description || !incident_date) {
    return res.status(400).json({ success: false, message: 'Kumpleto ang required fields.' });
  }

  const validTypes = ['rude_behavior','wrong_route','overcharging','unsafe_driving','other'];
  if (!validTypes.includes(complaint_type)) {
    return res.status(400).json({ success: false, message: 'Invalid complaint type.' });
  }

  try {
    // Hanapin ang driver sa pamamagitan ng QR code
    const [driverRows] = await db.execute(
      'SELECT id FROM drivers WHERE qr_code = ?',
      [qr_code]
    );
    if (driverRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Driver hindi nahanap.' });
    }
    const driverId = driverRows[0].id;

    await db.execute(
      `INSERT INTO complaints
         (driver_id, complaint_type, description, incident_date, incident_time, contact_number)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [driverId, complaint_type, description, incident_date, incident_time || null, contact_number || null]
    );

    res.status(201).json({
      success: true,
      message: 'Natanggap ang iyong complaint. Ipoproseso ng admin sa loob ng 3 araw na trabaho.'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/complaints  — lahat ng complaints (admin/superadmin)
const getAllComplaints = async (req, res) => {
  const { status } = req.query; // optional filter
  try {
    let query = `
      SELECT c.*, u.full_name AS driver_name, d.plate_number, d.driver_code
      FROM complaints c
      JOIN drivers d ON d.id = c.driver_id
      JOIN users   u ON u.id = d.user_id
    `;
    const params = [];
    if (status) { query += ' WHERE c.status = ?'; params.push(status); }
    query += ' ORDER BY c.created_at DESC';

    const [rows] = await db.execute(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// PATCH /api/complaints/:id  — i-update ang status ng complaint (admin/superadmin)
const updateComplaint = async (req, res) => {
  const { id } = req.params;
  const { status, resolution_notes } = req.body;

  const allowed = ['new','under_review','resolved','dismissed'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status.' });
  }

  try {
    await db.execute(
      `UPDATE complaints SET
         status = ?,
         resolution_notes = ?,
         resolved_by = ?,
         resolved_at = IF(? IN ('resolved','dismissed'), NOW(), NULL)
       WHERE id = ?`,
      [status, resolution_notes || null, req.user.id, status, id]
    );
    res.json({ success: true, message: 'Complaint na-update.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { fileComplaint, getAllComplaints, updateComplaint };


// ============================================================
// backend/controllers/ratingController.js
// ============================================================

// POST /api/ratings  — mag-rate ng driver (public)
const submitRating = async (req, res) => {
  const { qr_code, trip_id, stars, comment } = req.body;

  if (!qr_code || !stars) {
    return res.status(400).json({ success: false, message: 'Kailangan ang qr_code at stars.' });
  }
  if (stars < 1 || stars > 5) {
    return res.status(400).json({ success: false, message: 'Rating ay 1 hanggang 5 stars lamang.' });
  }

  try {
    const [driverRows] = await db.execute('SELECT id FROM drivers WHERE qr_code = ?', [qr_code]);
    if (driverRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Driver hindi nahanap.' });
    }

    const passengerToken = 'anon-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);

    await db.execute(
      'INSERT INTO ratings (driver_id, trip_id, stars, comment, passenger_token) VALUES (?, ?, ?, ?, ?)',
      [driverRows[0].id, trip_id || null, stars, comment || null, passengerToken]
    );

    res.status(201).json({ success: true, message: 'Salamat sa iyong rating!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// GET /api/ratings/driver/:driverCode  — ratings ng isang driver
const getDriverRatings = async (req, res) => {
  const { driverCode } = req.params;
  try {
    const [rows] = await db.execute(
      `SELECT r.stars, r.comment, r.created_at
       FROM ratings r
       JOIN drivers d ON d.id = r.driver_id
       WHERE d.qr_code = ?
       ORDER BY r.created_at DESC
       LIMIT 20`,
      [driverCode]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { fileComplaint, getAllComplaints, updateComplaint, submitRating, getDriverRatings };
