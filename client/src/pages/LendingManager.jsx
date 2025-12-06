import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BiSearch, BiHistory, BiTrash, BiFilterAlt, BiCheckCircle, BiUser, BiEnvelope, BiCalendar, BiTime, BiErrorCircle } from 'react-icons/bi';
import { useNavigate } from 'react-router-dom';

const LendingManager = () => {
  const [borrows, setBorrows] = useState([]);
  const [filteredBorrows, setFilteredBorrows] = useState([]);
  const [filterStatus, setFilterStatus] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ borrowing: 0, returned: 0, today: 0, overdue: 0 });
  const [previewImage, setPreviewImage] = useState(null);

  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const config = { headers: { 'auth-token': token } };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date() > new Date(dueDate);
  };

  useEffect(() => {
    if (!token) {
        navigate('/login');
        return;
    }
    fetchData();
  }, [token]);

  // --- LOGIC LỌC VÀ TÌM KIẾM ---
  useEffect(() => {
    let result = borrows;

    // 1. Lọc theo trạng thái
    if (filterStatus !== 'Tất cả') {
        if (filterStatus === 'Đã trả') {
            result = result.filter(b => b.status === 'returned');
        } else if (filterStatus === 'Đang mượn') {
            result = result.filter(b => b.status === 'borrowing');
        } else if (filterStatus === 'Quá hạn') {
            result = result.filter(b => b.status === 'borrowing' && isOverdue(b.dueDate));
        }
    }

    // 2. Tìm kiếm (Đã sửa để an toàn hơn với ID)
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        result = result.filter(b => 
            (b.studentName && b.studentName.toLowerCase().includes(lower)) ||
            // Sử dụng String() để đảm bảo không lỗi nếu ID là số
            (b.studentId && String(b.studentId).toLowerCase().includes(lower)) ||
            (b.studentEmail && b.studentEmail.toLowerCase().includes(lower)) ||
            (b.books && b.books.some(book => book && book.title.toLowerCase().includes(lower)))
        );
    }
    setFilteredBorrows(result);
    
    // 3. Tính toán thống kê
    let borrowing = 0, returned = 0, todayCount = 0, overdueCount = 0;
    const todayStr = new Date().toDateString();

    borrows.forEach(b => {
        if (b.status === 'returned') {
            returned++;
        } else {
            borrowing++;
            if (isOverdue(b.dueDate)) overdueCount++;
        }
        if (new Date(b.borrowDate).toDateString() === todayStr) todayCount++;
    });

    setStats({ borrowing, returned, today: todayCount, overdue: overdueCount });
  }, [borrows, filterStatus, searchTerm]);

  const fetchData = async () => {
    try {
      const res = await axios.get('http://library.library-os.workers.dev/api/borrows', config);
      // DEBUG: Kiểm tra xem dữ liệu trả về có trường studentId hay không
      setBorrows(res.data);
    } catch (err) {
      if (err.response?.status === 500) {
          localStorage.removeItem('token');
          navigate('/login');
      }
    }
  };

  const handleReturn = async (id) => {
    if(!window.confirm("Xác nhận đã trả ĐỦ sách?")) return;
    try {
      await axios.put(`http://library.library-os.workers.dev/api/borrows/${id}/return`, {}, config);
      toast.success("Đã trả sách");
      setBorrows(borrows.map(b => b._id === id ? { ...b, status: 'returned' } : b));
    } catch (err) { toast.error("Lỗi cập nhật"); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Bạn chắc chắn muốn XÓA lịch sử này?")) return;
    try {
      await axios.delete(`http://library.library-os.workers.dev/api/borrows/${id}`, config);
      toast.info("Đã xóa phiếu mượn");
      setBorrows(borrows.filter(b => b._id !== id));
    } catch (err) { toast.error("Không thể xóa"); }
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-6">
        {/* STATS HEADER */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
                <div><p className="text-zinc-500 text-xs font-bold uppercase mb-1">Đang mượn</p><p className="text-3xl font-bold text-white">{stats.borrowing}</p></div>
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500"><BiHistory className="text-2xl"/></div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between relative overflow-hidden">
                {stats.overdue > 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-ping m-2"></div>}
                <div><p className="text-zinc-500 text-xs font-bold uppercase mb-1">Quá hạn</p><p className="text-3xl font-bold text-red-500">{stats.overdue}</p></div>
                <div className="p-3 bg-red-500/10 rounded-lg text-red-500"><BiErrorCircle className="text-2xl"/></div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
                <div><p className="text-zinc-500 text-xs font-bold uppercase mb-1">Đã trả</p><p className="text-3xl font-bold text-green-400">{stats.returned}</p></div>
                <div className="p-3 bg-green-500/10 rounded-lg text-green-500"><BiCheckCircle className="text-2xl"/></div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex items-center justify-between">
                <div><p className="text-zinc-500 text-xs font-bold uppercase mb-1">Hôm nay</p><p className="text-3xl font-bold text-indigo-400">{stats.today}</p></div>
                <div className="p-3 bg-indigo-500/10 rounded-lg text-indigo-500"><BiFilterAlt className="text-2xl"/></div>
            </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col gap-4 flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden p-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-2">
                <h2 className="text-lg font-bold text-white flex items-center gap-2"><BiHistory /> Quản lý Mượn Trả</h2>
                <div className="flex gap-3 w-full md:w-auto">
                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-black border border-zinc-700 text-white text-sm rounded-lg px-3 py-2 outline-none">
                        <option>Tất cả</option>
                        <option>Đang mượn</option>
                        <option>Quá hạn</option>
                        <option>Đã trả</option>
                    </select>
                    <div className="relative flex-1 md:w-80">
                        <BiSearch className="absolute left-3 top-2.5 text-zinc-500"/><input type="text" placeholder="Tìm tên, email, mã HS..." onChange={e => setSearchTerm(e.target.value)} className="w-full bg-black border border-zinc-700 text-white text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:border-indigo-500"/>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto custom-scrollbar border border-zinc-800 rounded-lg bg-black/30">
                <table className="w-full text-left text-zinc-400">
                    <thead className="bg-black text-xs uppercase font-bold text-zinc-500 sticky top-0 z-10">
                        <tr>
                            <th className="p-4 bg-black">Thông tin người mượn</th>
                            {/* --- CỘT HIỂN THỊ MÃ SỐ --- */}
                            <th className="p-4 bg-black">Mã số (ID)</th>
                            <th className="p-4 bg-black">Sách & Thời gian</th>
                            <th className="p-4 bg-black">Trạng thái</th>
                            <th className="p-4 bg-black text-right">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                        {filteredBorrows.length === 0 && (
                            <tr><td colSpan="5" className="p-10 text-center text-zinc-600">Không có dữ liệu</td></tr>
                        )}
                        {filteredBorrows.map(item => {
                            const overdue = item.status === 'borrowing' && isOverdue(item.dueDate);
                            return (
                                <tr key={item._id} className="hover:bg-zinc-800/40 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            {item.image ? (
                                                <img 
                                                    src={item.image} 
                                                    alt="" 
                                                    className="w-10 h-10 rounded-full object-cover border border-zinc-700 cursor-pointer hover:scale-150 transition-transform"
                                                    onClick={() => setPreviewImage(item.image)}
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-500"><BiUser/></div>
                                            )}
                                            <div>
                                                <div className="font-bold text-white text-sm">{item.studentName}</div>
                                                <div className="text-xs text-zinc-500 flex flex-col">
                                                    {item.studentEmail && <span className="flex items-center gap-1"><BiEnvelope className="text-[10px]"/> {item.studentEmail}</span>}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    
                                    {/* --- CỘT DỮ LIỆU MÃ SỐ (Đã chỉnh sửa) --- */}
                                    <td className="p-4">
                                        {item.studentId ? (
                                            <span className="font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded text-xs border border-indigo-500/20">
                                                {item.studentId}
                                            </span>
                                        ) : (
                                            <span className="text-zinc-600 text-xs italic">---</span>
                                        )}
                                    </td>

                                    <td className="p-4">
                                        <div className="mb-2 flex flex-wrap gap-1">
                                            {item.books.map((b, i) => (
                                                <span key={i} className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-300 border border-zinc-700">
                                                    📖 {b ? b.title : 'Sách đã xóa'}
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex gap-4 text-xs">
                                            <span className="text-zinc-500 flex items-center gap-1"><BiCalendar/> Mượn: {new Date(item.borrowDate).toLocaleDateString('vi-VN')}</span>
                                            {item.dueDate && (
                                                <span className={`${overdue ? 'text-red-400 font-bold' : 'text-zinc-500'} flex items-center gap-1`}>
                                                    <BiTime/> Hạn: {new Date(item.dueDate).toLocaleDateString('vi-VN')}
                                                    {overdue && " (Quá hạn)"}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                                            item.status === 'returned' 
                                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                            : overdue 
                                                ? 'bg-red-500/10 text-red-500 border-red-500/20'
                                                : 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                                        }`}>
                                            {item.status === 'returned' ? 'Đã trả' : overdue ? 'Quá hạn' : 'Đang mượn'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {item.status === 'borrowing' && (
                                                <button onClick={() => handleReturn(item._id)} className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded transition-colors shadow-lg shadow-indigo-900/20">
                                                    Trả sách
                                                </button>
                                            )}
                                            <button onClick={() => handleDelete(item._id)} className="p-1.5 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded transition-colors">
                                                <BiTrash className="text-lg" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Modal xem ảnh */}
        {previewImage && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setPreviewImage(null)}>
                <img src={previewImage} className="max-w-full max-h-[90vh] rounded-lg shadow-2xl border border-zinc-800" alt="Evidence" />
            </div>
        )}
    </div>
  );
};

export default LendingManager;
