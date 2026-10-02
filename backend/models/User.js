const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, default: '' },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['Admin', 'Inventory Manager', 'Purchase Manager', 'Sales Manager'], 
    default: 'Inventory Manager' 
  },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  avatar: { type: String, default: '' },
  department: { type: String, default: 'Operations' }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
