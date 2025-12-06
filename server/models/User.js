const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  schoolName: { 
    type: String, 
    required: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: { 
    type: String, 
    required: true 
  },
  // --- QUAN TRỌNG: Mã định danh trường học ---
  libraryCode: { 
    type: String, 
    required: true, // Bắt buộc phải có
    unique: true    // Không được trùng nhau giữa các trường
  },
  role: { 
    type: String, 
    default: 'admin' 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});

module.exports = mongoose.model('User', UserSchema);