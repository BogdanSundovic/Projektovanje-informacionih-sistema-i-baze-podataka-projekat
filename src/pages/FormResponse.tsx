import React from 'react';
import { useParams } from 'react-router-dom';

export default function FormResponse() {
  const { id } = useParams();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Form Response</h1>
        <p className="text-gray-600">Form ID: {id}</p>
      </div>
    </div>
  );
}