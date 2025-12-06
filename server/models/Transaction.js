const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  // --- CÁC TRƯỜNG QUAN TRỌNG PHẢI CÓ ---
  libraryCode: { type: String, required: true, index: true }, // Mã thư viện
  studentName: { type: String, required: true },
  studentId: { type: String, required: true, index: true },   // Mã học sinh (QUAN TRỌNG)
  studentEmail: String,
  
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
  bookTitle: String, // Lưu tên sách để hiển thị nhanh
  
  borrowDate: { type: Date, default: Date.now },
  dueDate: Date,
  returnDate: Date,
  
  idCardImage: String, // Ảnh chụp thẻ (Base64)
  isReturned: { type: Boolean, default: false }
});

module.exports = mongoose.model('Transaction', TransactionSchema);