import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Register = () => {
  const [formData, setFormData] = useState({ schoolName: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password.length < 6) return toast.warning("Mật khẩu quá ngắn (tối thiểu 6 ký tự)");

    setLoading(true);
    const toastId = toast.loading("Đang khởi tạo hệ thống...", { position: "bottom-right" });

    try {
      // Gọi API
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      const { token, user } = res.data;

      // Logic: Nếu có token -> Lưu & Chuyển Dashboard. Nếu không -> Chuyển Login.
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        toast.update(toastId, { 
          render: `🎉 Chào mừng ${user.schoolName}!`, type: "success", isLoading: false, autoClose: 2000 
        });
        
        setTimeout(() => navigate('/admin/dashboard', { replace: true }), 500);
      } else {
        toast.update(toastId, { 
          render: "✅ Đăng ký thành công! Vui lòng đăng nhập.", type: "success", isLoading: false, autoClose: 3000 
        });
        navigate('/login');
      }

    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi đăng ký!";
      toast.update(toastId, { render: `❌ ${msg}`, type: "error", isLoading: false, autoClose: 3000 });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-white mb-2 text-center">Đăng ký mới</h1>
        <p className="text-zinc-500 text-center mb-8 text-sm">Hệ thống quản lý thư viện</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Tên trường học" required
            className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
            onChange={e => setFormData({...formData, schoolName: e.target.value})}
            disabled={loading}
          />
          <input 
            type="email" placeholder="Email quản trị" required
            className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
            onChange={e => setFormData({...formData, email: e.target.value})}
            disabled={loading}
          />
          <input 
            type="password" placeholder="Mật khẩu" required
            className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 text-white focus:border-indigo-500 outline-none transition-colors"
            onChange={e => setFormData({...formData, password: e.target.value})}
            disabled={loading}
          />
          <button disabled={loading} className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 mt-4 transition-all">
            {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-500">
          Đã có tài khoản? <Link to="/login" className="text-indigo-400 font-medium">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;