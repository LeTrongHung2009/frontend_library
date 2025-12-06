const Book = require('../models/Book');

// API: Lấy danh sách sách
// Route: GET /api/books
exports.getBooks = async (req, res) => {
  try {
    // ⚠️ SAI LẦM CHẾT NGƯỜI:
    // const books = await Book.find(); 
    // -> Dòng này sẽ lôi cổ tất cả sách của mọi trường ra.

    // ✅ CHUẨN BẢO MẬT:
    // req.user.id lấy từ middleware ở trên
    // Chỉ tìm những sách có 'owner' trùng với ID người đang gọi
    const books = await Book.find({ owner: req.user.id });
    
    res.json(books);
  } catch (err) {
    res.status(500).send("Lỗi Server");
  }
};

// API: Thêm sách mới
exports.createBook = async (req, res) => {
  try {
    const newBook = new Book({
      title: req.body.title,
      author: req.body.author,
      // ... các field khác
      
      // ✅ TỰ ĐỘNG GÁN CHỦ SỞ HỮU
      // Hacker không thể fake field này vì nó lấy từ Token (đã mã hóa)
      owner: req.user.id 
    });

    await newBook.save();
    res.json(newBook);
  } catch (err) {
    res.status(500).send("Lỗi Server");
  }
};