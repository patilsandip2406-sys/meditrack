import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowDownUp, ChevronLeft, ChevronRight, Download, Edit3, Plus, Search, Trash2, X
} from 'lucide-react';
import { getReferenceData, resourceApi } from '../api/api';

const resourceConfig = {
  patients: {
    title: 'Patient directory',
    description: 'Manage patient records and clinical details.',
    singular: 'patient',
    columns: [
      { key: 'name', label: 'Patient', primary: true, render: (row) => <><span className="avatar avatar-patient">{initials(row.name)}</span><span><strong>{row.name}</strong><small>PT-{String(row.id).padStart(4, '0')}</small></span></> },
      { key: 'dob', label: 'Date of birth', render: (row) => formatDate(row.dob, false) },
      { key: 'gender', label: 'Gender' },
      { key: 'phone', label: 'Phone' },
      { key: 'bloodGroup', label: 'Blood type', render: (row) => row.bloodGroup || '—' }
    ],
    fields: [
      { name: 'name', label: 'Full name', required: true },
      { name: 'dob', label: 'Date of birth', type: 'date', required: true },
      { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'], required: true },
      { name: 'phone', label: 'Phone number', type: 'tel', required: true },
      { name: 'bloodGroup', label: 'Blood type', placeholder: 'e.g. O+' },
      { name: 'address', label: 'Address', wide: true, placeholder: 'Street, city, postal code' },
      { name: 'medicalHistoryText', label: 'Medical history', type: 'textarea', wide: true, placeholder: 'Separate entries with commas' }
    ],
    initial: { name: '', dob: '', gender: 'Male', phone: '', bloodGroup: '', address: '', medicalHistoryText: '' },
    toPayload: (form) => ({
      ...form,
      ...(form.bloodGroup.trim() ? {} : { bloodGroup: undefined }),
      medicalHistory: form.medicalHistoryText.split(',').map((item) => item.trim()).filter(Boolean),
      medicalHistoryText: undefined
    }),
    fromRecord: (row) => ({ ...row, dob: row.dob?.slice(0, 10) || '', medicalHistoryText: row.medicalHistory?.join(', ') || '' }),
    searchFields: 'name,phone,bloodGroup'
  },
  doctors: {
    title: 'Care team',
    description: 'Keep clinician profiles and specialties up to date.',
    singular: 'doctor',
    columns: [
      { key: 'name', label: 'Clinician', primary: true, render: (row) => <><span className="avatar avatar-doctor">{initials(row.name)}</span><span><strong>Dr. {row.name}</strong><small>{row.email}</small></span></> },
      { key: 'specialization', label: 'Specialty' },
      { key: 'phone', label: 'Phone', render: (row) => row.phone || '—' },
      { key: 'availableDays', label: 'Availability', render: (row) => row.availableDays?.join(', ') || 'Not set' }
    ],
    fields: [
      { name: 'name', label: 'Full name', required: true },
      { name: 'specialization', label: 'Specialty', required: true },
      { name: 'email', label: 'Work email', type: 'email', required: true },
      { name: 'phone', label: 'Phone number', type: 'tel' },
      { name: 'availableDaysText', label: 'Available days', wide: true, placeholder: 'Monday, Wednesday, Friday' }
    ],
    initial: { name: '', specialization: '', email: '', phone: '', availableDaysText: '' },
    toPayload: (form) => ({
      ...form,
      ...(form.phone.trim() ? {} : { phone: undefined }),
      availableDays: form.availableDaysText.split(',').map((item) => item.trim()).filter(Boolean),
      availableDaysText: undefined
    }),
    fromRecord: (row) => ({ ...row, availableDaysText: row.availableDays?.join(', ') || '' }),
    searchFields: 'name,specialization'
  },
  appointments: {
    title: 'Appointment schedule',
    description: 'Coordinate upcoming visits and update appointment status.',
    singular: 'appointment',
    columns: [
      { key: 'date', label: 'Date & time', primary: true, render: (row) => <><span className="date-block"><strong>{formatDate(row.date, false)}</strong><small>{formatTime(row.date)}</small></span></> },
      { key: 'patient', label: 'Patient', render: (row) => row.patient?.name || `Patient ${row.patientId}` },
      { key: 'doctor', label: 'Clinician', render: (row) => row.doctor?.name ? `Dr. ${row.doctor.name}` : `Doctor ${row.doctorId}` },
      { key: 'reason', label: 'Visit reason' },
      { key: 'status', label: 'Status', render: (row) => <span className={`status status-${row.status?.toLowerCase()}`}>{row.status}</span> }
    ],
    fields: [
      { name: 'patient', label: 'Patient', type: 'patient', required: true },
      { name: 'doctor', label: 'Clinician', type: 'doctor', required: true },
      { name: 'date', label: 'Date & time', type: 'datetime-local', required: true },
      { name: 'reason', label: 'Visit reason', required: true, wide: true },
      { name: 'status', label: 'Status', type: 'select', options: ['Scheduled', 'Completed', 'Cancelled'] },
      { name: 'notes', label: 'Notes', type: 'textarea', wide: true }
    ],
    initial: { patient: '', doctor: '', date: '', reason: '', status: 'Scheduled', notes: '' },
    toPayload: (form, editing) => {
      const payload = { ...form };
      if (editing) {
        delete payload.patient;
        delete payload.doctor;
      } else {
        payload.patient = Number(payload.patient);
        payload.doctor = Number(payload.doctor);
        delete payload.status;
      }
      return payload;
    },
    fromRecord: (row) => ({ ...row, patient: String(row.patientId), doctor: String(row.doctorId), date: row.date?.slice(0, 16) || '' }),
    searchFields: 'reason,status'
  }
};

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'MT';
}

