import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Kalau user buka / (root), langsung arahkan ke /login */}
        <Route path="/" element={<Navigate to="/login" />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Halaman Sementara sebelum Fase 9 */}
        <Route path="/dashboard" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 animate-bounce">
              🎉 Hore! Berhasil Login & Masuk Dashboard! 🚧
            </h1>
          </div>
        } />
      </Routes>
    </Router>
  );
}
