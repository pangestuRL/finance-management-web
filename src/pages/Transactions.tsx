import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Plus, X, ArrowDownRight, ArrowUpRight, Filter } from 'lucide-react';
import api from '../services/api';

interface Goal {
  id: string;
  name: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  category: string;
  date: string;
  goalId?: string;
  goal?: Goal;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State Filter Waktu - Bawaan default: Bulan & Tahun Ini
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth().toString());
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString());

  // State Modal Create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [type, setType] = useState('EXPENSE');
  const [amountStr, setAmountStr] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [goalId, setGoalId] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Mengambil daftar transaksi dan daftar tabungan secara bersamaan (Paralel)
      const [txRes, goalsRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/goals')
      ]);
      setTransactions(txRes.data.transactions);
      setGoals(goalsRes.data.goals);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      } else {
        setError('Gagal memuat data transaksi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTx = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    const amount = parseFloat(amountStr);
    if (!amount || amount <= 0) {
      setModalError('Nominal tidak valid!');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.post('/transactions', {
        type,
        amount,
        category,
        date,
        // Kirim goalId hanya jika typenya Pengeluaran dan user memilih tabungan
        goalId: (type === 'EXPENSE' && goalId) ? goalId : undefined
      });
      
      setIsModalOpen(false);
      // Reset Form
      setAmountStr('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setGoalId('');
      
      // Ambil data terbaru dari server agar riwayat langsung ter-update
      fetchData();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Gagal menyimpan transaksi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(angka);
  };

  // LOGIKA FILTER PINTAR (Di Sisi Client)
  // Menyaring transaksi hanya yang cocok dengan bulan dan tahun yang dipilih user
  const filteredTransactions = transactions.filter(tx => {
    const txDate = new Date(tx.date);
    return txDate.getMonth().toString() === filterMonth && 
           txDate.getFullYear().toString() === filterYear;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Navbar Atas */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link to="/dashboard" className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">Riwayat Transaksi</h1>
              </div>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-transform active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Catat Transaksi
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* Panel Filter */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-gray-600 font-bold mr-auto">
            <Filter className="h-5 w-5" />
            <span>Filter Waktu:</span>
          </div>
          
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
          >
            <option value="0">Januari</option>
            <option value="1">Februari</option>
            <option value="2">Maret</option>
            <option value="3">April</option>
            <option value="4">Mei</option>
            <option value="5">Juni</option>
            <option value="6">Juli</option>
            <option value="7">Agustus</option>
            <option value="8">September</option>
            <option value="9">Oktober</option>
            <option value="10">November</option>
            <option value="11">Desember</option>
          </select>

          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
          >
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Daftar Transaksi */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-16 text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowDownRight className="h-8 w-8 text-gray-300" />
              </div>
              <p className="font-medium text-lg mb-1">Belum ada riwayat</p>
              <p className="text-sm">Tidak ada transaksi di bulan yang dipilih.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${tx.type === 'INCOME' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {tx.type === 'INCOME' ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg">{tx.category}</h4>
                      <div className="flex items-center gap-2 mt-0.5 text-sm">
                        <span className="text-gray-500 font-medium">{new Date(tx.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                        {/* Jika transaksi ini dihubungkan ke Tabungan */}
                        {tx.goal && (
                          <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">
                            Masuk ke: {tx.goal.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className={`text-xl font-extrabold ${tx.type === 'INCOME' ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {tx.type === 'INCOME' ? '+' : '-'}{formatRupiah(tx.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL CREATE TRANSACTION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900">Catat Transaksi</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 p-2 rounded-full transition-colors shadow-sm">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTx} className="p-8 space-y-5">
              {modalError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 text-center">
                  {modalError}
                </div>
              )}

              {/* Toggle Tombol Income vs Expense */}
              <div className="flex p-1.5 bg-gray-100 rounded-xl">
                <button 
                  type="button"
                  onClick={() => setType('EXPENSE')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${type === 'EXPENSE' ? 'bg-white text-rose-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Pengeluaran
                </button>
                <button 
                  type="button"
                  onClick={() => setType('INCOME')}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${type === 'INCOME' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                  Pemasukan
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
                <input 
                  type="text" required
                  placeholder={type === 'INCOME' ? 'Gaji, Bonus, Usaha...' : 'Makan, Transport, Belanja...'}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                  value={category} onChange={(e) => setCategory(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nominal (Rp)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                  <input 
                    type="text" inputMode="numeric" required
                    placeholder="50.000"
                    className={`w-full pl-12 pr-4 py-3 text-lg font-bold border-2 rounded-xl outline-none transition-shadow ${type === 'INCOME' ? 'border-emerald-100 focus:ring-emerald-100 focus:border-emerald-500 text-emerald-700' : 'border-rose-100 focus:ring-rose-100 focus:border-rose-500 text-rose-700'}`}
                    value={amountStr ? new Intl.NumberFormat('id-ID').format(Number(amountStr)) : ''} 
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, '');
                      setAmountStr(rawValue);
                    }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tanggal</label>
                <input 
                  type="date" required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none text-gray-700 font-medium"
                  value={date} onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {/* Fitur Rahasia: Hubungkan ke Tabungan (Khusus Pengeluaran) */}
              {type === 'EXPENSE' && goals.length > 0 && (
                <div className="p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl border border-indigo-100 shadow-inner">
                  <label className="block text-sm font-bold text-indigo-900 mb-2">Apakah uang ini ditabung?</label>
                  <select 
                    value={goalId} onChange={(e) => setGoalId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-white border border-indigo-200 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-semibold text-gray-700"
                  >
                    <option value="">Bukan (Pengeluaran Biasa)</option>
                    {goals.map(g => (
                      <option key={g.id} value={g.id}>Ya, simpan ke: {g.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Tombol Aksi */}
              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className={`w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-xl shadow-lg transition-all ${isSubmitting ? 'opacity-70' : 'hover:-translate-y-0.5 active:translate-y-0'}`}>
                  {isSubmitting ? 'Memproses...' : 'Simpan Transaksi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
