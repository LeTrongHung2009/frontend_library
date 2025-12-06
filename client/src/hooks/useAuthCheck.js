import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuthCheck = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      // Nếu mất token hoặc user info -> Đá về login ngay
      if (!token || !user) {
        // Xóa sạch cho chắc chắn
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // Chuyển hướng
        navigate('/login');
      }
    };

    // Kiểm tra ngay lập tức khi component mount
    checkAuth();

    // Thiết lập kiểm tra định kỳ mỗi 10 giây (tùy chỉnh)
    const interval = setInterval(checkAuth, 10000);

    // Dọn dẹp interval khi unmount
    return () => clearInterval(interval);
  }, [navigate]);
};

export default useAuthCheck;