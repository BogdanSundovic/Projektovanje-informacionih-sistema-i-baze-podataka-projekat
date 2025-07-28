import React from 'react';
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


function App() {
  return (
    <Router>
       <Navbar /> {}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
        <Route path="/create-form" element={<PrivateRoute><CreateFormPage /></PrivateRoute>} />
        <Route path="/my-forms" element={<PrivateRoute><MyFormsPage /></PrivateRoute>} />
        <Route path="/form/view/:id" element={<FillFormPage />} />
        <Route path="/form/results/:id" element={<PrivateRoute><ViewResultsPage /></PrivateRoute>} />
        <Route path="/form/edit/:id" element={<PrivateRoute><EditFormPage /></PrivateRoute>}/>
        <Route path="/" element={<PublicFormsPage />} />
        <Route path="*" element={<LoginPage />} /> {/* Baca na login */}
      </Routes>
    </Router>
  );
}

export default App;
