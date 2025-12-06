'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLibraryStore } from '@/store/useLibraryStore';

export default function Home() {
  const [code, setCodeInput] = useState('');
  const setLibraryCode = useLibraryStore((state) => state.setLibraryCode);
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code.trim()) {
      setLibraryCode(code.trim().toUpperCase());
      router.push('/borrow');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Thư Viện Số</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nhập Mã Thư Viện</label>
            <input
              type="text"
              className="mt-1 w-full p-2 border border-gray-300 rounded-md uppercase"
              placeholder="VD: THPT_NVT"
              value={code}
              onChange={(e) => setCodeInput(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700">
            Truy cập
          </button>
        </form>
      </div>
    </div>
  );
}