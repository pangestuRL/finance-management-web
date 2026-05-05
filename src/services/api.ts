import axios from 'axios';

// Membuat "mesin kurir" (instance) dengan alamat kantor pusat backend
const api = axios.create({
  // Best Practice: Mengambil domain dari .env, lalu selalu tambahkan '/api' di belakangnya
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// ==========================================
// SIHIR INTERCEPTOR AXIOS 🪄
// ==========================================
// Setiap kali frontend mau mengirim paket (API Call) ke backend, 
// satpam ini akan mencegat paketnya sebentar untuk ditempeli Token.
api.interceptors.request.use(
  (config) => {
    // Cari token di dalam brankas browser (localStorage)
    const token = localStorage.getItem('token');
    
    // Kalau tokennya ketemu, jadikan paspor (Authorization Header)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
