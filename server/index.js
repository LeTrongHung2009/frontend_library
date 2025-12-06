require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. IMPORT ROUTES
const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const dashboardRoutes = require('./routes/dashboard');
const kioskRoutes = require('./routes/kiosk');
// const transactionRoutes = require('./routes/transactions'); // Có thể bỏ cái cũ này nếu không dùng nữa

// --- THÊM DÒNG NÀY ---
const borrowRoutes = require('./routes/borrows'); 
// --------------------

const app = express();

// Tăng giới hạn upload lên 50MB (Cho ảnh bìa sách hoặc camera sau này)
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

// Database
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/library_system')
  .then(() => console.log('✅ MongoDB Connected'))
  .catch(err => console.log('❌ DB Error:', err));

// 2. SỬ DỤNG ROUTES
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/kiosk', kioskRoutes);

// --- THÊM DÒNG NÀY ---
// Đăng ký đường dẫn cho chức năng mượn trả
app.use('/api/borrows', borrowRoutes);
// --------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));