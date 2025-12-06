const express = require('express');
const router = express.Router();
const LibraryCode = require('../models/LibraryCode');
const { getTenantModel } = require('../models/DynamicModels');
const multer = require('multer');
const path = require('path');

// Cấu hình upload ảnh
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, 'loan-' + Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// Middleware check library code từ cookie hoặc body
const checkLibCode = async (req, res, next) => {
  const code = req.cookies.libraryCode || req.body.libraryCode || req.query.libraryCode;
  if (!code) return res.status(400).json({ msg: 'Missing Library Code' });
  req.libraryCode = code;
  next();
};

// 1. Lấy danh sách sách (Public cho client đã nhập code)
router.get('/books', checkLibCode, async (req, res) => {
  try {
    const BookModel = getTenantModel(req.libraryCode, 'books');
    const books = await BookModel.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Đăng ký mượn (Upload ảnh + Lưu DB)
router.post('/borrow', upload.single('idCard'), checkLibCode, async (req, res) => {
  try {
    const { email, bookId, days } = req.body;
    const file = req.file;

    if (!file) return res.status(400).json({ msg: 'No image uploaded' });

    const BookModel = getTenantModel(req.libraryCode, 'books');
    const LoanModel = getTenantModel(req.libraryCode, 'loans');

    const book = await BookModel.findById(bookId);
    if (!book || book.available < 1) return res.status(400).json({ msg: 'Book not available' });

    // Tính ngày trả
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + parseInt(days));

    const newLoan = new LoanModel({
      email,
      imageURL: `/uploads/${file.filename}`,
      bookId: book._id,
      bookTitle: book.title,
      days,
      dueDate
    });

    await newLoan.save();

    // Giảm số lượng sách
    book.available -= 1;
    await book.save();

    res.json({ msg: 'Borrow registered successfully', loan: newLoan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Admin: Tạo sách mới cho thư viện
router.post('/add-book', async (req, res) => {
    const { libraryCode, title, author, quantity } = req.body;
    const BookModel = getTenantModel(libraryCode, 'books');
    await BookModel.create({ title, author, quantity, available: quantity });
    res.json({ msg: 'Book added' });
});

module.exports = router;