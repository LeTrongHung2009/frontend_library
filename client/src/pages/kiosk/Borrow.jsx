import React, { useState, useRef, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { 
  BiCamera, BiRefresh, BiBook, BiSearch, BiScan, 
  BiCheck, BiTrash, BiCalendar, BiEnvelope, BiError, 
  BiUser, BiIdCard, BiLeftArrowAlt 
} from 'react-icons/bi';

const Borrow = () => {
  // --- STATE CAMERA ---
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // --- STATE DỮ LIỆU ---
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // --- STATE FORM ---
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedBooks, setSelectedBooks] = useState([]); 

  // --- NGÀY THÁNG ---
  const getTodayDate = () => new Date().toISOString().split('T')[0];
  const getDefaultDueDate = () => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    studentName: '', studentId: '', studentEmail: '', returnDate: getDefaultDueDate() 
  });
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const config = { headers: { 'auth-token': token } };

  useEffect(() => {
    if (!token) {
       toast.error("Vui lòng đăng nhập.");
       navigate('/login');
       return;
    }
    fetchBooks();
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredBooks(books.filter(b => 
        (b.status === 'Sẵn sàng' || !b.status) &&
        (b.title.toLowerCase().includes(lower) || b.author.toLowerCase().includes(lower))
    ));
  }, [searchTerm, books]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get('https://library.library-os.workers.dev/api/books', config);
      setBooks(res.data);
    } catch (err) { console.error(err); }
  };

  // --- XỬ LÝ CAMERA ---
  const handleStartCamera = () => { setIsCameraActive(true); setImage(null); };
  const capture = useCallback(() => {
    setIsCapturing(true);
    setTimeout(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setImage(imageSrc);
        setIsCameraActive(false);
        setIsCapturing(false);
    }, 400); 
  }, [webcamRef]);
  const handleRetake = () => { setImage(null); setIsCameraActive(true); };

  // --- XỬ LÝ SÁCH & FORM ---
  const toggleBook = (book) => {
    const exists = selectedBooks.find(b => b._id === book._id);
    if (exists) setSelectedBooks(selectedBooks.filter(b => b._id !== book._id));
    else setSelectedBooks([...selectedBooks, book]);
  };
  const removeBook = (bookId) => setSelectedBooks(selectedBooks.filter(b => b._id !== bookId));

  // --- HÀM GỬI FORM QUAN TRỌNG ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Ngăn load lại trang

    // Validation
    if (!formData.studentName.trim()) return toast.warning("Vui lòng nhập tên học sinh!");
    if (!formData.studentId.trim()) return toast.warning("Vui lòng nhập Mã số (ID)!");
    if (selectedBooks.length === 0) return toast.warning("Bạn chưa chọn cuốn sách nào!");
    
    setLoading(true);
    try {
      const payload = {
        studentName: formData.studentName,
        bookIds: selectedBooks.map(b => b._id),
        studentId: formData.studentId,
        studentEmail: formData.studentEmail, 
        image: image, 
        dueDate: formData.returnDate 
      };

      await axios.post('https://library.library-os.workers.dev/api/borrows', payload, config);
      toast.success(`🎉 Mượn thành công ${selectedBooks.length} cuốn sách!`);
      
      // Reset Form
      setFormData({ studentName: '', studentId: '', studentEmail: '', returnDate: getDefaultDueDate() });
      setSelectedBooks([]);
      setImage(null);
      setIsCameraActive(false);
      await fetchBooks(); 

    } catch (err) {
      toast.error(err.response?.data?.message || "Lỗi hệ thống");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-indigo-900/20 to-transparent pointer-events-none"></div>

      {/* --- HEADER --- */}
      <div className="flex items-center justify-between p-6 z-10">
          <button 
            type="button" // Quan trọng: type button để không submit nhầm
            onClick={() => navigate('/kiosk/menu')} 
            className="flex items-center gap-2 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 px-5 py-2.5 rounded-full transition-all text-sm font-bold shadow-lg hover:shadow-indigo-500/20 group"
          >
            <BiLeftArrowAlt className="text-xl group-hover:-translate-x-1 transition-transform"/> 
            Quay về Menu
          </button>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 px-6 pb-6 z-10">
        
        {/* CỘT 1: CAMERA SCANNER */}
        <div className="w-full lg:w-5/12 flex flex-col">
            <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-3xl p-6 shadow-2xl flex-1 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
                
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-indigo-300">
                    <BiScan className="text-xl"/> Xác thực hình ảnh
                </h3>

                <div className="flex-1 bg-black/50 border-2 border-dashed border-zinc-700 rounded-2xl overflow-hidden relative group">
                    {image ? (
                        <div className="relative w-full h-full">
                            <img src={image} alt="Captured" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                <p className="text-green-400 font-bold flex items-center gap-2"><BiCheckCircle className="text-xl"/> Đã chụp xong</p>
                            </div>
                        </div>
                    ) : !isCameraActive ? (
                        <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <BiCamera className="text-4xl opacity-50"/>
                            </div>
                            <p className="text-sm font-medium">Camera đang tắt</p>
                            <p className="text-xs opacity-50">Nhấn nút bên dưới để bắt đầu</p>
                        </div>
                    ) : (
                        <Webcam audio={false} ref={webcamRef} screenshotFormat="image/jpeg" className="w-full h-full object-cover" videoConstraints={{ facingMode: "environment" }} />
                    )}
                </div>

                <div className="mt-6 flex gap-3">
                     {!image ? (
                        !isCameraActive ? (
                            <button onClick={handleStartCamera} type="button" className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/30">
                              <BiCamera className="text-xl"/> BẬT CAMERA
                            </button>
                        ) : (
                            <button onClick={capture} disabled={isCapturing} type="button" className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${isCapturing ? 'bg-green-500' : 'bg-white text-black hover:bg-gray-200'}`}>
                              {isCapturing ? "ĐANG XỬ LÝ..." : "CHỤP HÌNH"}
                            </button>
                        )
                      ) : (
                        <button onClick={handleRetake} type="button" className="flex-1 bg-zinc-800 text-zinc-300 hover:text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-700 transition-colors">
                          <BiRefresh className="text-xl"/> CHỤP LẠI
                        </button>
                      )}
                </div>
            </div>
        </div>

        {/* CỘT 2: FORM NHẬP LIỆU (ĐÃ SỬA THÀNH THẺ FORM) */}
        <div className="w-full lg:w-7/12 flex flex-col">
            <form 
                onSubmit={handleSubmit} // <--- Đã thêm sự kiện submit vào đây
                className="bg-zinc-900/80 backdrop-blur-md border border-zinc-800 rounded-3xl p-6 lg:p-8 shadow-2xl flex-1 flex flex-col h-full"
            >
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                    <BiBook className="text-indigo-500"/> Đăng ký Mượn sách
                </h2>

                {/* Inputs Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                     <div className="col-span-1 md:col-span-2 relative group">
                        <BiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors"/>
                        <input required type="text" placeholder="Họ và tên học sinh" value={formData.studentName} onChange={e => setFormData({...formData, studentName: e.target.value})} 
                            className="w-full bg-black/40 border border-zinc-700 pl-12 pr-4 py-4 rounded-2xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600" />
                     </div>
                     
                     <div className="relative group">
                        <BiIdCard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors"/>
                        <input required type="text" placeholder="Mã số (MSSV)" value={formData.studentId} onChange={e => setFormData({...formData, studentId: e.target.value})} 
                            className="w-full bg-black/40 border border-zinc-700 pl-12 pr-4 py-4 rounded-2xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600" />
                     </div>

                     <div className="relative group">
                        <BiEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-indigo-400 transition-colors"/>
                        <input type="email" placeholder="Email liên hệ" value={formData.studentEmail} onChange={e => setFormData({...formData, studentEmail: e.target.value})} 
                            className="w-full bg-black/40 border border-zinc-700 pl-12 pr-4 py-4 rounded-2xl text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-zinc-600" />
                     </div>
                </div>

                {/* Book Selection */}
                <div className="flex-1 flex flex-col bg-black/20 rounded-2xl border border-zinc-800/50 p-4 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-zinc-400 text-xs font-bold uppercase flex items-center gap-2">Sách đăng ký ({selectedBooks.length})</label>
                        <button type="button" onClick={() => setShowBookModal(true)} className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1.5 rounded-lg font-bold hover:bg-indigo-500 hover:text-white transition-all">
                            + Thêm sách
                        </button>
                    </div>
                    
                    <div className="flex-1 min-h-[100px] overflow-y-auto custom-scrollbar space-y-2 pr-1">
                        {selectedBooks.length === 0 ? (
                            <div onClick={() => setShowBookModal(true)} className="h-full border-2 border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600 cursor-pointer hover:border-zinc-600 hover:text-zinc-500 transition-all">
                                <p className="text-sm">Chưa chọn cuốn sách nào</p>
                                <p className="text-xs opacity-50">Nhấn để mở kho sách</p>
                            </div>
                        ) : (
                            selectedBooks.map((book, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-zinc-900 p-2 rounded-xl border border-zinc-800 group hover:border-zinc-600 transition-colors">
                                    <img src={book.image} className="w-10 h-14 object-cover rounded bg-zinc-800" alt="" />
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-white text-sm truncate">{book.title}</h4>
                                        <p className="text-xs text-zinc-500 truncate">{book.author}</p>
                                    </div>
                                    <button 
                                        type="button" // <--- Quan trọng: Phải là button thường để không submit form
                                        onClick={() => removeBook(book._id)} 
                                        className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    >
                                        <BiTrash />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="flex gap-4 items-end">
                     <div className="flex-1">
                         <label className="block text-zinc-500 text-xs mb-2 font-bold uppercase pl-1">Hạn trả sách</label>
                         <div className="flex bg-black/40 border border-zinc-700 rounded-2xl overflow-hidden relative group focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                           <input type="date" min={getTodayDate()} value={formData.returnDate} onChange={(e) => setFormData({...formData, returnDate: e.target.value})} 
                                className="w-full bg-transparent text-white text-base p-4 outline-none pl-12 cursor-pointer" />
                           <BiCalendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 text-xl pointer-events-none group-focus-within:text-indigo-400"/>
                         </div>
                     </div>
                     <button 
                        type="submit" // <--- Quan trọng: Nút này phải là submit
                        disabled={loading} 
                        className="flex-[2] h-[58px] bg-gradient-to-r from-indigo-600 to-indigo-500 text-white font-bold rounded-2xl text-lg hover:shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                     >
                        {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <BiCheck className="text-2xl"/>}
                        {loading ? 'Đang xử lý...' : 'XÁC NHẬN MƯỢN'}
                     </button>
                </div>

            </form>
        </div>
      </div>

      {/* --- MODAL CHỌN SÁCH (Không đổi) --- */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-zinc-900 w-full max-w-5xl h-[85vh] rounded-3xl border border-zinc-800 flex flex-col shadow-2xl overflow-hidden transform transition-all scale-100">
            <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-zinc-900 sticky top-0 z-10">
              <div><h3 className="text-2xl font-bold text-white">Kho sách</h3><p className="text-zinc-500 text-sm">Chọn sách bạn muốn mượn</p></div>
              <div className="flex gap-3">
                  <button onClick={() => setShowBookModal(false)} className="px-6 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-colors shadow-lg">
                    Xong ({selectedBooks.length})
                  </button>
              </div>
            </div>
            <div className="p-4 bg-zinc-900/50 border-b border-zinc-800">
              <div className="relative">
                  <BiSearch className="absolute left-4 top-3.5 text-zinc-500 text-xl" />
                  <input type="text" placeholder="Nhập tên sách..." className="w-full bg-black border border-zinc-700 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-indigo-500 transition-colors" onChange={(e) => setSearchTerm(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-black/20">
              {filteredBooks.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                      <BiError className="text-5xl mb-4 opacity-30"/> <p>Không tìm thấy sách phù hợp.</p>
                  </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {filteredBooks.map(book => {
                    const isSelected = selectedBooks.some(b => b._id === book._id);
                    return (
                        <div key={book._id} onClick={() => toggleBook(book)} className={`group cursor-pointer border rounded-2xl overflow-hidden relative transition-all duration-200 ${isSelected ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-zinc-800 bg-zinc-900 hover:border-zinc-600 hover:scale-[1.02]'}`}>
                            <div className="aspect-[2/3] overflow-hidden relative bg-zinc-800">
                                <img src={book.image || 'httpss://via.placeholder.com/150'} alt={book.title} className="w-full h-full object-cover" />
                                {isSelected && (
                                    <div className="absolute inset-0 bg-indigo-600/80 backdrop-blur-[2px] flex flex-col items-center justify-center">
                                        <BiCheck className="text-5xl text-white mb-1" />
                                        <span className="text-xs font-bold text-white uppercase tracking-wider">Đã chọn</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <h4 className="text-white font-bold text-sm truncate">{book.title}</h4>
                                <p className="text-zinc-500 text-xs mt-1 truncate">{book.author}</p>
                            </div>
                        </div>
                    )
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className="hidden"><BiCheckCircle/></div>
    </div>
  );
};

const BiCheckCircle = ({className}) => <BiCheck className={className} />; 

export default Borrow;
