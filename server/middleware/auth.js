const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  // 1. Lấy token từ header
  const token = req.header('auth-token');
  if (!token) return res.status(401).send('Truy cập bị từ chối!');

  try {
    // 2. Giải mã token
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Gắn user vào request để dùng ở bước sau
    // verified chứa { id: 'admin_123', ... }
    req.user = verified; 
    
    next(); // Cho phép đi tiếp vào Controller
  } catch (err) {
    res.status(400).send('Token không hợp lệ!');
  }
};