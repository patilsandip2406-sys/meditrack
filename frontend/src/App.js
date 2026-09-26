import React, { useEffect, useState } from 'react';
import {
  Activity, ArrowDownRight, ArrowRight, Bell, CalendarDays, ChevronDown,
  ClipboardPlus, HeartPulse, LayoutDashboard, LogOut, Menu, Stethoscope,
  UsersRound, X
} from 'lucide-react';
import Login from './components/Login';
import ResourcePage from './components/ResourcePage';
import { getDashboard, getNotifications, markNotificationRead } from './api/api';
import './App.css';

const navigation = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'patients', label: 'Patients', icon: UsersRound },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays }
];

function readSavedUser() {
  try {
    return JSON.parse(localStorage.getItem('user'));
  } catch {
    localStorage.removeItem('user');
    return null;
  }
}

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || 'MT';
}

function formatDate(value, options = { month: 'short', day: 'numeric' }) {
  return value ? new Intl.DateTimeFormat('en', options).format(new Date(value)) : '—';
}

function formatToday(options) {
  return new Intl.DateTimeFormat('en', options).format(new Date());
}

function Overview({ user, onNavigate }) {
  const [report, setReport] = useState(null);
  const [reportError, setReportError] = useState('');

  useEffect(() => {
    let active = true;
    getDashboard().then((response) => {
      if (active) setReport(response.data);
    }).catch((error) => {
      if (active) setReportError(error.message);
    });
    return () => { active = false; };
  }, []);

  const totals = report?.totals || {};
  const metrics = [
    { label: 'Total patients', value: totals.patients ?? '—', note: 'In the care directory', icon: UsersRound, tone: 'teal' },
    { label: 'Active clinicians', value: totals.doctors ?? '—', note: 'Across all specialties', icon: Stethoscope, tone: 'coral' },
    { label: 'Appointments', value: totals.appointments ?? '—', note: `${totals.todaysAppointments ?? 0} scheduled today`, icon: CalendarDays, tone: 'blue' }
  ];

  return (
    <section className="overview-view">
      <div className="welcome-band">
        <div className="welcome-copy">
          <p className="eyebrow">{formatToday({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()} <span>·</span> CLINIC OPERATIONS</p>
          <h1>Good care starts<br />with a clear view.</h1>
          <p>Welcome back, {user.name.split(' ')[0]}. Here’s what’s happening across your clinic.</p>
          <button className="button button-white" onClick={() => onNavigate('appointments')}>View today’s schedule <ArrowRight size={16} /></button>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <div className="art-ring ring-one" /><div className="art-ring ring-two" />
          <div className="art-core"><HeartPulse size={56} strokeWidth={1.4} /></div>
          <span className="art-note note-top"><Activity size={16} /> Care in motion</span>
          <span className="art-note note-bottom">MediTrack <b>+</b></span>
        </div>
      </div>

      {reportError && <div className="inline-alert dashboard-alert">Dashboard summary is unavailable for this account: {reportError}</div>}

      <div className="section-title-row"><div><p className="eyebrow">AT A GLANCE</p><h2>Clinic overview</h2></div><span className="updated-label"><i /> Updated just now</span></div>
      <div className="metric-grid">
        {metrics.map(({ label, value, note, icon: Icon, tone }) => (
          <article className="metric-card" key={label}>
            <div className={`metric-icon metric-${tone}`}><Icon size={19} /></div>
            <span className="metric-label">{label}</span>
            <strong>{value}</strong>
            <span className="metric-note">{note}</span>
            <ArrowDownRight className="metric-arrow" size={17} />
          </article>
        ))}
      </div>

      <div className="dashboard-lower">
        <section className="schedule-panel">
          <div className="panel-heading"><div><p className="eyebrow">UP NEXT</p><h2>Upcoming appointments</h2></div><button className="text-button" onClick={() => onNavigate('appointments')}>Full schedule <ArrowRight size={15} /></button></div>
          {report?.upcomingAppointments?.length ? <div className="upcoming-list">{report.upcomingAppointments.slice(0, 5).map((appointment) => (
            <div className="upcoming-row" key={appointment.id}>
              <div className="time-rail"><strong>{formatDate(appointment.date, { hour: 'numeric', minute: '2-digit' })}</strong><span /></div>
              <div className="upcoming-person"><span className="avatar avatar-patient">{initials(appointment.patient?.name)}</span><div><strong>{appointment.patient?.name || 'Patient'}</strong><small>with Dr. {appointment.doctor?.name || 'Clinician'}</small></div></div>
              <span className="status status-scheduled">{appointment.status}</span>
            </div>
          ))}</div> : <div className="schedule-empty"><CalendarDays size={23} /><strong>No upcoming visits</strong><span>Appointments scheduled for later will appear here.</span><button className="text-button" onClick={() => onNavigate('appointments')}>Book an appointment <ArrowRight size={15} /></button></div>}
        </section>
        <section className="quick-panel"><div className="panel-heading"><div><p className="eyebrow">SHORTCUTS</p><h2>Quick actions</h2></div><ClipboardPlus size={19} /></div>
          <button className="quick-action" onClick={() => onNavigate('patients')}><span className="quick-action-icon quick-teal"><UsersRound size={18} /></span><span><strong>Add a patient</strong><small>Register a new patient record</small></span><ArrowRight size={16} /></button>
          <button className="quick-action" onClick={() => onNavigate('doctors')}><span className="quick-action-icon quick-coral"><Stethoscope size={18} /></span><span><strong>Manage care team</strong><small>View clinicians and specialties</small></span><ArrowRight size={16} /></button>
          <button className="quick-action" onClick={() => onNavigate('appointments')}><span className="quick-action-icon quick-blue"><CalendarDays size={18} /></span><span><strong>Schedule a visit</strong><small>Coordinate the next appointment</small></span><ArrowRight size={16} /></button>
        </section>
      </div>
    </section>
  );
}

function NotificationMenu({ notifications, onClose, onRead }) {
  return (
    <div className="notification-menu">
      <div className="notification-heading"><div><strong>Notifications</strong><small>{notifications.length ? `${notifications.length} recent updates` : 'You’re all caught up'}</small></div><button className="icon-button" aria-label="Close notifications" onClick={onClose}><X size={17} /></button></div>
      {notifications.length ? notifications.map((notification) => (
        <button className={`notification-item ${notification.readAt ? '' : 'notification-unread'}`} key={notification.id} onClick={() => onRead(notification)}>
          <span className={`notification-dot notification-${notification.type}`} />
          <span><strong>{notification.message}</strong><small>{formatDate(notification.createdAt, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</small></span>
        </button>
      )) : <div className="notification-empty"><Bell size={20} /><span>New updates will show here.</span></div>}
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(readSavedUser);
  const [activePage, setActivePage] = useState('overview');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!user) return undefined;
    let active = true;
    getNotifications().then((result) => {
      if (active) setNotifications(result.data || []);
    }).catch(() => {});
    return () => { active = false; };
  }, [user]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(''), 3200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const navigate = (page) => {
    setActivePage(page);
    setMobileNavOpen(false);
    setNotificationOpen(false);
  };

  const handleNotificationRead = async (notification) => {
    if (!notification.readAt) {
      try {
        const updated = await markNotificationRead(notification.id);
        setNotifications((current) => current.map((item) => item.id === updated.id ? updated : item));
      } catch (error) {
        setToast(error.message);
      }
    }
  };

  if (!user) return <Login onLogin={setUser} />;

  const currentNavigation = navigation.find((item) => item.id === activePage) || navigation[0];
  const unreadCount = notifications.filter((notification) => !notification.readAt).length;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? 'sidebar-open' : ''}`}>
        <div className="brand-lockup"><span className="brand-mark"><HeartPulse size={21} strokeWidth={2.1} /></span><span><strong>medi<span>track</span></strong><small>CARE OPERATIONS</small></span><button className="mobile-close icon-button" aria-label="Close menu" onClick={() => setMobileNavOpen(false)}><X size={18} /></button></div>
        <div className="workspace-switch"><span className="workspace-symbol">N</span><span><strong>Northstar Clinic</strong><small>Primary care</small></span><ChevronDown size={15} /></div>
        <div className="nav-caption">WORKSPACE</div>
        <nav className="main-nav" aria-label="Main menu">
          {navigation.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${activePage === id ? 'nav-active' : ''}`} onClick={() => navigate(id)} aria-current={activePage === id ? 'page' : undefined}><Icon size={18} strokeWidth={activePage === id ? 2.2 : 1.8} /><span>{label}</span>{activePage === id && <i />}</button>)}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-note"><span className="note-icon"><Activity size={15} /></span><span><strong>All systems steady</strong><small>Clinic workspace is active</small></span><i /></div>
        <button className="sidebar-help" onClick={() => window.open('http://localhost:5000/api/docs/', '_blank', 'noopener,noreferrer')}><span>?</span> API documentation <ArrowRight size={14} /></button>
        <div className="sidebar-user"><span className="user-avatar">{initials(user.name)}</span><span className="user-summary"><strong>{user.name}</strong><small>{user.role}</small></span><button className="icon-button logout-button" aria-label="Log out" title="Log out" onClick={handleLogout}><LogOut size={16} /></button></div>
      </aside>

      {mobileNavOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMobileNavOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-button" aria-label="Open menu" onClick={() => setMobileNavOpen(true)}><Menu size={20} /></button>
          <div className="breadcrumbs"><span>MediTrack</span><span>/</span><strong>{currentNavigation.label}</strong></div>
          <div className="topbar-actions"><span className="today-label"><CalendarDays size={15} /> {formatToday({ weekday: 'short', month: 'short', day: 'numeric' })}</span><div className="topbar-divider" />
            <div className="notification-anchor"><button className={`icon-button notification-trigger ${notificationOpen ? 'control-active' : ''}`} aria-label="Open notifications" onClick={() => setNotificationOpen((open) => !open)}><Bell size={18} />{unreadCount > 0 && <i>{unreadCount > 9 ? '9+' : unreadCount}</i>}</button>{notificationOpen && <NotificationMenu notifications={notifications} onClose={() => setNotificationOpen(false)} onRead={handleNotificationRead} />}</div>
            <button className="topbar-logout" onClick={handleLogout}><LogOut size={15} /><span>Log out</span></button>
            <button className="topbar-profile" onClick={() => setNotificationOpen(false)}><span className="user-avatar user-avatar-small">{initials(user.name)}</span><ChevronDown size={14} /></button>
          </div>
        </header>
        <div className="mobile-nav-strip">{navigation.map(({ id, label, icon: Icon }) => <button key={id} className={activePage === id ? 'mobile-nav-active' : ''} onClick={() => navigate(id)}><Icon size={16} />{label}</button>)}</div>
        <div className="content-wrap" key={activePage}>
          {activePage === 'overview' ? <Overview user={user} onNavigate={navigate} /> : <ResourcePage resourceKey={activePage} onToast={setToast} />}
        </div>
        <footer className="app-footer"><span>MEDTRACK <b>·</b> CLINIC OPERATIONS</span><span>Secure workspace <i /></span></footer>
      </main>
      {toast && <div className="toast-message" role="status"><span>✓</span>{toast}</div>}
    </div>
  );
}
