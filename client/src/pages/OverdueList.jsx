import React from 'react';

const OverdueList = () => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-red-500 flex items-center gap-2">
           Danh sách Quá hạn
        </h2>
        <p className="text-zinc-500 text-sm">Cần gửi email nhắc nhở hoặc liên hệ trực tiếp.</p>
      </div>

      <div className="border border-zinc-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-900 text-zinc-500 uppercase text-xs">
            <tr>
              <th className="px-6 py-4">Học sinh</th>
              <th className="px-6 py-4">Sách đang giữ</th>
              <th className="px-6 py-4">Ngày mượn</th>
              <th className="px-6 py-4">Số ngày quá hạn</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 bg-black">
            {/* Row mẫu */}
            <tr className="group hover:bg-zinc-900/50 transition-colors">
              <td className="px-6 py-4">
                <div className="font-bold text-white">Nguyễn Văn A</div>
                <div className="text-zinc-500 text-xs">ID: HS001</div>
              </td>
              <td className="px-6 py-4 text-zinc-300">Clean Code</td>
              <td className="px-6 py-4 text-zinc-400">20/11/2025</td>
              <td className="px-6 py-4">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900/30 text-red-400">
                  +3 ngày
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-indigo-400 hover:text-indigo-300 font-medium text-xs border border-zinc-700 px-3 py-1 rounded hover:bg-zinc-800">
                  Gửi Mail Nhắc
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverdueList;