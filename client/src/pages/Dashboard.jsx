import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BiBook, BiUser, BiTimeFive, BiPlusCircle, BiCopy, BiLogOut } from 'react-icons/bi';
// Import hook bảo vệ
import useAuthCheck from '../hooks/useAuthCheck'; 

const Dashboard = () => {
  // 1. Kích hoạt kiểm tra bảo mật ngầm
  useAuthCheck(); 

  const [stats, setStats] = useState({
    totalBooks: 0, activeBorrows: 0, overdue: 0, newBooks: 0
  });
  
  const [adminInfo, setAdminInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    // Nếu không có token, để useAuthCheck hoặc App.js lo liệu redirect
    if (!token) return;

    if (userStr) {
      try {
        setAdminInfo(JSON.parse(userStr));
      } catch (e) { console.error("Lỗi parse user info"); }
    }

    const fetchStats = async () => {
      try {
        const config = { headers: { 'auth-token': token } };
        const res = await axios.get('https://library.library-os.workers.dev/api/dashboard/stats', config);
        setStats(res.data);
      } catch (error) {
        console.error("Lỗi lấy thống kê:", error);
        // Không xử lý lỗi 401 ở đây nữa vì useAuthCheck đã làm rồi
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.info("Đã đăng xuất.");
    navigate('/login', { replace: true });
  };

  const copyCode = () => {
    if (adminInfo?.libraryCode) {
      navigator.clipboard.writeText(adminInfo.libraryCode);
      toast.success("Đã copy mã thư viện vào clipboard!");
    } else {
      toast.error("Đang tải mã...");
    }
  };

  if (loading) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Xin chào, {adminInfo?.schoolName || "Admin"} 👋</h2>
          <button 
            onClick={handleLogout}
            className="text-zinc-400 hover:text-white flex items-center gap-2 text-sm transition-colors"
          >
            <BiLogOut className="text-xl"/> Đăng xuất
          </button>
      </div>

      {/* --- MÃ CODE --- */}
      <div className="bg-indigo-600 rounded-xl p-6 mb-8 text-white flex flex-col md:flex-row justify-between items-center shadow-lg shadow-indigo-900/20">
        <div className="mb-4 md:mb-0">
          <p className="text-indigo-200 text-sm font-medium uppercase mb-1">Mã kích hoạt Kiosk (Library Code)</p>
          <h1 className="text-4xl font-bold tracking-widest font-mono">
            {adminInfo?.libraryCode || "Loading..."}
          </h1>
          <p className="text-xs text-indigo-300 mt-2">* Vui lòng kiểm tra Email để nhận hướng dẫn sử dụng chi tiết</p>
        </div>
        <button 
          onClick={copyCode}
          className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-50 transition-colors shadow-lg"
        >
          <BiCopy className="text-xl"/> Sao chép Mã
        </button>
      </div>
      
      {/* --- STATS --- */}
      <h3 className="text-xl font-bold text-white mb-4">Thống kê nhanh</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Tổng số sách" value={stats.totalBooks} icon={<BiBook />} />
        <StatCard title="Đang cho mượn" value={stats.activeBorrows} icon={<BiUser />} />
        <StatCard title="Sách quá hạn" value={stats.overdue} icon={<BiTimeFive />} isAlert={stats.overdue > 0} />
        <StatCard title="Sách mới nhập" value={stats.newBooks} icon={<BiPlusCircle />} />
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon, isAlert }) => (
  <div className="p-5 border border-zinc-800 rounded-xl bg-zinc-900/50 hover:bg-zinc-900 transition-colors group relative overflow-hidden">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400 group-hover:text-white transition-colors">{icon}</div>
      {isAlert && <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse absolute top-5 right-5"></span>}
    </div>
    <p className="text-zinc-500 text-xs uppercase font-semibold tracking-wider">{title}</p>
    <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
    {isAlert && <div className="absolute inset-0 border-2 border-red-500/20 rounded-xl pointer-events-none animate-pulse"></div>}
  </div>
);

export default Dashboard;