function formatDate(value, includeYear = true) {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', ...(includeYear ? { year: 'numeric' } : {}) }).format(new Date(value));
}

function formatTime(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

function downloadCsv(filename, rows, columns) {
  const csv = [columns.map((column) => column.label), ...rows.map((row) => columns.map((column) => {
    const value = typeof column.exportValue === 'function' ? column.exportValue(row) : row[column.key];
    return String(value ?? '').replaceAll('"', '""');
  }))].map((line) => line.map((value) => `"${value}"`).join(',')).join('\r\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function ResourcePage({ resourceKey, onToast }) {
  const config = resourceConfig[resourceKey];
  const api = resourceApi[resourceKey];
  const [rows, setRows] = useState([]);
  const [references, setReferences] = useState({ patients: [], doctors: [] });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0, limit: 10 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState(resourceKey === 'doctors' ? 'name' : '-createdAt');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(config.initial);
  const [saving, setSaving] = useState(false);

  const query = useMemo(() => {
    const params = new URLSearchParams({ page: String(page), limit: String(pagination.limit), sort });
    if (search.trim()) params.set('search', search.trim());
    if (statusFilter && resourceKey === 'appointments') params.set('filter[status]', statusFilter);
    return params.toString();
  }, [page, pagination.limit, resourceKey, search, sort, statusFilter]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    Promise.all([
      api.list(query),
      resourceKey === 'appointments' ? getReferenceData() : Promise.resolve(null)
    ]).then(([result, referenceData]) => {
      if (!active) return;
      setRows(result.data || []);
      setPagination((current) => ({ ...current, ...(result.pagination || {}) }));
      if (referenceData) setReferences(referenceData);
    }).catch((requestError) => {
      if (active) setError(requestError.message);
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [api, query, resourceKey]);

  const openCreate = () => {
    setEditing(null);
    setForm(config.initial);
    setError('');
    setDrawerOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({ ...config.initial, ...config.fromRecord(row) });
    setError('');
    setDrawerOpen(true);
  };

  const closeDrawer = () => {
    if (saving) return;
    setDrawerOpen(false);
    setEditing(null);
    setForm(config.initial);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = config.toPayload(form, Boolean(editing));
      if (editing) await api.update(editing.id, payload);
      else await api.create(payload);
      setDrawerOpen(false);
      setEditing(null);
      setForm(config.initial);
      onToast(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} ${editing ? 'updated' : 'created'}`);
      setPage(1);
      const result = await api.list(query);
      setRows(result.data || []);
      setPagination((current) => ({ ...current, ...(result.pagination || {}) }));
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    const subject = row.name || `${config.singular} #${row.id}`;
    if (!window.confirm(`Delete ${subject}? This action cannot be undone.`)) return;
    try {
      await api.remove(row.id);
      onToast(`${config.singular[0].toUpperCase()}${config.singular.slice(1)} deleted`);
      const result = await api.list(query);
      setRows(result.data || []);
      setPagination((current) => ({ ...current, ...(result.pagination || {}) }));
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const handleExport = () => {
    downloadCsv(`meditrack-${resourceKey}.csv`, rows, config.columns.map((column) => ({
      ...column,
      exportValue: column.key === 'patient' ? (row) => row.patient?.name :
        column.key === 'doctor' ? (row) => row.doctor?.name :
          column.key === 'date' ? (row) => new Date(row.date).toISOString() : undefined
    })));
  };

  return (
    <section className="workspace-view" aria-labelledby="resource-heading">
      <div className="page-heading">
        <div>
          <p className="eyebrow">CLINICAL OPERATIONS / {resourceKey.toUpperCase()}</p>
          <h1 id="resource-heading">{config.title}</h1>
          <p className="page-description">{config.description}</p>
        </div>
        <button className="button button-primary" onClick={openCreate}>
          <Plus size={17} strokeWidth={2.4} /> Add {config.singular}
        </button>
      </div>

      <div className="toolbar">
        <label className="search-control">
          <Search size={17} />
          <input aria-label={`Search ${config.singular}s`} placeholder={`Search ${config.singular}s`} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} />
          <kbd>/</kbd>
        </label>
        {resourceKey === 'appointments' && (
          <select className="filter-select" aria-label="Filter appointment status" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }}>
            <option value="">All statuses</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        )}
        <label className="sort-select"><ArrowDownUp size={15} /><select aria-label="Sort records" value={sort} onChange={(event) => { setSort(event.target.value); setPage(1); }}>
          {resourceKey !== 'appointments' && <option value="name">Name A–Z</option>}
          <option value="-createdAt">Newest first</option>
          {resourceKey === 'appointments' && <option value="date">Date ascending</option>}
        </select></label>
        <button className="button button-quiet export-button" onClick={handleExport}><Download size={16} /> Export CSV</button>
      </div>

      <div className="table-panel">
        <div className="table-panel-heading">
          <div><strong>{config.title}</strong><span>{pagination.total} records</span></div>
          <span className="live-indicator"><i /> Live data</span>
        </div>
        {error && !drawerOpen && <div className="inline-alert" role="alert">{error}</div>}
        <div className="table-scroll">
          <table>
            <thead><tr>{config.columns.map((column) => <th key={column.key}>{column.label}</th>)}<th className="actions-heading">Actions</th></tr></thead>
            <tbody>
              {loading && <tr><td colSpan={config.columns.length + 1} className="table-state">Loading records…</td></tr>}
              {!loading && !rows.length && <tr><td colSpan={config.columns.length + 1} className="table-state"><span className="empty-mark">+</span><strong>No {config.singular}s found</strong><span>Adjust the search or add a new record.</span></td></tr>}
              {!loading && rows.map((row) => (
                <tr key={row.id}>
                  {config.columns.map((column) => <td key={column.key} className={column.primary ? 'primary-cell' : ''}>{column.render ? column.render(row) : row[column.key] || '—'}</td>)}
                  <td><div className="row-actions">
                    <button className="icon-button" title={`Edit ${config.singular}`} aria-label={`Edit ${config.singular}`} onClick={() => openEdit(row)}><Edit3 size={16} /></button>
                    <button className="icon-button icon-danger" title={`Delete ${config.singular}`} aria-label={`Delete ${config.singular}`} onClick={() => handleDelete(row)}><Trash2 size={16} /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="table-footer">
          <span>Showing {rows.length ? (page - 1) * pagination.limit + 1 : 0}–{Math.min(page * pagination.limit, pagination.total)} of {pagination.total}</span>
          <div className="pagination-controls">
            <button className="icon-button" aria-label="Previous page" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft size={17} /></button>
            <span>Page <strong>{page}</strong> of {Math.max(pagination.pages, 1)}</span>
            <button className="icon-button" aria-label="Next page" disabled={page >= pagination.pages || loading} onClick={() => setPage((current) => current + 1)}><ChevronRight size={17} /></button>
          </div>
        </div>
      </div>

      {drawerOpen && <div className="drawer-scrim" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDrawer(); }}>
        <aside className="record-drawer" role="dialog" aria-modal="true" aria-labelledby="drawer-heading">
          <div className="drawer-heading"><div><p className="eyebrow">{editing ? 'RECORD DETAILS' : 'NEW RECORD'}</p><h2 id="drawer-heading">{editing ? `Edit ${config.singular}` : `Add ${config.singular}`}</h2></div><button className="icon-button" aria-label="Close form" onClick={closeDrawer}><X size={19} /></button></div>
          <form onSubmit={handleSave}>
            <div className="form-grid">
              {config.fields.filter((field) => !(editing && resourceKey === 'appointments' && ['patient', 'doctor'].includes(field.name))).map((field) => (
                <label key={field.name} className={`form-field ${field.wide ? 'field-wide' : ''}`}>
                  <span>{field.label}{field.required && <b> *</b>}</span>
                  {field.type === 'select' ? <select value={form[field.name] ?? ''} required={field.required} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}><option value="">Choose {field.label.toLowerCase()}</option>{field.options.map((option) => <option key={option} value={option}>{option}</option>)}</select> :
                    field.type === 'textarea' ? <textarea rows="3" placeholder={field.placeholder} value={form[field.name] ?? ''} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} /> :
                      field.type === 'patient' || field.type === 'doctor' ? <select value={form[field.name] ?? ''} required={field.required} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })}><option value="">Select {field.label.toLowerCase()}</option>{references[field.type === 'patient' ? 'patients' : 'doctors'].map((record) => <option key={record.id} value={record.id}>{record.name}{field.type === 'doctor' ? ` · ${record.specialization}` : ''}</option>)}</select> :
                        <input type={field.type || 'text'} required={field.required} placeholder={field.placeholder} value={form[field.name] ?? ''} onChange={(event) => setForm({ ...form, [field.name]: event.target.value })} />}
                </label>
              ))}
            </div>
            {error && <div className="inline-alert" role="alert">{error}</div>}
            <div className="drawer-actions"><button type="button" className="button button-quiet" onClick={closeDrawer} disabled={saving}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : `Create ${config.singular}`}</button></div>
          </form>
        </aside>
      </div>}
    </section>
  );
}
