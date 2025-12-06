const router = require('express').Router();
const Borrow = require('../models/Borrow');
const User = require('../models/User');
const Book = require('../models/Book'); 
const verify = require('../middleware/verifyToken');

// --- HÀM HELPER: Lấy mã thư viện từ User ID (Token) ---
const getLibraryCode = async (userId) => {
    if (!userId) throw new Error("Token lỗi: Không tìm thấy ID.");
    const user = await User.findById(userId);
    
    if (!user) throw new Error("Người dùng không tồn tại. Vui lòng Đăng nhập lại.");
    if (!user.libraryCode) throw new Error("Tài khoản lỗi: Chưa có Mã thư viện.");
    
    return user.libraryCode;
};

// 1. LẤY DANH SÁCH MƯỢN
router.get('/', verify, async (req, res) => {
    try {
        const libraryCode = await getLibraryCode(req.user.id);
        const borrows = await Borrow.find({ libraryCode })
            .populate('books') 
            .sort({ borrowDate: -1 });
        res.json(borrows);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// 2. TẠO PHIẾU MƯỢN MỚI (ĐÃ SỬA LỖI ID)
router.post('/', verify, async (req, res) => {
    try {
        // 1. Lấy libraryCode từ TOKEN (để biết mượn ở thư viện nào)
        const libraryCode = await getLibraryCode(req.user.id);
        
        // 2. Lấy thông tin phiếu mượn từ BODY (Dữ liệu người dùng nhập)
        // QUAN TRỌNG: studentId ở đây là chuỗi người dùng nhập vào form
        const { studentName, studentId, studentEmail, image, dueDate, bookIds } = req.body;

        // Validation cơ bản
        if (!bookIds || bookIds.length === 0) {
            return res.status(400).json({ message: "Vui lòng chọn ít nhất 1 cuốn sách!" });
        }
        if (!studentId) {
            return res.status(400).json({ message: "Vui lòng nhập Mã số (ID/MSSV)!" });
        }

        // 3. Tạo phiếu mượn
        const newBorrow = new Borrow({
            studentName,
            studentId, // <--- SỬ DỤNG BIẾN TỪ BODY (Đã fix lỗi)
            studentEmail,
            image,
            dueDate,
            books: bookIds,
            libraryCode // <--- Mã thư viện lấy từ Token admin
        });

        const savedBorrow = await newBorrow.save();

        // 4. Cập nhật trạng thái sách thành "Đang mượn"
        await Book.updateMany(
            { _id: { $in: bookIds } }, 
            { $set: { status: 'Đang mượn' } } 
        );

        await savedBorrow.populate('books');
        res.json(savedBorrow);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 3. TRẢ SÁCH
router.put('/:id/return', verify, async (req, res) => {
    try {
        const libraryCode = await getLibraryCode(req.user.id);
        
        // Tìm và cập nhật phiếu mượn
        const updatedBorrow = await Borrow.findOneAndUpdate(
            { _id: req.params.id, libraryCode: libraryCode },
            { $set: { status: 'returned' } },
            { new: true }
        );

        if (!updatedBorrow) return res.status(404).json({ message: "Không tìm thấy phiếu mượn!" });

        // Trả lại trạng thái "Sẵn sàng" cho sách
        if (updatedBorrow.books && updatedBorrow.books.length > 0) {
            await Book.updateMany(
                { _id: { $in: updatedBorrow.books } },
                { $set: { status: 'Sẵn sàng' } }
            );
        }

        res.json(updatedBorrow);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// 4. XÓA PHIẾU MƯỢN
router.delete('/:id', verify, async (req, res) => {
    try {
        const libraryCode = await getLibraryCode(req.user.id);
        
        const deletedBorrow = await Borrow.findOneAndDelete({ 
            _id: req.params.id, libraryCode: libraryCode 
        });

        if (!deletedBorrow) return res.status(404).json({ message: "Không tìm thấy phiếu xóa!" });

        // Reset sách về "Sẵn sàng" nếu xóa phiếu đang mượn
        if (deletedBorrow.status === 'borrowing' && deletedBorrow.books && deletedBorrow.books.length > 0) {
            await Book.updateMany(
                { _id: { $in: deletedBorrow.books } },
                { $set: { status: 'Sẵn sàng' } }
            );
        }

        res.json({ message: "Đã xóa thành công" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;