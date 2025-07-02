import React from 'react';
import { useNavigate } from 'react-router-dom';
import { decodeToken } from '../utils/decodeToken';

function DashboardPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const user = decodeToken(token);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  const handleCreateForm = () => {
    navigate('/create-form');
  };

  return (
    <div>
      <h1>Dobrodošao, {user?.username || 'Korisnik'}!</h1>
      <button onClick={handleCreateForm}>Napravi novu formu</button>
      <button onClick={handleLogout}>Odjavi se</button>
    </div>
  );
}

export default DashboardPage;
