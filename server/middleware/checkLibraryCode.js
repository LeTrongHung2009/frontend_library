const User = require('../models/User');

module.exports = async function checkLibraryCode(req, res, next) {
    try {
        // --- SỬA LỖI ---
        // 1. Thêm (req.body && ...) để tránh crash nếu body undefined
        // 2. Thêm check headers['x-library-code'] để nhận mã từ Frontend React
        
        const libraryCode =
            (req.body && req.body.libraryCode) ||       // Lấy từ Body (An toàn)
            (req.params && req.params.libraryCode) ||   // Lấy từ URL params
            (req.params && req.params.code) ||          // Lấy từ URL params (tên khác)
            (req.headers && req.headers['x-library-code']); // <--- QUAN TRỌNG: Lấy từ Header

        // Log để debug nếu vẫn lỗi (Bạn có thể xóa sau khi chạy được)
        // console.log("Checking Library Code:", libraryCode);

        if (!libraryCode) {
            return res.status(400).json({ message: "Thiếu mã thư viện! Vui lòng kiểm tra kết nối." });
        }

        // Tìm user (Admin thư viện)
        const admin = await User.findOne({ libraryCode: libraryCode.trim() });
        
        if (!admin) {
            return res.status(410).json({
                status: "deleted",
                message: "Mã thư viện không tồn tại hoặc sai!"
            });
        }

        // Gắn thông tin tìm được vào request để dùng ở các bước sau nếu cần
        req.libraryId = admin._id; 
        
        // Hợp lệ → tiếp tục
        next();

    } catch (err) {
        console.error("Lỗi Middleware:", err);
        res.status(500).json({ message: "Lỗi Server khi kiểm tra quyền truy cập." });
    }
};