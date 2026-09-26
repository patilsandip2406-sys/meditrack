import React, { useEffect, useState } from 'react';
import { getDoctors, createDoctor } from '../api/api';

export default function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ name: '', specialization: '', email: '' });

  const load = async () => setDoctors(await getDoctors());
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    await createDoctor(form);
    setForm({ name: '', specialization: '', email: '' });
    load();
  };

  return (
    <div className="card">
      <h2>Doctors</h2>
      <form onSubmit={handleAdd} className="inline-form">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Specialization" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required />
        <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <button type="submit">Add Doctor</button>
      </form>
      <ul>
        {doctors.map((d) => (
          <li key={d._id}>{d.name} — {d.specialization}</li>
        ))}
      </ul>
    </div>
  );
}