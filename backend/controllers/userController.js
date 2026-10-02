const bcrypt = require('bcryptjs');
const { dbStore } = require('../utils/dbStore');
const { logAction } = require('../utils/auditLogger');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getUsers = async (req, res) => {
  try {
    const users = dbStore.collection('users').find().toArray();
    // Exclude password
    const safeUsers = users.map(({ password, ...u }) => u);

    res.json({ success: true, count: safeUsers.length, users: safeUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

// @desc    Create new user
// @route   POST /api/users
// @access  Private (Admin)
const createUser = async (req, res) => {
  try {
    const { name, email, phone, role, password, department } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: 'Name, email, password, and role are required' });
    }

    const existing = dbStore.collection('users').findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = dbStore.collection('users').create({
      name,
      email: email.toLowerCase(),
      phone: phone || '',
      password: hashedPassword,
      role,
      department: department || 'Operations',
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    });

    await logAction({
      action: `Created user ${name} with role ${role}`,
      module: 'AUTH',
      user: req.user ? req.user.name : 'Admin',
      role: req.user ? req.user.role : 'Admin'
    });

    const { password: _, ...safeUser } = newUser;
    res.status(201).json({ success: true, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error creating user' });
  }
};

// @desc    Update user status or role
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { role, status, department } = req.body;

    const updated = dbStore.collection('users').findByIdAndUpdate(id, {
      ...(role && { role }),
      ...(status && { status }),
      ...(department && { department })
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await logAction({
      action: `Updated user ${updated.name} (Role: ${updated.role}, Status: ${updated.status})`,
      module: 'AUTH',
      user: req.user ? req.user.name : 'Admin',
      role: req.user ? req.user.role : 'Admin'
    });

    const { password, ...safeUser } = updated;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating user' });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser
};
