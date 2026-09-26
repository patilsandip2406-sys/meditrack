import React, { useEffect, useState } from 'react';
import { getAppointments, createAppointment, getPatients, getDoctors } from '../api/api';

export default function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patient: '', doctor: '', date: '', reason: '' });
  const [error, setError] = useState('');

  const load = async () => {
    setAppointments(await getAppointments());
    const p = await getPatients();
    setPatients(p.patients || []);
    setDoctors(await getDoctors());
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await createAppointment(form);
      setForm({ patient: '', doctor: '', date: '', reason: '' });
      load();
    } catch (err) {
      setError(err.message); // e.g. "doctor already has an appointment at that time"
    }
  };

  return (
    <div className="card">
      <h2>Appointments</h2>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleAdd} className="inline-form">
        <select value={form.patient} onChange={(e) => setForm({ ...form, patient: e.target.value })} required>
          <option value="">Select Patient</option>
          {patients.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={form.doctor} onChange={(e) => setForm({ ...form, doctor: e.target.value })} required>
          <option value="">Select Doctor</option>
          {doctors.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
        <input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
        <input placeholder="Reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} required />
        <button type="submit">Book</button>
      </form>
      <ul>
        {appointments.map((a) => (
          <li key={a._id}>
            {new Date(a.date).toLocaleString()} — {a.patient?.name} with Dr. {a.doctor?.name} ({a.status})
          </li>
        ))}
      </ul>
    </div>
  );
}