const BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/v1`;

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers
    }
  });

  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text || 'Request failed' };
  }

  if (!response.ok) throw new Error(data?.message || 'Request failed');
  return data;
}

const json = (method, value) => ({ method, body: JSON.stringify(value) });

export const login = (email, password) => request('/auth/login', json('POST', { email, password }));
export const getDashboard = () => request('/reports/dashboard');
export const getNotifications = () => request('/notifications?limit=8');
export const markNotificationRead = (id) => request(`/notifications/${id}/read`, { method: 'PATCH' });

export const resourceApi = {
  patients: {
    path: '/patients',
    list: (query = '') => request(`/patients?${query}`),
    create: (record) => request('/patients', json('POST', record)),
    update: (id, record) => request(`/patients/${id}`, json('PUT', record)),
    remove: (id) => request(`/patients/${id}`, { method: 'DELETE' }),
    export: () => request('/bulk/patients/export')
  },
  doctors: {
    path: '/doctors',
    list: (query = '') => request(`/doctors?${query}`),
    create: (record) => request('/doctors', json('POST', record)),
    update: (id, record) => request(`/doctors/${id}`, json('PUT', record)),
    remove: (id) => request(`/doctors/${id}`, { method: 'DELETE' }),
    export: () => request('/bulk/doctors/export')
  },
  appointments: {
    path: '/appointments',
    list: (query = '') => request(`/appointments?${query}`),
    create: (record) => request('/appointments', json('POST', record)),
    update: (id, record) => request(`/appointments/${id}`, json('PUT', record)),
    remove: (id) => request(`/appointments/${id}`, { method: 'DELETE' }),
    export: () => request('/bulk/appointments/export')
  }
};

export const getReferenceData = async () => {
  const [patients, doctors] = await Promise.all([
    resourceApi.patients.list('limit=100&sort=name'),
    resourceApi.doctors.list('limit=100&sort=name')
  ]);
  return { patients: patients.data || [], doctors: doctors.data || [] };
};
