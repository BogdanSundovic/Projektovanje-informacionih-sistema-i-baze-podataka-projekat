import React from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

export default function Dashboard() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to MissMatch</h2>
        <p className="mb-4">Please log in to view your forms.</p>
        <Link
          to="/login"
          className="inline-block bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Login
        </Link>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">My Forms</h2>
      <p className="text-gray-600">No forms created yet. Form creation will be available in the next update!</p>
    </div>
  );
}