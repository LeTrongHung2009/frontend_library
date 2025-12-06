'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLibraryStore } from '@/store/useLibraryStore';
import CameraCapture from '@/components/CameraCapture';
import { useRouter } from 'next/navigation';

export default function BorrowPage() {
  const { libraryCode } = useLibraryStore();
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [formData, setFormData] = useState({ email: '', bookId: '', days: 7 });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!libraryCode) {
      router.push('/');
      return;
    }
    // Fetch books
    axios.get(`http://localhost:5000/api/library/books?libraryCode=${libraryCode}`)
      .then(res => setBooks(res.data))
      .catch(err => console.error(err));
  }, [libraryCode, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) return alert("Vui lòng chụp ảnh thẻ!");

    setLoading(true);
    const data = new FormData();
    data.append('email', formData.email);
    data.append('bookId', formData.bookId);
    data.append('days', formData.days);
    data.append('libraryCode', libraryCode); // Gửi kèm code
    data.append('idCard', imageFile);

    try {
      await axios.post('http://localhost:5000/api/library/borrow', data);
      alert('Đăng ký mượn thành công! Vui lòng kiểm tra email để biết ngày trả.');
      // Reset form
      setFormData({ email: '', bookId: '', days: 7 });
      setImageFile(null);
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.msg || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!libraryCode) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">Đăng Ký Mượn Sách ({libraryCode})</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email học sinh</label>
            <input 
              type="email" 
              required
              className="w-full p-2 border rounded"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
            />
          </div>

          {/* Camera Section */}
          <div>
            <label className="block text-sm font-medium mb-2">Ảnh thẻ Học sinh / CCCD</label>
            {imageFile ? (
              <div className="relative w-full h-48 bg-gray-200 rounded flex items-center justify-center">
                 <img src={URL.createObjectURL(imageFile)} alt="Preview" className="h-full object-contain" />
                 <button 
                   type="button" 
                   onClick={() => setImageFile(null)}
                   className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded"
                 >Xóa ảnh</button>
              </div>
            ) : (
              <CameraCapture onCapture={setImageFile} />
            )}
          </div>

          {/* Book Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">Chọn sách</label>
            <select 
              required
              className="w-full p-2 border rounded"
              value={formData.bookId}
              onChange={e => setFormData({...formData, bookId: e.target.value})}
            >
              <option value="">-- Chọn sách --</option>
              {books.map(b => (
                <option key={b._id} value={b._id} disabled={b.available <= 0}>
                  {b.title} (Còn: {b.available})
                </option>
              ))}
            </select>
          </div>

          {/* Days */}
          <div>
            <label className="block text-sm font-medium mb-1">Số ngày mượn</label>
            <input 
              type="number" 
              min="1" max="30"
              className="w-full p-2 border rounded"
              value={formData.days}
              onChange={e => setFormData({...formData, days: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-3 text-white rounded-lg font-bold ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận mượn'}
          </button>
        </form>
      </div>
    </div>
  );
}