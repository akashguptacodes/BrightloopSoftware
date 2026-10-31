import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white p-8 rounded-xl shadow-md max-w-lg w-full">
            <h1 className="text-3xl font-bold text-indigo-600 mb-2">Brightloop Software</h1>
            <p className="text-gray-600 mb-4 font-medium">Subscription & Recurring Billing Platform</p>
            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-lg text-left text-sm text-indigo-900 mb-6">
              <p className="font-semibold mb-1">Project Initialized Successfully! 🚀</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>React + Vite Frontend ready</li>
                <li>Express + Cloud Postgres + Redis Backend ready</li>
                <li>PDFKit Invoice Generator configured</li>
              </ul>
            </div>
            <p className="text-xs text-gray-400">Hackathon Starter Architecture</p>
          </div>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

