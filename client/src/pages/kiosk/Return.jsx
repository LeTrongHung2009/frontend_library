import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// --- ICONS (SVG trực tiếp để tránh lỗi thiếu thư viện) ---
const ArrowLeft = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
);
const CheckCircle = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
);
const Shield = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);
const Search = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><line x1="21" x2="16.65" y1="21" y2="16.65"/></svg>
);
const Calendar = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
);
const AlertCircle = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
);
const User = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

const Return = () => {
  const [studentId, setStudentId] = useState('');
  const [borrowTickets, setBorrowTickets] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // --- STATE MODAL ---
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  const [verifyData, setVerifyData] = useState({ name: '', email: '' });
  const [verifying, setVerifying] = useState(false); 

  const libraryCode = localStorage.getItem('kiosk_code'); 
  const navigate = useNavigate();

  // --- 1. KIỂM TRA MÃ KIOSK ---
  useEffect(() => {
    if (!libraryCode) {
        toast.error("Vui lòng kích hoạt Kiosk trước!");
        navigate('/'); 
    }
  }, [libraryCode, navigate]);

  // --- 2. TRA CỨU SÁCH (ĐÃ SỬA: Thêm tham số isRefresh) ---
  const handleSearch = async (e, isRefresh = false) => {
    // Nếu được gọi từ sự kiện submit form (có e), chặn reload trang
    if (e) e.preventDefault();
    
    if (!studentId.trim()) return toast.warning("Vui lòng nhập Mã số học sinh!");
    
    setLoading(true);
    // Lưu ý: Không setBorrowTickets(null) ngay để tránh nháy giao diện khi refresh ngầm
    if (!isRefresh) setBorrowTickets(null);

    try {
      const res = await axios.get(`http://localhost:5000/api/kiosk/borrowed/${libraryCode}/${studentId.trim()}`);
      
      const data = res.data;
      setBorrowTickets(data);
      
      // LOGIC FIX LỖI 2 THÔNG BÁO:
      // Chỉ hiện toast "Không tìm thấy" nếu danh sách rỗng VÀ không phải là đang tự refresh sau khi trả
      if(data.length === 0 && !isRefresh) {
          toast.info("Không tìm thấy phiếu mượn nào.");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Lỗi kết nối server!");
    } finally {
      setLoading(false);
    }
  };

  // --- 3. MỞ MODAL XÁC THỰC ---
  const openVerifyModal = (ticket) => {
    setSelectedTicket(ticket);
    setVerifyData({ name: '', email: '' }); 
    setShowVerifyModal(true);
  };

  // --- 4. GỬI YÊU CẦU TRẢ SÁCH (ĐÃ SỬA) ---
  const submitReturn = async (e) => {
    e.preventDefault();
    
    const inputName = verifyData.name.trim().toLowerCase();
    const storedName = selectedTicket.studentName.trim().toLowerCase();
    
    if (inputName !== storedName) {
        return toast.error(`Tên không khớp! (Hệ thống: ${selectedTicket.studentName})`);
    }

    setVerifying(true);

    try {
      const payload = {
        transactionId: selectedTicket._id,
        verifyName: verifyData.name,
        verifyEmail: verifyData.email,
        libraryCode: libraryCode 
      };

      const config = {
        headers: {
            'x-library-code': libraryCode,
            'Content-Type': 'application/json'
        }
      };

      await axios.post('http://localhost:5000/api/kiosk/return', payload, config);

      toast.success(`✅ Đã trả phiếu mượn thành công!`);
      setShowVerifyModal(false);
      
      // LOGIC FIX LỖI:
      // Gọi handleSearch với tham số thứ 2 là true (isRefresh = true)
      // Để hàm search biết đây là tự động tải lại, đừng báo lỗi nếu rỗng
      handleSearch(null, true);

    } catch (err) {
      const msg = err.response?.data?.message || "Lỗi hệ thống khi trả sách";
      toast.error(`❌ ${msg}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-emerald-900/20 to-transparent pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between p-6 z-10">
          <button 
            onClick={() => navigate('/kiosk/menu')} 
            className="flex items-center gap-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 px-5 py-2.5 rounded-full transition-all text-sm font-bold shadow-lg hover:shadow-emerald-500/20 group"
          >
            <ArrowLeft className="text-xl group-hover:-translate-x-1 transition-transform"/> 
            Quay về Menu
          </button>
      </div>

      <div className="max-w-4xl mx-auto w-full px-6 pb-12 z-10">
        <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Trả Sách & Tra Cứu</h1>
            <p className="text-zinc-500">Nhập Mã số học sinh để xem sách đang mượn</p>
        </div>

        {/* --- FORM TÌM KIẾM --- */}
        <form onSubmit={handleSearch} className="flex gap-4 mb-10 max-w-2xl mx-auto relative group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
             <Search className="text-2xl text-zinc-500 group-focus-within:text-emerald-400 transition-colors"/>
          </div>
          <input 
            type="text" 
            placeholder="Nhập Mã số học sinh (ID)..." 
            className="flex-1 bg-zinc-900/80 backdrop-blur border border-zinc-700 rounded-2xl pl-14 pr-6 py-4 text-xl text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-600 shadow-xl"
            value={studentId} 
            onChange={(e) => setStudentId(e.target.value)} 
            autoFocus
          />
          <button 
            disabled={loading}
            className="bg-emerald-600 text-white px-8 rounded-2xl font-bold text-lg hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '...' : 'Tra cứu'}
          </button>
        </form>

        {/* --- KẾT QUẢ HIỂN THỊ --- */}
        {borrowTickets && (
          <div className="animate-fade-in space-y-4">
            {borrowTickets.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/50 rounded-3xl border border-zinc-800 border-dashed">
                <CheckCircle className="text-7xl text-zinc-700 mx-auto mb-4"/>
                <h3 className="text-xl font-bold text-zinc-400">Không có phiếu mượn nào</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <div className="flex items-center justify-between text-zinc-400 text-sm font-bold uppercase tracking-wider px-2">
                    <span>Kết quả tìm thấy</span>
                    <span>{borrowTickets.length} phiếu mượn</span>
                </div>

                {/* --- LOOP QUA CÁC PHIẾU MƯỢN --- */}
                {borrowTickets.map(ticket => {
                    const isOverdue = new Date() > new Date(ticket.dueDate);

                    return (
                      <div key={ticket._id} className="bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden shadow-lg">
                        
                        {/* HEADER PHIẾU */}
                        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-emerald-900/30 text-emerald-500 flex items-center justify-center font-bold border border-emerald-500/20">
                                    <User/>
                                </div>
                                <div>
                                    <h4 className="font-bold text-white text-sm">{ticket.studentName}</h4>
                                    <p className="text-xs text-zinc-500">Ngày mượn: {new Date(ticket.borrowDate).toLocaleDateString('vi-VN')}</p>
                                </div>
                             </div>
                             
                             {/* NÚT TRẢ CẢ PHIẾU */}
                             <button 
                                onClick={() => openVerifyModal(ticket)}
                                className="bg-zinc-800 hover:bg-emerald-600 text-white px-5 py-2 rounded-xl font-bold text-sm transition-all shadow border border-zinc-700 hover:border-emerald-500 flex items-center gap-2"
                             >
                                <CheckCircle/> TRẢ PHIẾU NÀY
                             </button>
                        </div>

                        {/* DANH SÁCH SÁCH TRONG PHIẾU */}
                        <div className="p-4 bg-zinc-950/30 space-y-3">
                             <div className="text-xs font-bold text-zinc-500 uppercase">Sách đang giữ ({ticket.books.length})</div>
                             {ticket.books.map((book, idx) => (
                                 <div key={idx} className="flex items-center gap-4 bg-black/40 p-2 rounded-lg border border-zinc-800/50">
                                     <img src={book.image || 'https://via.placeholder.com/100'} alt="" className="w-10 h-14 object-cover rounded bg-zinc-800"/>
                                     <div className="flex-1">
                                         <h5 className="text-white text-sm font-bold">{book.title}</h5>
                                         <p className="text-zinc-500 text-xs">{book.author}</p>
                                     </div>
                                 </div>
                             ))}
                        </div>

                        {/* FOOTER TRẠNG THÁI */}
                        <div className="px-4 py-2 bg-zinc-900/50 text-xs text-center border-t border-zinc-800">
                             {isOverdue ? (
                                <span className="text-red-400 font-bold flex items-center justify-center gap-1"><AlertCircle/> Quá hạn trả ngày {new Date(ticket.dueDate).toLocaleDateString('vi-VN')}</span>
                             ) : (
                                <span className="text-blue-400 font-bold flex items-center justify-center gap-1"><Calendar/> Hạn trả: {new Date(ticket.dueDate).toLocaleDateString('vi-VN')}</span>
                             )}
                        </div>

                      </div>
                    )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* --- MODAL XÁC THỰC BẢO MẬT --- */}
      {showVerifyModal && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-zinc-900 w-full max-w-md rounded-3xl border border-zinc-800 shadow-2xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>

            <div className="text-center mb-8">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-500 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <Shield className="text-4xl"/>
                </div>
                <h3 className="text-2xl font-bold text-white">Xác thực trả phiếu</h3>
                <p className="text-zinc-500 text-sm mt-3">
                    Bạn đang trả <b className="text-white">{selectedTicket.books.length} cuốn sách</b>.
                </p>
                <div className="mt-4 p-3 bg-zinc-950/50 rounded-xl border border-zinc-800 text-xs text-zinc-400">
                    <p>Người mượn: <span className="text-emerald-400 font-bold">{selectedTicket.studentName}</span></p>
                </div>
            </div>

            <form onSubmit={submitReturn} className="space-y-4">
                <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Nhập lại Họ và Tên</label>
                    <input 
                        type="text" required
                        className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700"
                        placeholder="Nhập đúng tên người mượn"
                        value={verifyData.name}
                        onChange={e => setVerifyData({...verifyData, name: e.target.value})}
                        disabled={verifying}
                    />
                </div>
                <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-500 uppercase ml-1">Nhập lại Email (Nếu có)</label>
                    <input 
                        type="email" 
                        className="w-full bg-black border border-zinc-700 p-4 rounded-xl text-white outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-zinc-700"
                        placeholder="example@email.com"
                        value={verifyData.email}
                        onChange={e => setVerifyData({...verifyData, email: e.target.value})}
                        disabled={verifying}
                    />
                </div>

                <div className="flex gap-3 mt-8">
                    <button type="button" onClick={() => setShowVerifyModal(false)} className="flex-1 py-4 rounded-xl font-bold text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors">
                        Hủy bỏ
                    </button>
                    <button 
                        type="submit" 
                        disabled={verifying} 
                        className="flex-[2] bg-gradient-to-r from-emerald-600 to-emerald-500 text-white py-4 rounded-xl font-bold hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                    >
                        {verifying ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <CheckCircle className="text-xl"/>}
                        {verifying ? 'Đang kiểm tra...' : 'Xác nhận trả'}
                    </button>
                </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Return;