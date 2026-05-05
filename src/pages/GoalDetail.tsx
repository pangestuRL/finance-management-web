import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Target, ArrowLeft, Plus, CheckCircle2, TrendingUp, AlertCircle, Sparkles, X } from 'lucide-react';
import api from '../services/api';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  expectedSaving: number;
  progressPercent: number;
  status: string;
}

export default function GoalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [goal, setGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State untuk Modal Setor Uang
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalError, setModalError] = useState('');

  useEffect(() => {
    fetchGoalDetail();
  }, [id]);

  const fetchGoalDetail = async () => {
    try {
      const response = await api.get(`/goals/${id}`);
      setGoal(response.data.goal);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      } else {
        setError('Gagal memuat detail tabungan.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddSavings = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');
    setIsSubmitting(true);

    const amount = parseFloat(depositAmount);
    if (!amount || amount <= 0) {
      setModalError('Masukkan nominal yang valid.');
      setIsSubmitting(false);
      return;
    }

    try {
      await api.put(`/goals/${id}/add-savings`, { amount });
      
      // Sukses! Tutup modal dan reset form
      setIsModalOpen(false);
      setDepositAmount('');
      
      // Ambil data terbaru dari server untuk memperbarui progress bar
      fetchGoalDetail();
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Gagal menyetor uang.');
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

  if (error || !goal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <AlertCircle className="h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops! Ada Masalah</h2>
        <p className="text-gray-500 mb-6">{error || 'Tabungan tidak ditemukan.'}</p>
        <Link to="/goals" className="px-6 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
          Kembali ke Daftar
        </Link>
      </div>
    );
  }

  const isCompleted = goal.progressPercent >= 100;
  const isBehind = goal.status === 'Behind';

  return (
    <div className={`min-h-screen pb-12 transition-colors duration-500 ${isCompleted ? 'bg-emerald-50' : 'bg-gray-50'}`}>
      {/* Header Panel */}
      <div className={`${isCompleted ? 'bg-emerald-100/50' : 'bg-white'} shadow-sm border-b ${isCompleted ? 'border-emerald-200' : 'border-gray-200'} sticky top-0 z-40 transition-colors duration-500`}>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <Link to="/goals" className={`p-2 rounded-full transition-colors ${isCompleted ? 'text-emerald-700 hover:bg-emerald-200' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}>
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-xl font-bold text-gray-900 truncate max-w-[200px] sm:max-w-md">{goal.name}</h1>
            </div>
            {/* Status Badge */}
            <span className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-1.5 shadow-sm ${
              isCompleted ? 'bg-emerald-500 text-white' :
              goal.status === 'On Track' ? 'bg-blue-100 text-blue-700' :
              'bg-rose-100 text-rose-700'
            }`}>
              {isCompleted && <CheckCircle2 className="h-4 w-4" />}
              {!isCompleted && goal.status === 'On Track' && <TrendingUp className="h-4 w-4" />}
              {goal.status}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-6">
        
        {/* Celebration Banner (Jika Lunas) */}
        {isCompleted && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 shadow-lg text-white flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-yellow-300" />
                Luar Biasa! Target Tercapai!
              </h2>
              <p className="mt-1 text-emerald-50 font-medium">Selamat, kamu telah berhasil mengumpulkan uang untuk target ini. Rayakan pencapaianmu!</p>
            </div>
            <Target className="h-16 w-16 opacity-20 hidden sm:block" />
          </div>
        )}

        {/* Insight Warning Banner (Jika Tertinggal) */}
        {!isCompleted && isBehind && (
          <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 flex items-start gap-3 shadow-sm animate-in fade-in">
            <AlertCircle className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-rose-900">Kamu Agak Tertinggal!</h3>
              <p className="text-rose-700 text-sm mt-1 font-medium">
                Menurut kalkulasi sistem, seharusnya hari ini kamu sudah menabung sekitar <strong className="font-extrabold">{formatRupiah(goal.expectedSaving)}</strong> agar bisa mencapai target tepat waktu. Yuk semangat setor lagi!
              </p>
            </div>
          </div>
        )}

        {/* Kartu Utama Progress */}
        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="text-center mb-10 relative z-10">
            <p className="text-gray-500 font-bold uppercase tracking-wider text-sm mb-3">Total Terkumpul</p>
            <h2 className={`text-5xl font-extrabold tracking-tight mb-2 ${isCompleted ? 'text-emerald-600' : 'text-gray-900'}`}>
              {formatRupiah(goal.currentAmount)}
            </h2>
            <p className="text-gray-400 font-medium text-lg">dari target {formatRupiah(goal.targetAmount)}</p>
          </div>

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="flex justify-between text-sm font-bold mb-3">
              <span className={isCompleted ? 'text-emerald-600' : 'text-indigo-600'}>{goal.progressPercent}%</span>
              <span className="text-gray-400">100%</span>
            </div>
            {/* Progress Bar Gendut */}
            <div className="w-full bg-gray-100 rounded-full h-6 overflow-hidden shadow-inner relative">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${
                  isCompleted ? 'bg-emerald-500' : 
                  isBehind ? 'bg-rose-500' : 'bg-indigo-500'
                }`}
                style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
              >
                {!isCompleted && (
                  <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite] -translate-x-full"></div>
                )}
              </div>
            </div>
          </div>

          {/* Info Ekstra */}
          <div className="mt-10 pt-8 border-t border-gray-100 grid grid-cols-2 gap-4 relative z-10 text-center">
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Tenggat Waktu</p>
              <p className="font-bold text-gray-800 text-lg">{new Date(goal.deadline).toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'})}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-1">Sisa Waktu</p>
              <p className="font-bold text-gray-800 text-lg">
                {Math.max(0, Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} Hari
              </p>
            </div>
          </div>
        </div>

        {/* Tombol Setor Uang (Hanya muncul jika belum lunas) */}
        {!isCompleted && (
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-2"
          >
            <Plus className="h-6 w-6" />
            Setor Uang Sekarang
          </button>
        )}
      </div>

      {/* MODAL MELAYANG (SETOR UANG) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-indigo-50/50">
              <h2 className="text-xl font-bold text-indigo-900 flex items-center gap-2">
                Setor Uang 💸
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-red-500 bg-white hover:bg-red-50 p-2 rounded-full transition-colors shadow-sm">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddSavings} className="p-8 space-y-6">
              {modalError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100 text-center">
                  {modalError}
                </div>
              )}
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Berapa nominal yang disetor?</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">Rp</span>
                  <input 
                    type="text" inputMode="numeric" required autoFocus
                    placeholder="50.000"
                    className="w-full pl-12 pr-4 py-4 text-xl font-bold border-2 border-indigo-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 transition-all outline-none"
                    value={depositAmount ? new Intl.NumberFormat('id-ID').format(Number(depositAmount)) : ''} 
                    onChange={(e) => {
                      const rawValue = e.target.value.replace(/[^0-9]/g, '');
                      setDepositAmount(rawValue);
                    }}
                  />
                </div>
              </div>
              
              {/* Tombol Aksi */}
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className={`flex-1 py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition-all ${isSubmitting ? 'opacity-70 scale-95' : 'hover:scale-[1.02]'}`}>
                  {isSubmitting ? 'Memproses...' : 'Setor!'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
