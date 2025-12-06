import React from 'react';
import { BiBook, BiHomeAlt, BiUser, BiLogOut } from 'react-icons/bi';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import useAuthCheck from '../hooks/useAuthCheck'; 

const MainLayout = () => {
  // Hook bảo vệ: check token liên tục
  useAuthCheck(); 

  const navigate = useNavigate();
  const location = useLocation(); 

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login', { replace: true });
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex min-h-screen bg-black text-zinc-400 font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-800 flex flex-col fixed h-full bg-zinc-900 z-50">
        <div className="p-6 border-b border-zinc-800">
          <h1 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
            LibraryOS
          </h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <NavItem 
            to="/admin/dashboard" 
            icon={<BiHomeAlt />} 
            label="Tổng quan" 
            active={isActive('/admin/dashboard')} 
          />
          <NavItem 
            to="/admin/books" 
            icon={<BiBook />} 
            label="Quản lý sách" 
            active={isActive('/admin/books')} 
          />
          <NavItem 
            to="/admin/lending" 
            icon={<BiUser />} 
            label="Cho mượn" 
            active={isActive('/admin/lending')} 
          />
        </nav>

        <div className="p-4 border-t border-zinc-800">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors hover:bg-zinc-800 rounded-md"
          >
            <BiLogOut /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content Area - Có margin-left để tránh sidebar che khuất */}
      <main className="ml-64 flex-1 p-8 bg-black min-h-screen">
        <div className="max-w-7xl mx-auto h-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active, to }) => (
  <Link to={to} className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
    active 
      ? 'bg-zinc-800 text-white' 
      : 'hover:bg-zinc-800/50 hover:text-zinc-200'
  }`}>
    {icon}
    {label}
  </Link>
);

export default MainLayout;