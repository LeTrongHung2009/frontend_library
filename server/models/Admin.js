// server/models/Admin.js
const mongoose = require('mongoose');
module.exports = mongoose.model('Admin', new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}));