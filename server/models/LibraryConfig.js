const mongoose = require('mongoose');

const LibraryConfigSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Link tới ông Admin nào
  schoolName: String,     // Ví dụ: THPT Nguyễn Du
  libraryCode: {          // CÁI CODE QUAN TRỌNG NHẤT
    type: String, 
    unique: true, 
    required: true 
  }, 
  // Ví dụ Code: "ND-2024" hoặc 1 chuỗi ngẫu nhiên "X8K9L"
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('LibraryConfig', LibraryConfigSchema);