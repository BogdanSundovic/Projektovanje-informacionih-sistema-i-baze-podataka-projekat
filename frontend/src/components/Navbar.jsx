// src/components/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/layout.css';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link to={isLoggedIn ? "/dashboard" : "/"} className="navbar-home">Home</Link>
      </div>
      <div className="navbar-right">
        {token ? (
          <button onClick={handleLogout} className="navbar-button">Logout</button>
        ) : (
          <Link to="/login" className="navbar-button">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
