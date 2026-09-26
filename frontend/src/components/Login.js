import React, { useState } from 'react';
import { ArrowRight, HeartPulse, LockKeyhole } from 'lucide-react';
import { login } from '../api/api';

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const data = await login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="login-brand"><span className="login-brand-mark"><HeartPulse size={20} /></span><span>medi<span>track</span><small>CARE OPERATIONS</small></span></div>
        <div className="login-visual-copy"><p className="eyebrow">BETTER COORDINATION, BETTER CARE</p><h1>Your clinic,<br />in good hands.</h1><p>A clear, connected view of the people and appointments at the heart of your clinic.</p></div>
        <div className="login-visual-footer"><span>SECURE CLINICAL WORKSPACE</span><span>MEDTRACK · 2026</span></div>
      </section>
      <section className="login-form-side">
        <div className="login-card">
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in to MediTrack</h2>
          <p>Use your clinic account to continue.</p>
          <form className="login-form" onSubmit={handleSubmit}>
            <label className="form-field"><span>Email address</span><input autoComplete="username" type="email" placeholder="name@clinic.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label className="form-field"><span>Password</span><input autoComplete="current-password" type="password" placeholder="Enter your password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
            {error && <div className="inline-alert" role="alert">{error}</div>}
            <button className="button button-primary login-submit" type="submit" disabled={submitting}>{submitting ? 'Signing in…' : 'Sign in'}{!submitting && <ArrowRight size={16} />}</button>
          </form>
          <p className="login-hint"><LockKeyhole size={13} /> Your account is protected with secure, encrypted sign-in.</p>
        </div>
      </section>
    </main>
  );
}
