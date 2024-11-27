import React from 'react';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export default function Dashboard() {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to MissMatch</h2>
        <p className="mb-4">Please log in to create and manage your forms.</p>
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Forms</h2>
        <Link
          to="/forms/new"
          className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5" />
          <span>Create Form</span>
        </Link>
      </div>
      <div className="text-center text-gray-600">
        No forms created yet. Click the "Create Form" button to get started!
      </div>
    </div>
  );
}