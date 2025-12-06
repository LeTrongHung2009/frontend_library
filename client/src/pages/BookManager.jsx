import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { BiPlus, BiSearch, BiFilter, BiEdit, BiTrash, BiRefresh } from 'react-icons/bi';

const BookManager = () => {
  const [books, setBooks] = useState([]); 
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Tất cả');
  
  // State form
  const [formData, setFormData] = useState({ title: '', author: '', category: 'Kỹ năng', image: '' });
  const [editingId, setEditingId] = useState(null);

  const token = localStorage.getItem('token');
  const config = { headers: { 'auth-token': token } };

  // 1. TẢI SÁCH TỪ DATABASE
  const fetchBooks = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/books', config);
      setBooks(res.data);
    } catch (err) {
      console.error("Lỗi tải sách:", err);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  // 2. LƯU SÁCH (Thêm/Sửa)
  const handleSave = async () => {
    try {
      if(!formData.title) return alert("Vui lòng nhập tên sách");
      
      // Nếu không có ảnh, dùng ảnh mặc định
      const payload = {
        ...formData,
        image: formData.image || 'https://via.placeholder.com/300x400?text=No+Image'
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/books/${editingId}`, payload, config);
        alert("Cập nhật thành công!");
      } else {
        await axios.post('http://localhost:5000/api/books', payload, config);
        alert("Thêm sách mới thành công!");
      }
      
      setShowModal(false);
      setFormData({ title: '', author: '', category: 'Kỹ năng', image: '' });
      setEditingId(null);
      fetchBooks(); 
    } catch (err) {
      alert("Lỗi lưu sách! Vui lòng kiểm tra lại.");
    }
  };

  // 3. XÓA SÁCH
  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa cuốn sách này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/books/${id}`, config);
        fetchBooks();
      } catch (err) {
        alert("Lỗi xóa sách");
      }
    }
  };

  const openAddModal = () => {
    setFormData({ title: '', author: '', category: 'Kỹ năng', image: '' });
    setEditingId(null);
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setFormData({ title: book.title, author: book.author, category: book.category, image: book.image });
    setEditingId(book._id);
    setShowModal(true);
  };

  // Logic lọc
  const filteredBooks = books.filter(book => 
    (filterCategory === 'Tất cả' || book.category === filterCategory) &&
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col font-sans">
      {/* HEADER */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Quản lý sách</h2>
          <div className="flex gap-4 mt-2 text-sm">
            <span className="text-zinc-400">Tổng số sách: <b className="text-white">{books.length}</b></span>
          </div>
        </div>
        <div className="flex gap-2">
            <button onClick={fetchBooks} className="bg-zinc-800 text-white p-2 rounded-lg hover:bg-zinc-700"><BiRefresh className="text-lg"/></button>
            <button onClick={openAddModal} className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-zinc-200 flex items-center gap-2">
            <BiPlus className="text-lg"/> Thêm sách mới
            </button>
        </div>
      </div>

      {/* SEARCH BAR */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <BiSearch className="absolute left-3 top-3 text-zinc-500" />
          <input type="text" placeholder="Tìm kiếm sách..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white outline-none focus:border-indigo-500"
            onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
        <div className="relative">
          <BiFilter className="absolute left-3 top-3 text-zinc-500" />
          <select className="bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-8 py-2.5 text-white outline-none appearance-none cursor-pointer"
            onChange={(e) => setFilterCategory(e.target.value)}>
            <option value="Tất cả">Tất cả thể loại</option>
            <option value="Kỹ năng">Kỹ năng</option>
            <option value="Văn học">Văn học</option>
            <option value="Công nghệ">Công nghệ</option>
          </select>
        </div>
      </div>

      {/* GRID HIỂN THỊ SÁCH */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6 overflow-y-auto pb-4 custom-scrollbar">
        {filteredBooks.map(book => {
          // Logic Badge: Nếu không phải 'Đang mượn' thì coi như 'Sẵn sàng'
          const isBorrowed = book.status === 'Đang mượn';
          
          return (
            <div key={book._id} className="group bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden hover:border-indigo-500 transition-all">
              <div className="aspect-[3/4] overflow-hidden relative bg-black">
                <img src={book.image || 'https://via.placeholder.com/300x400?text=No+Image'} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                
                {/* --- BADGE TRẠNG THÁI (ĐÃ SỬA) --- */}
                <div className={`absolute top-2 right-2 px-2 py-1 rounded text-[10px] font-bold uppercase shadow-sm ${isBorrowed ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>
                    {isBorrowed ? 'Đang mượn' : 'Sẵn sàng'}
                </div>
                
                <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-3 p-4">
                  <button onClick={() => openEditModal(book)} className="bg-white text-black text-xs font-bold px-4 py-2 rounded-full w-full hover:scale-105 transition-transform flex items-center justify-center gap-2"><BiEdit/> Sửa</button>
                  <button onClick={() => handleDelete(book._id)} className="bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-full w-full hover:scale-105 transition-transform flex items-center justify-center gap-2"><BiTrash/> Xóa</button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-white font-bold text-sm truncate" title={book.title}>{book.title}</h3>
                <p className="text-zinc-500 text-xs mt-1">{book.author}</p>
              </div>
            </div>
          )
        })}
        
        {/* Nếu không có sách */}
        {books.length === 0 && (
            <div className="col-span-full text-center py-20 text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                <p>Kho sách đang trống.</p>
                <p>Hãy bấm nút <b>+ Thêm sách mới</b> để bắt đầu.</p>
            </div>
        )}
      </div>

      {/* MODAL THÊM/SỬA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-zinc-900 w-full max-w-lg rounded-xl border border-zinc-800 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">{editingId ? 'Cập nhật sách' : 'Thêm sách mới'}</h3>
            <div className="space-y-4">
              <div>
                  <label className="text-xs text-zinc-400 font-bold uppercase">Tên sách</label>
                  <input type="text" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white mt-1" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="flex gap-4">
                 <div className="flex-1">
                    <label className="text-xs text-zinc-400 font-bold uppercase">Tác giả</label>
                    <input type="text" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white mt-1" value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} />
                 </div>
                 <div className="flex-1">
                    <label className="text-xs text-zinc-400 font-bold uppercase">Thể loại</label>
                    <select className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white mt-1" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                        <option>Kỹ năng</option><option>Văn học</option><option>Công nghệ</option>
                    </select>
                 </div>
              </div>
              <div>
                  <label className="text-xs text-zinc-400 font-bold uppercase">Link Ảnh Bìa</label>
                  <input type="text" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white mt-1" placeholder="https://..." value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button onClick={() => setShowModal(false)} className="px-4 py-2 text-zinc-400 hover:text-white">Hủy bỏ</button>
                <button onClick={handleSave} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-500">Lưu sách</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManager;