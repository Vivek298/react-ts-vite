// src/App.js
import React from 'react';
import Dashboard from './components/Dashboard';

function App() {
    return (
        <div className="bg-gray-100 min-h-screen">
            <div className="container mx-auto p-4">
                <h1 className="text-3xl font-bold mb-4">User Dashboard</h1>
                <Dashboard />
            </div>
        </div>
    );
}

export default App;
