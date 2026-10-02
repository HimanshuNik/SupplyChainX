const jwt = require('jsonwebtoken');
const { dbStore } = require('../utils/dbStore');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supplychainx_secret_key_college_major_project_2026');

      if (getIsConnected()) {
        req.user = await User.findById(decoded.id).select('-password');
      } else {
        const u = dbStore.collection('users').findById(decoded.id);
        if (u) {
          const { password, ...rest } = u;
          req.user = rest;
        }
      }

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found or token invalid' });
      }

      next();
    } catch (error) {
      console.error('Auth error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role) && req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user ? req.user.role : 'Guest'}' is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
