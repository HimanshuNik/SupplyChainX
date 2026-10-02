const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { dbStore } = require('../utils/dbStore');
const User = require('../models/User');
const { getIsConnected } = require('../config/db');
const { logAction } = require('../utils/auditLogger');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'supplychainx_secret_key_college_major_project_2026', {
    expiresIn: '30d'
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const assignedRole = role || 'Inventory Manager';

    if (getIsConnected()) {
      const userExists = await User.findOne({ email: email.toLowerCase() });
      if (userExists) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        password,
        role: assignedRole
      });

      await logAction({
        action: `User registered: ${name}`,
        module: 'AUTH',
        user: name,
        role: assignedRole,
        details: { email }
      });

      return res.status(201).json({
        success: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatar: user.avatar
        },
        token: generateToken(user._id)
      });
    } else {
      const usersCol = dbStore.collection('users');
      const existing = usersCol.findOne({ email: email.toLowerCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'User already exists with this email' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = usersCol.create({
        name,
        email: email.toLowerCase(),
        phone: phone || '',
        password: hashedPassword,
        role: assignedRole,
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
      });

      await logAction({
        action: `User registered: ${name}`,
        module: 'AUTH',
        user: name,
        role: assignedRole,
        details: { email }
      });

      return res.status(201).json({
        success: true,
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          avatar: newUser.avatar
        },
        token: generateToken(newUser._id)
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    let user;
    let isMatch = false;

    if (getIsConnected()) {
      user = await User.findOne({ email: email.toLowerCase() });
      if (user) {
        isMatch = await user.comparePassword(password);
      }
    } else {
      user = dbStore.collection('users').findOne({ email: email.toLowerCase() });
      if (user) {
        isMatch = await bcrypt.compare(password, user.password);
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status === 'Inactive') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated. Contact Admin.' });
    }

    await logAction({
      action: `User logged in`,
      module: 'AUTH',
      user: user.name,
      role: user.role,
      details: { email: user.email }
    });

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatar: user.avatar,
        department: user.department
      },
      token: generateToken(user._id)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching user profile' });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, avatar } = req.body;
    let updated;

    if (getIsConnected()) {
      updated = await User.findByIdAndUpdate(
        req.user._id,
        { name, phone, department, avatar },
        { new: true }
      ).select('-password');
    } else {
      updated = dbStore.collection('users').findByIdAndUpdate(req.user._id || req.user.id, {
        name,
        phone,
        department,
        avatar
      });
      delete updated.password;
    }

    await logAction({
      action: `Profile updated`,
      module: 'SETTINGS',
      user: req.user.name,
      role: req.user.role
    });

    res.json({ success: true, user: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};

// @desc    Get demo accounts for quick switch
// @route   GET /api/auth/demo-accounts
// @access  Public
const getDemoAccounts = (req, res) => {
  res.json({
    success: true,
    accounts: [
      { role: 'Admin', name: 'Rahul Sharma', email: 'admin@supplychainx.com', password: 'admin123', tag: 'Full Control & Approvals' },
      { role: 'Inventory Manager', name: 'Amit Verma', email: 'amit@supplychainx.com', password: 'manager123', tag: 'Warehouses & Stock Transfers' },
      { role: 'Purchase Manager', name: 'Vikram Singh', email: 'vikram@supplychainx.com', password: 'purchase123', tag: 'Suppliers & PO Receiving' },
      { role: 'Sales Manager', name: 'Priya Patel', email: 'priya@supplychainx.com', password: 'sales123', tag: 'Customers & Orders' }
    ]
  });
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
  getDemoAccounts
};
