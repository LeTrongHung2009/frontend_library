const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    // 1. Lấy token từ header
    const token = req.header('auth-token');
    if (!token) return res.status(401).send('Truy cập bị từ chối (Thiếu Token)');

    try {
        // 2. Giải mã token
        const verified = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        
        // 3. Lưu thông tin user (id, iat...) vào request
        req.user = verified; 
        
        next(); // Cho phép đi tiếp vào Route
    } catch (err) {
        res.status(400).send('Token không hợp lệ');
    }
};