import React, { useState } from 'react';
import Login from './components/Login';
import PatientList from './components/PatientList';
import DoctorList from './components/DoctorList';
import AppointmentList from './components/AppointmentList';

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) return <Login onLogin={setUser} />;

  return (
    <div className="app">
      <header>
        <h1>MediTrack</h1>
        <span>{user.name} ({user.role})</span>
        <button onClick={handleLogout}>Logout</button>
      </header>
      <main>
        <PatientList />
        <DoctorList />
        <AppointmentList />
      </main>
    </div>
  );
}