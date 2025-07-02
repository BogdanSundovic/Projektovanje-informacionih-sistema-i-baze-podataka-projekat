import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import CreateFormPage from './pages/CreateFormPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="*" element={<LoginPage />} /> {/* Fallback na login */}
        <Route path="/create-form" element={<PrivateRoute><CreateFormPage /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
