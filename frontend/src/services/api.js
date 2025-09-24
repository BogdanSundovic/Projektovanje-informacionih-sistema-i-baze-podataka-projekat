import axios from 'axios';

const base = '/api';

const instance = axios.create({
  baseURL: base,
});

console.log("🔍 BASE URL:", base);

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  config.headers["Accept"] = "application/json";
  config.headers["ngrok-skip-browser-warning"] = "true"; // Zaobilazi ngrok blokadu
  
  return config;
});

export default instance;
