import React, { useEffect, useState } from 'react';
import { getPatients, createPatient } from '../api/api';

export default function PatientList() {
  const [patients, setPatients] = useState([]);
  const [form, setForm] = useState({ name: '', dob: '', gender: 'Male', phone: '' });

  const load = async () => {
    const data = await getPatients(); // { patients, total, page, pages }
    setPatients(data.patients || []);
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await createPatient(form);
    setForm({ name: '', dob: '', gender: 'Male', phone: '' });
    load();
  };

  return (
    <div className="card">
      <h2>Patients</h2>
      <form onSubmit={handleAdd} className="inline-form">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} required />
        <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
          <option>Male</option><option>Female</option><option>Other</option>
        </select>
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
        <button type="submit">Add Patient</button>
      </form>
      <ul>
        {patients.map((p) => (
          <li key={p._id}>{p.name} — {p.gender} — {p.phone}</li>
        ))}
      </ul>
    </div>
  );
}