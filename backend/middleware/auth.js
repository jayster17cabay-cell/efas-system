// backend/middleware/auth.js
// Sinusuri ang JWT token sa bawat protected na route

const jwt = require('jsonwebtoken');
require('dotenv').config();

// Verify token — ginagamit sa lahat ng protected routes
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer <token>

  if (!token) {
    return res.status(401).json({ success: false, message: 'Walang token. Mag-login muna.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, full_name, email, role }
    next();
  } catch (err) {
    return res.status(403).json({ success: false, message: 'Invalid o expired na token. Mag-login ulit.' });
  }
};

// Role-based access — pwedeng gumamit ng array ng roles
// Halimbawa: requireRole(['superadmin','admin'])
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Kailangan ng role: ${roles.join(' o ')}.`
      });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
