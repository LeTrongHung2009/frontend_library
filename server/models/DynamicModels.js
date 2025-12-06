const mongoose = require('mongoose');

// Schema cho Sách
const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  quantity: Number,
  available: Number
});

// Schema cho Mượn sách
const loanSchema = new mongoose.Schema({
  email: String,
  imageURL: String,
  bookId: { type: mongoose.Schema.Types.ObjectId }, // Lưu ID sách
  bookTitle: String, // Lưu tên để tiện truy vấn
  days: Number,
  borrowDate: { type: Date, default: Date.now },
  dueDate: Date,
  isReturned: { type: Boolean, default: false }
});

// Hàm helper để lấy Model dựa trên Library Code
const getTenantModel = (libraryCode, modelName) => {
  // Tên collection sẽ là: code_modelName (VD: LIB01_books)
  const collectionName = `${libraryCode}_${modelName}`.toLowerCase();
  
  // Kiểm tra xem model đã compile chưa để tránh lỗi OverwriteModelError
  if (mongoose.models[collectionName]) {
    return mongoose.models[collectionName];
  }

  const schema = modelName === 'books' ? bookSchema : loanSchema;
  return mongoose.model(collectionName, schema);
};

module.exports = { getTenantModel };