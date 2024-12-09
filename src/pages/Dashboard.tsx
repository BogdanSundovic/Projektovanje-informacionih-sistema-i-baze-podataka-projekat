import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Users, Settings, Lock, Unlock } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { mockUsers } from '../stores/mockData';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to FormCraft</h2>
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

  const isAdmin = user?.role === 'admin';
  const formsToDisplay = isAdmin
    ? mockUsers.flatMap(u => u.forms.map(form => ({ ...form, owner: u.email })))
    : user?.forms || [];

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isAdmin ? 'All Forms' : 'My Forms'}
        </h1>
        {!isAdmin && (
          <Link
            to="/forms/new"
            className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Create Form</span>
          </Link>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {formsToDisplay.map((form) => (
          <div key={form.id} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{form.title}</h3>
                <p className="text-sm text-gray-500 mb-1">Questions: {form.questions.length}</p>
                {isAdmin && (
                  <p className="text-sm text-gray-500 mb-1">Owner: {form.owner}</p>
                )}
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <span>Access:</span>
                  {form.allowAnonymous ? (
                    <div className="flex items-center text-green-600">
                      <Unlock className="h-4 w-4 mr-1" />
                      <span>Public</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-orange-600">
                      <Lock className="h-4 w-4 mr-1" />
                      <span>Private</span>
                    </div>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  Created: {new Date(form.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex space-x-2">
                <Link
                  to={`/forms/${form.id}`}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="View form details"
                >
                  <Settings className="h-5 w-5" />
                </Link>
                <Link
                  to={`/forms/${form.id}/respond`}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="View responses"
                >
                  <FileText className="h-5 w-5" />
                </Link>
                {!isAdmin && (
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600"
                    title="Manage collaborators"
                  >
                    <Users className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600 line-clamp-2">{form.description}</p>
          </div>
        ))}
      </div>

      {formsToDisplay.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No forms found.</p>
        </div>
      )}
    </div>
  );
}