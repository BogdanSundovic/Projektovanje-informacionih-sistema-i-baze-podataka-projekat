import React, { useState } from 'react';
import api from '../services/api';
import '../styles/form.css';

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async (e) => {
  e.preventDefault();

  if (password !== confirmPassword) {
    alert('Lozinke se ne poklapaju.');
    return;
  }

  try {
    console.log('📡 Šaljem POST ka /api/register...');
    const res = await api.post('/register', { username, email, password });

    localStorage.setItem('token', res.data.access_token || res.data.token);
    window.location.href = '/dashboard';
  } catch (err) {
    console.error('Backend greška:', err.response?.data || err.message);

    const message =
      err.response?.data?.detail ||
      err.response?.data?.message ||
      JSON.stringify(err.response?.data) ||
      'Registracija neuspešna';

    alert(message);
  }
};

 return (
    <div className="form-container">
      <h2>Registracija</h2>
      <form onSubmit={handleRegister}>
        <div className="input-group">
          <label>Korisničko ime</label>
          <input
            type="text"
            className="input-field"
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            className="input-field"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Lozinka</label>
          <input
            type="password"
            className="input-field"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Potvrdi lozinku</label>
          <input
            type="password"
            className="input-field"
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        <div className="button-group">
        <button type="submit">Registruj se</button>
        <button type="button" onClick={() => window.location.href = '/login'}>
        Prijavi se
        </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterPage;