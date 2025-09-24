
// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MyFormsPage from "./pages/MyFormsPage";

import CreateFormPage from './pages/CreateFormPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';
import PublicFormsPage from './pages/PublicFormsPage';
import FillFormPage from './pages/FillFormPage';
import ViewResultsPage from './pages/ViewResultsPage';
import EditFormPage from './pages/EditFormPage';
import Navbar from './components/Navbar';
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminUserFormsPage from "./pages/AdminUserFormsPage";
import AdminEditUserPage from "./pages/AdminEditUserPage";

import './styles/variables.css';
import './styles/layout.css';
import './styles/form.css';

function App() {
  useEffect(() => {
    const saved = localStorage.getItem('theme'); // 'light' | 'dark' | null
    const root = document.documentElement;
    if (saved) {
      root.setAttribute('data-theme', saved);
    } else {
      root.removeAttribute('data-theme'); // koristi OS preferencu
    }
  }, []);

  return (
    <Router>
      <Navbar />

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/create-form" element={<PrivateRoute><CreateFormPage /></PrivateRoute>} />
        <Route path="/my-forms" element={<PrivateRoute><MyFormsPage /></PrivateRoute>} />
        <Route path="/form/view/:id" element={<FillFormPage />} />
        <Route path="/form/results/:id" element={<PrivateRoute><ViewResultsPage /></PrivateRoute>} />
        <Route path="/form/edit/:id" element={<PrivateRoute><EditFormPage /></PrivateRoute>} />
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/users/:userId/forms" element={<AdminUserFormsPage />} />
        <Route path="/admin/users/:userId/edit" element={<AdminEditUserPage />} />
        <Route path="/" element={<PublicFormsPage />} />
        <Route path="*" element={<LoginPage />} /> {/* Baca na login */}

      </Routes>
    </Router>
  );
}

export default App;
