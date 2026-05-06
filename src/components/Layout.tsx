import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, Receipt, LogOut, Wallet } from 'lucide-react';

export default function Layout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Tabungan', path: '/goals', icon: <Target className="h-5 w-5" /> },
    { name: 'Transaksi', path: '/transactions', icon: <Receipt className="h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* =========================================
          SIDEBAR KIRI (HANYA MUNCUL DI LAPTOP/PC)
          ========================================= */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 fixed h-full z-50 shadow-sm">
        {/* Logo App */}
        <div className="p-8 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-md shadow-indigo-200">
            <Wallet className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight leading-none">Celengan</h1>
            <p className="text-indigo-600 font-bold text-sm">Pintar</p>
          </div>
        </div>
        
        {/* Menu Navigasi Utama */}
        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto">
          <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Menu Utama</p>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center gap-4 px-4 py-3.5 rounded-2xl font-bold transition-all duration-200 ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              {item.icon}
              <span className="text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Tombol Logout */}
        <div className="p-6 border-t border-gray-100">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 w-full rounded-2xl font-bold text-gray-500 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 group"
          >
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm">Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* =========================================
          AREA KONTEN UTAMA
          ========================================= */}
      {/* md:ml-72 memberi jarak agar konten tidak tertutup sidebar di versi PC */}
      <main className="flex-1 md:ml-72 pb-20 md:pb-0 min-h-screen">
        <Outlet />
      </main>

      {/* =========================================
          MENU BAWAH (BOTTOM NAVBAR - KHUSUS HP)
          ========================================= */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around items-center h-[72px] px-2 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-full h-full space-y-1.5 transition-colors relative ${
                isActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {/* Indikator Titik Aktif */}
                {isActive && (
                  <div className="absolute top-0 w-8 h-1 bg-indigo-600 rounded-b-full"></div>
                )}
                {item.icon}
                <span className="text-[10px] font-extrabold">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
        {/* Tombol Logout Mobile */}
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-full h-full space-y-1.5 text-gray-400 hover:text-rose-600 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="text-[10px] font-extrabold">Keluar</span>
        </button>
      </nav>
      
    </div>
  );
}
