const router = require('express').Router();
const Book = require('../models/Book');
const Transaction = require('../models/Transaction');
const User = require('../models/User');
const verify = require('../middleware/verifyToken'); // Nhớ import cái này

// Thêm middleware 'verify' vào dòng này
router.get('/stats', verify, async (req, res) => { 
    try {
        // 1. Tìm User đang đăng nhập để lấy Mã thư viện (Library Code)
        const user = await User.findById(req.user.id);
        const code = user.libraryCode;

        // 2. Chỉ đếm sách có libraryCode trùng với Admin này
        const totalBooks = await Book.countDocuments({ libraryCode: code });

        // 3. Đếm các thông số khác theo Code
        const activeBorrows = await Transaction.countDocuments({ libraryCode: code, isReturned: false });
        const overdue = await Transaction.countDocuments({ libraryCode: code, isReturned: false, dueDate: { $lt: new Date() } });

        // Sách mới trong 7 ngày
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newBooks = await Book.countDocuments({ libraryCode: code, createdAt: { $gte: sevenDaysAgo } });

        res.json({
            totalBooks,
            activeBorrows,
            overdue,
            newBooks
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;