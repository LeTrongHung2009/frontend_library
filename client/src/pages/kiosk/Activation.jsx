import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; // Import Toast

const Activation = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false); // Thêm trạng thái loading
  const navigate = useNavigate();

  // Kiểm tra nếu máy đã kích hoạt từ trước (Auto Login)
  useEffect(() => {
    const savedCode = localStorage.getItem('kiosk_code');
    if (!savedCode) return;

    const verifySavedCode = async () => {
        try {
            await axios.post('https://localhost:5000/api/kiosk/verify-code', { code: savedCode });
            // Nếu mã còn sống -> Vào thẳng menu
            navigate('/kiosk/menu'); 
        } catch (err) {
            // Nếu mã chết hoặc server lỗi -> Xóa cache để nhập lại
            localStorage.removeItem('kiosk_code');
            localStorage.removeItem('school_name');
        }
    };
    verifySavedCode();
  }, [navigate]);

  const handleActivate = async (e) => {
    e.preventDefault(); // Ngăn reload trang form
    
    if (!code.trim()) {
        return toast.warning("⚠️ Vui lòng nhập mã thư viện!");
    }

    setLoading(true); // Bắt đầu loading

    try {
      const res = await axios.post('https://localhost:5000/api/kiosk/verify-code', { code });

      // Lưu thông tin vào localStorage
      localStorage.setItem('kiosk_code', res.data.libraryCode);
      localStorage.setItem('school_name', res.data.schoolName);

      // Thông báo thành công
      toast.success(`🎉 Kết nối thành công: ${res.data.schoolName}`, {
        position: "bottom-right",
        autoClose: 2000,
        onClose: () => navigate('/kiosk/menu')
      });

    } catch (err) {
      // Xử lý lỗi
      const status = err.response?.data?.status;
      
      // Xóa cache nếu lỗi nghiêm trọng
      localStorage.removeItem('kiosk_code');
      localStorage.removeItem('school_name');

      if (status === "deleted") {
        toast.error("⛔ Thư viện này đã ngừng hoạt động (Mã bị xóa).", { position: "bottom-right" });
      } else {
        toast.error("❌ Mã không hợp lệ! Vui lòng kiểm tra lại.", { position: "bottom-right" });
      }
    } finally {
      setLoading(false); // Tắt loading
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center text-white font-sans p-4">
      <div className="w-full max-w-md p-8 bg-zinc-900 border border-zinc-800 rounded-xl text-center shadow-2xl">
        <h1 className="text-3xl font-bold mb-2 text-indigo-500">Kiosk Mode</h1>
        <p className="text-zinc-500 mb-8 text-sm">Nhập mã thư viện để kích hoạt thiết bị này</p>
        
        <form onSubmit={handleActivate} className="flex flex-col gap-4">
            <input 
              type="text"
              placeholder="MÃ THƯ VIỆN (VD: THPT-X8K9L)"
              className="w-full bg-black border border-zinc-700 p-4 rounded-lg text-center text-xl tracking-widest text-white uppercase focus:border-indigo-500 outline-none transition-colors placeholder-zinc-700 font-mono"
              value={code}
              onChange={e => setCode(e.target.value)}
              disabled={loading} // Khóa khi đang tải
              autoFocus
            />
            
            <button 
              type="submit"
              disabled={loading}
              className={`w-full font-bold py-4 rounded-lg transition-all ${
                  loading 
                  ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' 
                  : 'bg-white text-black hover:bg-zinc-200 shadow-lg shadow-white/10'
              }`}
            >
              {loading ? 'ĐANG KẾT NỐI...' : 'KẾT NỐI HỆ THỐNG'}
            </button>
        </form>
        
        <p className="mt-6 text-xs text-zinc-600">
            * Mã thư viện có trong trang Dashboard của Admin
        </p>
      </div>
    </div>
  );
};

export default Activation;
