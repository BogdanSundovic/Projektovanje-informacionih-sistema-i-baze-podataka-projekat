// frontend/src/services/api.js
import axios from 'axios';

// Koren backenda (bez /api na kraju!)
const API_ROOT =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  process.env.REACT_APP_API_URL ||
  'http://localhost:18088';

// skini trailing slash ako postoji
const stripSlash = (s) => (s ? s.replace(/\/+$/, '') : '');
const ROOT = stripSlash(API_ROOT);

// Za sve /api/... rute (forms, users, itd.)
export const api = axios.create({ baseURL: `${ROOT}/api` });

// Samo za login/refresh na korenu (/token)
export const authApi = axios.create({ baseURL: ROOT });

// Zajednički interceptori
const attachCommonInterceptors = (inst) => {
  inst.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    config.headers.Accept = 'application/json';
    config.headers['ngrok-skip-browser-warning'] = 'true';
    return config;
  });
  return inst;
};

attachCommonInterceptors(api);
attachCommonInterceptors(authApi);

// Debug
if (typeof window !== 'undefined') {
  console.log('🔍 API_ROOT:', ROOT);
  console.log('🔍 api baseURL:', api.defaults.baseURL);
  console.log('🔍 authApi baseURL:', authApi.defaults.baseURL);
}

// radi kompatibilnosti sa postojećim importima
export default api;