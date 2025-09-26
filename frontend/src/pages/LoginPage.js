// frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import { authApi } from '../services/api';   // ⬅ koristimo authApi (koren), ne /api
import '../styles/form.css';

function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // korisničko ime (ili email ako backend podržava)
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // OAuth2 password flow (FastAPI): form-url-encoded na /token
      const body = new URLSearchParams({
        username: identifier.trim(),   // backend očekuje "username"
        password: password,
      });

      const res = await authApi.post('/token', body, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const tok = res.data?.access_token || res.data?.token;
      if (!tok) throw new Error('No access_token in response');

      localStorage.setItem('token', tok);

      const params = new URLSearchParams(window.location.search);
      const redirect = params.get('redirect');
      window.location.href = redirect ? decodeURIComponent(redirect) : '/dashboard';
    } catch (err) {
      console.error('Login greška:', err.response?.data || err.message);
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Neuspešan login';
      alert(msg);
    }
  };

  return (
    <div className="form-container">
      <h2>Prijava</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email ili korisničko ime</label>
          <input
            type="text"
            className="input-field"
            placeholder="Unesite email ili korisničko ime"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Lozinka</label>
          <input
            type="password"
            className="input-field"
            placeholder="Unesite lozinku"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="button-group">
          <button type="submit">Prijavi se</button>
          <button type="button" onClick={() => (window.location.href = '/register')}>
            Registruj se
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;