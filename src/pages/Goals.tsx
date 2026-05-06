import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Target, Plus, X, ArrowLeft } from 'lucide-react';
import api from '../services/api';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  progressPercent: number;
  status: string;
}

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // State untuk mengontrol Modal Create
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newTargetAmount, setNewTargetAmount] = useState('');
  const [newDeadline, setNewDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/goals');
      setGoals(response.data.goals);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      } else {
        setError('Gagal memuat daftar tabungan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    try {
      // Tembak API Create
      await api.post('/goals', {
        name: newGoalName,
        targetAmount: parseFloat(newTargetAmount),
        deadline: newDeadline
      });
      
      // Sukses! Tutup modal dan reset form
      setIsModalOpen(false);
      setNewGoalName('');
      setNewTargetAmount('');
      setNewDeadline('');
      
      // Langsung refresh data tanpa reload browser
      fetchGoals();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Gagal membuat tabungan baru.');
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Target className="h-7 w-7 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manajemen Tabungan</h1>
            </div>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-transform active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Tambah Target
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-xl mb-6">
            {error}
          </div>
        )}

        {goals.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 shadow-sm border border-gray-100 text-center">
            <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-6">Kamu belum punya target tabungan apa pun.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-indigo-50 text-indigo-700 font-bold rounded-xl hover:bg-indigo-100 transition-colors"
            >
              Buat Tabungan Pertamamu!
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              // Nantinya bisa diklik menuju Detail Page (Fase 10 - Step 2)
              <Link to={`/goals/${goal.id}`} key={goal.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-indigo-200 transition-all group block">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{goal.name}</h3>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold shadow-sm ${
                    goal.status === 'Completed' ? 'bg-emerald-100 text-emerald-700' :
                    goal.status === 'On Track' ? 'bg-blue-100 text-blue-700' :
                    'bg-rose-100 text-rose-700'
                  }`}>
                    {goal.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-extrabold text-gray-800">{formatRupiah(goal.currentAmount)}</span>
                    <span className="text-gray-400 font-medium">{formatRupiah(goal.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
                        goal.progressPercent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-2">Tenggat: {new Date(goal.deadline).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* MODAL MELAYANG (CREATE GOAL) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
            {/* Header Modal */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-600" />
                Target Baru
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 p-2 rounded-full transition-colors shadow-sm">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Isi Form */}
            <form onSubmit={handleCreateGoal} className="p-6 space-y-5">
              {modalError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 text-center">
                  {modalError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Mau nabung buat apa?</label>
                <input 
                  type="text" required
                  placeholder="Cth: Beli Laptop Baru / Dana Darurat"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                  value={newGoalName} onChange={(e) => setNewGoalName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Target Uang (Rp)</label>
                <input 
                  type="text" inputMode="numeric" required
                  placeholder="15.000.000"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none"
                  value={newTargetAmount ? new Intl.NumberFormat('id-ID').format(Number(newTargetAmount)) : ''} 
                  onChange={(e) => {
                    // Hanya ambil karakter angka, buang titik/huruf
                    const rawValue = e.target.value.replace(/[^0-9]/g, '');
                    setNewTargetAmount(rawValue);
                  }}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kapan target ini harus tercapai?</label>
                <input 
                  type="date" required
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow outline-none text-gray-700"
                  value={newDeadline} onChange={(e) => setNewDeadline(e.target.value)}
                />
              </div>
              
              {/* Tombol Aksi */}
              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className={`flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all ${isSubmitting ? 'opacity-70 scale-95' : 'hover:scale-[1.02]'}`}>
                  {isSubmitting ? 'Menyimpan...' : 'Simpan Target'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
