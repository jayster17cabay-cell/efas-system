// backend/controllers/authController.js

const db   = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
require('dotenv').config();

// POST /api/auth/login
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Kailangan ang email at password.' });
  }

  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Mali ang email o password.' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mali ang email o password.' });
    }

    // Kung driver, kuhanin din ang driver profile
    let driverInfo = null;
    if (user.role === 'driver') {
      const [driverRows] = await db.execute(
        'SELECT * FROM drivers WHERE user_id = ?',
        [user.id]
      );
      if (driverRows.length > 0) driverInfo = driverRows[0];
    }

    const token = jwt.sign(
      { id: user.id, full_name: user.full_name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id:        user.id,
        full_name: user.full_name,
        email:     user.email,
        role:      user.role,
        driver:    driverInfo
      }
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error. Subukan ulit.' });
  }
};

// POST /api/auth/change-password  (para sa logged-in user)
const changePassword = async (req, res) => {
  const { old_password, new_password } = req.body;
  const userId = req.user.id;

  if (!old_password || !new_password) {
    return res.status(400).json({ success: false, message: 'Kailangan ang lumang at bagong password.' });
  }
  if (new_password.length < 8) {
    return res.status(400).json({ success: false, message: 'Ang bagong password ay dapat hindi bababa sa 8 characters.' });
  }

  try {
    const [rows] = await db.execute('SELECT password_hash FROM users WHERE id = ?', [userId]);
    const isMatch = await bcrypt.compare(old_password, rows[0].password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mali ang lumang password.' });
    }

    const newHash = await bcrypt.hash(new_password, 10);
    await db.execute('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, userId]);

    res.json({ success: true, message: 'Password na-update!' });
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { login, changePassword };
