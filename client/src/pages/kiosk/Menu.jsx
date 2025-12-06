import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BiBookAdd, BiBookReader, BiLogOut } from 'react-icons/bi';
import { toast } from 'react-toastify'; // Import Toast

const Menu = () => {
  const schoolName = localStorage.getItem('school_name');
  const libraryCode = localStorage.getItem('kiosk_code');
  const navigate = useNavigate();

  // --- LOGIC MỚI: TỰ ĐỘNG KIỂM TRA TRẠNG THÁI ---
  useEffect(() => {
    // Nếu không có code -> Đá văng ngay
    if (!libraryCode) {
      navigate('/kiosk/activate');
      return;
    }

    const checkLibraryStatus = async () => {
      try {
        // Gọi API kiểm tra nhẹ (Ping)
        await axios.post('https://localhost:5000/api/kiosk/verify-code', { code: libraryCode });
      } catch (err) {
        // Nếu lỗi (404/Deleted) -> Xóa cache và thoát
        console.error("Mất kết nối thư viện:", err);
        
        localStorage.removeItem('kiosk_code');
        localStorage.removeItem('school_name');
        
        // Dùng toastId để tránh hiện thông báo chồng chéo
        if (!toast.isActive('session-expired')) {
             toast.error("⚠️ Thư viện đã ngắt kết nối hoặc mã không còn hợp lệ.", { toastId: 'session-expired' });
        }
        
        navigate('/kiosk/activate');
      }
    };

    // Kiểm tra mỗi 10 giây (Không cần quá nhanh ở trang Menu)
    const intervalId = setInterval(checkLibraryStatus, 10000);

    return () => clearInterval(intervalId); // Dọn dẹp
  }, [libraryCode, navigate]);
  // ----------------------------------------------

  // Hàm Reset thủ công (Khi bấm nút góc phải)
  const handleReset = () => {
    if(window.confirm("Bạn muốn ngắt kết nối với thư viện này để nhập mã mới?")) {
        localStorage.removeItem('kiosk_code');
        localStorage.removeItem('school_name');
        
        toast.info("Đã ngắt kết nối thiết bị.", { position: "bottom-right" });
        navigate('/kiosk/activate');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans flex flex-col items-center justify-center relative">
      
      {/* Nút Reset/Đổi thư viện */}
      <button 
        onClick={handleReset}
        className="absolute top-6 right-6 flex items-center gap-2 text-zinc-500 hover:text-red-500 transition-colors bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800 hover:border-red-500/50"
      >
        <BiLogOut className="text-xl"/> <span className="text-sm font-medium">Đổi thư viện</span>
      </button>

      <h2 className="text-zinc-500 text-xl font-medium mb-2 uppercase tracking-widest">Kiosk Thư Viện</h2>
      <h1 className="text-4xl font-bold mb-12 text-indigo-400 text-center">{schoolName || 'Trường Học'}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Nút Mượn Sách */}
        <Link to="/kiosk/borrow" className="group bg-zinc-900 border border-zinc-800 p-10 rounded-3xl hover:bg-indigo-600 hover:border-indigo-500 transition-all flex flex-col items-center text-center shadow-2xl hover:shadow-indigo-900/20">
          <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-6 group-hover:bg-white text-indigo-500 group-hover:text-indigo-600 transition-colors duration-300">
            <BiBookAdd className="text-5xl" />
          </div>
          <h3 className="text-2xl font-bold mb-2 group-hover:text-white transition-colors">Mượn Sách</h3>
          <p className="text-zinc-500 group-hover:text-indigo-200 transition-colors">Đăng ký mượn sách mới bằng thẻ học sinh</p>
        </Link>

        {/* Nút Trả Sách */}
        <Link to="/kiosk/return" className="group bg-zinc-900 border border-zinc-800 p-10 rounded-3xl hover:bg-emerald-600 hover:border-emerald-500 transition-all flex flex-col items-center text-center shadow-2xl hover:shadow-emerald-900/20">
          <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mb-6 group-hover:bg-white text-emerald-500 group-hover:text-emerald-600 transition-colors duration-300">
            <BiBookReader className="text-5xl" />
          </div>
          <h3 className="text-2xl font-bold mb-2 group-hover:text-white transition-colors">Trả Sách / Tra cứu</h3>
          <p className="text-zinc-500 group-hover:text-emerald-200 transition-colors">Xem sách đang mượn và xác nhận trả sách</p>
        </Link>
      </div>
      
      <div className="mt-12 opacity-50 hover:opacity-100 transition-opacity">
        <p className="text-zinc-600 text-sm">Cần hỗ trợ? Vui lòng liên hệ thủ thư tại quầy.</p>
      </div>
    </div>
  );
};

export default Menu;
