const router = require('express').Router();
const User = require('../models/User');
const Book = require('../models/Book'); // <-- MỚI: Cần import Book để xóa được sách
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Cấu hình gửi mail (Gmail)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER, 
        pass: process.env.EMAIL_PASS
    }
});

// ==========================================
// 1. ĐĂNG KÝ
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { schoolName, email, password } = req.body;

        // Kiểm tra trùng email
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "Email đã tồn tại" });

        // Mã hóa mật khẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Tự sinh Library Code (Ví dụ: THPT-X8K9L)
        const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
        // Lấy chữ cái đầu của tên trường (hoặc default là LIBRARY)
        const prefix = schoolName ? schoolName.split(' ')[0].toUpperCase() : 'LIB';
        const libraryCode = `${prefix}-${randomStr}`;

        // Lưu vào DB
        const newUser = new User({
            schoolName,
            email,
            password: hashedPassword,
            libraryCode
        });
        await newUser.save();

        // Gửi Email (Bọc trong try-catch riêng để nếu lỗi mail cũng không chặn đăng ký)
        try {
            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: '🎉 Chào mừng đến LibraryOS - Mã Thư Viện của bạn',
                html: `
                    <h3>Xin chào Admin trường ${schoolName},</h3>
                    <p>Tài khoản của bạn đã được tạo thành công.</p>
                    <p>Đây là <b>MÃ KÍCH HOẠT (Library Code)</b> dành cho các máy trạm (Kiosk) tại thư viện:</p>
                    <h1 style="color: #4F46E5; font-size: 32px;">${libraryCode}</h1>
                    <p>Vui lòng nhập mã này trên các máy tính dành cho học sinh.</p>
                `
            };
            await transporter.sendMail(mailOptions);
        } catch (emailErr) {
            console.error("Lỗi gửi mail:", emailErr.message);
            // Không return lỗi, vẫn cho đăng ký thành công
        }

        // Tạo Token
        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

        res.json({ token, user: { id: newUser._id, schoolName, email, libraryCode } });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// 2. ĐĂNG NHẬP
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) return res.status(400).json({ message: "Email không tồn tại" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Sai mật khẩu" });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '1d' });

        res.json({ token, user: { id: user._id, schoolName: user.schoolName, email: user.email, libraryCode: user.libraryCode } });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==========================================
// 3. XÓA SẠCH DATABASE (DANGER ZONE)
// ==========================================
// Gọi link này trên trình duyệt để reset dữ liệu: http://localhost:5000/api/auth/reset-database-danger
router.get('/reset-database-danger', async (req, res) => {
    try {
        // Xóa User
        await User.deleteMany({});
        // Xóa Sách
        await Book.deleteMany({});
        
        // Nếu sau này có thêm Borrow (Mượn trả), thêm dòng này:
        // const Borrow = require('../models/Borrow');
        // await Borrow.deleteMany({});

        console.log("⚠️ ĐÃ RESET TOÀN BỘ DATABASE!");
        res.send(`
            <h1 style="color: green">✅ Đã xóa sạch Database!</h1>
            <p>Đã xóa hết Users và Books.</p>
            <p>Bây giờ hãy quay lại trang Register để tạo tài khoản Admin mới (sẽ có libraryCode chuẩn).</p>
        `);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;