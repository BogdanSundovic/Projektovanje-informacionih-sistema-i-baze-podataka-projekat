// src/components/Navbar.jsx
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/layout.css';

const Navbar = () => {
  const token = localStorage.getItem('token');
  const isLoggedIn = !!token;
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate(isLoggedIn ? '/dashboard' : '/public-forms');
  };

  // rute gde ne prikazujemo Back
  const HIDE_BACK_ROUTES = new Set([
    '/',
    '/login',
    '/register',
    '/public-forms',
    '/dashboard',
  ]);
  const path = location.pathname;
  const showBack = !HIDE_BACK_ROUTES.has(path);

  // === THEME TOGGLE ===
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || '');
  useEffect(() => {
    const root = document.documentElement;
    if (!theme) {
      root.removeAttribute('data-theme');
      localStorage.removeItem('theme');
    } else {
      root.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    }
  }, [theme]);

  const cycleTheme = () => {
    if (!theme) setTheme('dark');       // auto -> dark
    else if (theme === 'dark') setTheme('light'); // dark -> light
    else setTheme('');                  // light -> auto
  };

  const themeIcon = theme === 'dark' ? '🌞' : theme === 'light' ? '🖥️' : '🌙';
  const themeTitle =
    theme === 'dark' ? 'Light mode' :
    theme === 'light' ? 'Auto (system)' :
    'Dark mode';

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <Link
          to={isLoggedIn ? '/dashboard' : '/public-forms'}
          className="navbar-home"
        >
          Home
        </Link>

        {showBack && (
          <button onClick={handleBack} className="navbar-button back-button">
            <FaArrowLeft className="back-icon" />
          </button>
        )}
      </div>

      <div className="navbar-right">
        <button
          type="button"
          className="navbar-button navbar-icon"
          onClick={cycleTheme}
          title={themeTitle}
          aria-label="Toggle theme"
        >
          {themeIcon}
        </button>

        {isLoggedIn ? (
          <button onClick={handleLogout} className="navbar-button">Logout</button>
        ) : (
          <Link to="/login" className="navbar-button">Login</Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
