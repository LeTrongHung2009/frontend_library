import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Gọi API Login
      const res = await axios.post('http://library.library-os.workers.dev/api/auth/login', formData);
      const { token, user } = res.data;

      // 2. Kiểm tra token (quan trọng)
      if (!token) throw new Error("Server không trả về Token!");

      // 3. Lưu vào Storage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      toast.success("👋 Đăng nhập thành công!");

      // 4. Chuyển hướng ngay lập tức
      // Dùng replace: true để người dùng không back lại trang login được
      navigate('/admin/dashboard', { replace: true });

    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Sai email hoặc mật khẩu!";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Đăng nhập</h1>
        <p className="text-zinc-500 text-center mb-8 text-sm">Hệ thống quản lý thư viện</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" placeholder="Email" required autoFocus
            className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none"
            onChange={e => setFormData({...formData, email: e.target.value})}
            disabled={loading}
          />
          <input 
            type="password" placeholder="Mật khẩu" required
            className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none"
            onChange={e => setFormData({...formData, password: e.target.value})}
            disabled={loading}
          />
          
          <button 
            disabled={loading}
            className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          Chưa có tài khoản? <Link to="/register" className="text-indigo-400 hover:text-white">Đăng ký mới</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
