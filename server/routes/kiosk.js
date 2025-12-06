const router = require('express').Router();
const User = require('../models/User');
const Book = require('../models/Book');
// --- SỬA: Dùng model Borrow thay vì Transaction ---
const Borrow = require('../models/Borrow'); 
const checkLibraryCode = require('../middleware/checkLibraryCode');


/* -------------------------------------------------------
   1. API KÍCH HOẠT MÁY (Giữ nguyên)
--------------------------------------------------------- */
router.post('/verify-code', async (req, res) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ message: "Vui lòng nhập mã!" });

        const admin = await User.findOne({ libraryCode: code.trim() });
        if (!admin) return res.status(404).json({ message: "Mã thư viện không tồn tại!" });

        res.json({
            valid: true,
            schoolName: admin.schoolName,
            libraryCode: admin.libraryCode
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/* -------------------------------------------------------
   2. API LẤY DANH SÁCH SÁCH (Giữ nguyên)
--------------------------------------------------------- */
router.get('/books/:code', checkLibraryCode, async (req, res) => {
    try {
        const kioskCode = req.params.code.trim();
        const books = await Book.find({ libraryCode: kioskCode, status: 'Sẵn sàng' });
        res.json(books);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/* -------------------------------------------------------
   3. API MƯỢN SÁCH (QUAN TRỌNG: Đã sửa để khớp với Frontend)
   Nhận vào mảng bookIds thay vì bookId lẻ
--------------------------------------------------------- */
router.post('/borrow', checkLibraryCode, async (req, res) => {
    try {
        console.log("---------- ĐANG XỬ LÝ MƯỢN (BORROW MODEL) ----------");
        
        // Frontend gửi: studentName, studentId, studentEmail, bookIds (Array), image, dueDate
        const { libraryCode, studentName, studentId, studentEmail, bookIds, dueDate, image } = req.body;

        if (!studentId) throw new Error("LỖI: Thiếu Mã học sinh!");
        if (!bookIds || bookIds.length === 0) throw new Error("LỖI: Chưa chọn sách!");

        const cleanId = String(studentId).trim();
        const cleanName = String(studentName).trim();

        // 1. Tạo phiếu mượn (Borrow)
        const newBorrow = new Borrow({
            libraryCode,
            studentName: cleanName,
            studentId: cleanId,
            studentEmail,
            books: bookIds, // Lưu mảng ID sách
            image,          // Ảnh chụp từ webcam
            dueDate: dueDate || new Date(Date.now() + 7*24*60*60*1000), // Mặc định 7 ngày nếu thiếu
            borrowDate: new Date(),
            status: 'borrowing'
        });

        await newBorrow.save();

        // 2. Cập nhật trạng thái tất cả sách trong mảng thành "Đang mượn"
        await Book.updateMany(
            { _id: { $in: bookIds } },
            { $set: { status: 'Đang mượn' } }
        );

        console.log(`✅ Mượn thành công ${bookIds.length} cuốn cho ID: ${cleanId}`);
        res.json({ message: "Mượn thành công!" });

    } catch (err) {
        console.error("🔥 LỖI MƯỢN:", err.message);
        res.status(500).json({ message: err.message });
    }
});


/* -------------------------------------------------------
   4. API TRA CỨU TRẢ SÁCH (QUAN TRỌNG: Đã sửa)
   Tìm trong bảng Borrow thay vì Transaction
--------------------------------------------------------- */
router.get('/borrowed/:libraryCode/:studentId', checkLibraryCode, async (req, res) => {
    try {
        const { libraryCode, studentId } = req.params;
        const cleanId = studentId.trim();

        // Tìm các phiếu đang mượn khớp ID và Mã trường
        const borrows = await Borrow.find({
            libraryCode: libraryCode,
            studentId: { $regex: new RegExp(`^${cleanId}$`, 'i') }, // Tìm không phân biệt hoa thường
            status: 'borrowing'
        }).populate('books'); // Populate để lấy thông tin chi tiết sách (tên, ảnh...)

        res.json(borrows);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


/* -------------------------------------------------------
   5. API TRẢ SÁCH (QUAN TRỌNG: Đã sửa)
   Xử lý trả phiếu Borrow
--------------------------------------------------------- */
router.post('/return', checkLibraryCode, async (req, res) => {
    try {
        // transactionId lúc này là ID của phiếu Borrow
        const { transactionId, verifyName, verifyEmail } = req.body;

        console.log(`🔄 Yêu cầu trả phiếu: ${transactionId}`);

        const borrowTicket = await Borrow.findById(transactionId);
        if (!borrowTicket) throw new Error("Phiếu mượn không tồn tại!");

        // 1. Kiểm tra xác thực tên
        const dbName = borrowTicket.studentName.trim().toLowerCase();
        const inputName = verifyName.trim().toLowerCase();

        if (dbName !== inputName) {
            throw new Error(`Sai tên người mượn! (Hệ thống: ${borrowTicket.studentName})`);
        }

        // 2. Kiểm tra xác thực Email (nếu có)
        if (borrowTicket.studentEmail && verifyEmail) {
            const dbEmail = borrowTicket.studentEmail.trim().toLowerCase();
            const inputEmail = verifyEmail.trim().toLowerCase();
            if (dbEmail !== inputEmail) throw new Error("Sai Email xác thực!");
        }

        // 3. Cập nhật phiếu thành Đã trả
        borrowTicket.status = 'returned';
        // borrowTicket.returnDate = new Date(); // Bỏ comment nếu schema có trường này
        await borrowTicket.save();

        // 4. Trả sách về kho (Update Book status)
        if (borrowTicket.books && borrowTicket.books.length > 0) {
            await Book.updateMany(
                { _id: { $in: borrowTicket.books } },
                { $set: { status: 'Sẵn sàng' } }
            );
        }

        res.json({ message: "Trả sách thành công!" });

    } catch (err) {
        console.error("❌ Lỗi trả sách:", err.message);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;