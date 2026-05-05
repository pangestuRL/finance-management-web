import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Wallet, TrendingUp, TrendingDown, Target, AlertCircle, CheckCircle2 } from 'lucide-react';
import api from '../services/api';

// Interface untuk Tipe Data
interface Summary {
  month: string;
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  progressPercent: number;
  status: string;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Memeriksa token dan mengambil data saat halaman dimuat
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const response = await api.get('/dashboard');
      setSummary(response.data.summary);
      setGoals(response.data.goalsProgress);
      setInsights(response.data.insights);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Token kadaluarsa atau tidak valid (Diusir oleh satpam Backend)
        handleLogout();
      } else {
        setError('Gagal memuat data dashboard. Pastikan server backend berjalan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  // Alat bantu mempercantik angka jadi format Uang Rupiah Asli
  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Header Panel (Navbar) */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Wallet className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">Celengan Pintar</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate('/transactions')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-all shadow-sm"
              >
                Riwayat Transaksi
              </button>
              
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        {/* 1. INSIGHTS BOX */}
        {insights.length > 0 && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-indigo-900 mb-3 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Insight Keuanganmu Bulan Ini
            </h2>
            <ul className="space-y-2">
              {insights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2 text-indigo-800 text-sm font-medium">
                  <span className="mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 2. SUMMARY CARDS */}
        {summary && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ringkasan {summary.month}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Balance Card */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 shadow-lg relative overflow-hidden group hover:shadow-xl transition-shadow">
                <div className="absolute -right-4 -top-4 bg-white w-32 h-32 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500"></div>
                <p className="text-sm font-medium text-blue-100 mb-1 relative z-10">Total Saldo Bersih</p>
                <h3 className="text-3xl font-extrabold text-white relative z-10 drop-shadow-md">{formatRupiah(summary.balance)}</h3>
              </div>

              {/* Income Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute -right-4 -top-4 bg-emerald-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Pemasukan</p>
                    <h3 className="text-2xl font-bold text-emerald-600">{formatRupiah(summary.totalIncome)}</h3>
                  </div>
                  <div className="bg-emerald-100 p-2 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* Expense Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
                <div className="absolute -right-4 -top-4 bg-rose-50 w-24 h-24 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="flex justify-between items-start relative z-10">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total Pengeluaran</p>
                    <h3 className="text-2xl font-bold text-rose-600">{formatRupiah(summary.totalExpense)}</h3>
                  </div>
                  <div className="bg-rose-100 p-2 rounded-lg">
                    <TrendingDown className="h-6 w-6 text-rose-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. GOALS PROGRESS */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Target Tabunganmu</h2>
            </div>
            
            <button 
              onClick={() => navigate('/goals')}
              className="text-sm font-bold text-purple-700 hover:text-white bg-purple-100 hover:bg-purple-600 px-4 py-2 rounded-lg transition-all duration-300 shadow-sm"
            >
              Kelola Tabungan &rarr;
            </button>
          </div>
          
          {goals.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center flex flex-col items-center justify-center">
              <Target className="h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500 font-medium">Belum ada target tabungan yang dibuat.</p>
              <p className="text-sm text-gray-400 mt-1">Mulai buat targetmu lewat API Postman, dan lihat hasilnya di sini!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {goals.map((goal) => (
                <Link to={`/goals/${goal.id}`} key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all duration-300 group block">
                  <div className="flex justify-between items-start mb-5">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{goal.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 font-medium">Tenggat: {new Date(goal.deadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                    </div>
                    {/* Status Badge Dinamis */}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm ${
                      goal.status === 'Completed' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                      goal.status === 'On Track' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                      'bg-rose-100 text-rose-700 border border-rose-200'
                    }`}>
                      {goal.status === 'Completed' && <CheckCircle2 className="h-3 w-3" />}
                      {goal.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-gray-800">{formatRupiah(goal.currentAmount)}</span>
                      <span className="font-semibold text-gray-400">{formatRupiah(goal.targetAmount)}</span>
                    </div>
                    {/* Progress Bar Container yang Estetik */}
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                          goal.progressPercent >= 100 ? 'bg-emerald-500' : 
                          goal.status === 'Behind' ? 'bg-rose-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                      >
                        {/* Shimmer Effect */}
                        <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -translate-x-full"></div>
                      </div>
                    </div>
                    <p className="text-right text-xs text-gray-500 font-bold">{goal.progressPercent}% Terkumpul</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
