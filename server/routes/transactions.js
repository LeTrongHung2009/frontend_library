const router = require('express').Router();
const Transaction = require('../models/Transaction');
const Book = require('../models/Book');
const User = require('../models/User');
const verify = require('../middleware/verifyToken'); // Middleware xác thực Admin

// 1. LẤY DANH SÁCH MƯỢN TRẢ (Của riêng trường Admin đó)
router.get('/', verify, async (req, res) => {
    try {
        // Tìm Admin để lấy mã trường
        const user = await User.findById(req.user.id);
        
        // Tìm tất cả giao dịch có mã trường tương ứng
        // .populate('bookId') để lấy chi tiết tên sách, ảnh bìa từ ID sách
        const transactions = await Transaction.find({ libraryCode: user.libraryCode })
            .populate('bookId') 
            .sort({ borrowDate: -1 }); // Mới nhất lên đầu

        res.json(transactions);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. ADMIN XÁC NHẬN TRẢ SÁCH
router.post('/return', verify, async (req, res) => {
    try {
        const { transactionId, bookId } = req.body;

        // Cập nhật giao dịch thành Đã trả
        await Transaction.findByIdAndUpdate(transactionId, { 
            isReturned: true,
            returnDate: new Date()
        });

        // Cập nhật sách thành Sẵn sàng
        await Book.findByIdAndUpdate(bookId, { status: 'Sẵn sàng' });

        res.json({ message: "Xác nhận trả sách thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// DELETE transaction
router.delete("/:id", verify, async (req, res) => {
  try {
    const id = req.params.id;

    // Kiểm tra tồn tại
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ message: "Không tìm thấy giao dịch." });
    }

    // Chỉ cho phép xóa giao dịch ĐÃ TRẢ
    if (!transaction.isReturned) {
      return res.status(400).json({ message: "Chỉ có thể xóa giao dịch đã trả." });
    }

    await Transaction.findByIdAndDelete(id);

    return res.json({ message: "Đã xóa giao dịch thành công." });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Lỗi server." });
  }
});

module.exports = router;