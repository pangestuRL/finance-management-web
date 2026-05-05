import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import GoalDetail from './pages/GoalDetail';
import Transactions from './pages/Transactions';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Kalau user buka / (root), langsung arahkan ke /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Halaman Utama */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Halaman Manajemen Tabungan (Step 1) */}
        <Route path="/goals" element={<Goals />} />
        
        {/* Halaman Detail Tabungan (Step 2) */}
        <Route path="/goals/:id" element={<GoalDetail />} />
        
        {/* Halaman Riwayat Transaksi (Fase 11) */}
        <Route path="/transactions" element={<Transactions />} />
      </Routes>
    </Router>
  );
}
