// Attaches the JWT (from localStorage) to every request automatically.
const BASE_URL = 'http://localhost:5000/api';

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export const login = (email, password) =>
  request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });

export const getPatients = () => request('/patients');
export const createPatient = (patient) =>
  request('/patients', { method: 'POST', body: JSON.stringify(patient) });

export const getDoctors = () => request('/doctors');
export const createDoctor = (doctor) =>
  request('/doctors', { method: 'POST', body: JSON.stringify(doctor) });

export const getAppointments = () => request('/appointments');
export const createAppointment = (appt) =>
  request('/appointments', { method: 'POST', body: JSON.stringify(appt) });