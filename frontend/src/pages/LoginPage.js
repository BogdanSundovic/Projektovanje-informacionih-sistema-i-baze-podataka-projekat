import React, { useState } from 'react';
import api from '../services/api';
import '../styles/form.css';

function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // email ili korisničko ime
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
  e.preventDefault();

    try {
      const res = await api.post('/login', {
        identifier,
        password
      });

        localStorage.setItem('token', res.data.token || res.data.access_token);
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect');
        window.location.href = redirect ? decodeURIComponent(redirect) : '/dashboard';
      } catch (err) {
        console.error('Login greška:', err.response?.data || err.message);
        const message =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          'Neuspešan login';
        alert(message);
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
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="button-group">
          <button type="submit">Prijavi se</button>
          <button type="button" onClick={() => window.location.href = '/register'}>
            Registruj se
          </button>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
