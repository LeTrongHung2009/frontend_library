const router = require('express').Router();
const Book = require('../models/Book');
const User = require('../models/User');
const verify = require('../middleware/verifyToken');

// --- HÀM HELPER AN TOÀN ---
const getLibraryCode = async (userId) => {
    // 1. Kiểm tra User ID
    if (!userId) throw new Error("Token lỗi: Không tìm thấy ID.");

    // 2. Tìm User trong DB
    const user = await User.findById(userId);
    
    // --- KHẮC PHỤC LỖI CRASH TẠI ĐÂY ---
    if (!user) {
        throw new Error("Người dùng không tồn tại (Do Database đã reset). Vui lòng Đăng xuất và Đăng nhập lại.");
    }

    if (!user.libraryCode) {
        throw new Error("Tài khoản chưa có Mã thư viện. Hãy tạo tài khoản mới.");
    }
    
    return user.libraryCode;
};

// 1. Lấy danh sách sách
router.get('/', verify, async (req, res) => {
    try {
        const libraryCode = await getLibraryCode(req.user.id);
        const books = await Book.find({ libraryCode }).sort({ createdAt: -1 });
        res.json(books);
    } catch (err) {
        console.error("Lỗi GET Books:", err.message);
        // Trả về 404 hoặc 500 để Frontend biết đường xử lý
        res.status(500).json({ message: err.message });
    }
});

// 2. Thêm sách mới
router.post('/', verify, async (req, res) => {
    try {
        const libraryCode = await getLibraryCode(req.user.id);
        const newBook = new Book({
            title: req.body.title,
            author: req.body.author,
            category: req.body.category,
            image: req.body.image,
            libraryCode: libraryCode
        });
        const savedBook = await newBook.save();
        res.json(savedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. Sửa sách
router.put('/:id', verify, async (req, res) => {
    try {
        const libraryCode = await getLibraryCode(req.user.id);
        const updatedBook = await Book.findOneAndUpdate(
            { _id: req.params.id, libraryCode: libraryCode },
            { $set: req.body },
            { new: true }
        );
        if (!updatedBook) return res.status(404).json({ message: "Không tìm thấy sách!" });
        res.json(updatedBook);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. Xóa sách
router.delete('/:id', verify, async (req, res) => {
    try {
        const libraryCode = await getLibraryCode(req.user.id);
        const deletedBook = await Book.findOneAndDelete({ 
            _id: req.params.id, 
            libraryCode: libraryCode 
        });
        if (!deletedBook) return res.status(404).json({ message: "Không tìm thấy sách!" });
        res.json({ message: "Đã xóa thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;