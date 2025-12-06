import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import MainLayout from './layouts/MainLayout';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Import các trang Admin (Placeholder nếu chưa code xong)
import Dashboard from './pages/Dashboard';
import BookManager from './pages/BookManager';
import LendingManager from './pages/LendingManager';

// Import các trang Kiosk (Placeholder)
import Activation from './pages/kiosk/Activation';
import Menu from './pages/kiosk/Menu';
import Borrow from './pages/kiosk/Borrow';
import Return from './pages/kiosk/Return';

// Component bảo vệ Route: Chỉ cho qua nếu có token
const PrivateRoute = () => {
  const token = localStorage.getItem('token');
  return token ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <>
      <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />

      <Routes>
        {/* PUBLIC ROUTES */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ADMIN ROUTES (PROTECTED) */}
        <Route element={<PrivateRoute />}>
            <Route path="/admin" element={<MainLayout />}>
              {/* Tự động vào dashboard khi gõ /admin */}
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="books" element={<BookManager />} />
              <Route path="lending" element={<LendingManager />} />
            </Route>
        </Route>

        {/* KIOSK ROUTES (Giả sử public hoặc có cơ chế riêng) */}
        <Route path="/kiosk/activate" element={<Activation />} />
        <Route path="/kiosk/menu" element={<Menu />} />
        <Route path="/kiosk/borrow" element={<Borrow />} />
        <Route path="/kiosk/return" element={<Return />} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default App;