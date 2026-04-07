import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError } from '../store/slices/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [localErr, setLocalErr] = useState('');

  useEffect(() => { if (user) navigate('/'); }, [user, navigate]);
  useEffect(() => { return () => dispatch(clearError()); }, [dispatch]);

  const handleSubmit = e => {
    e.preventDefault();
    setLocalErr('');
    if (form.password !== form.confirm) { setLocalErr('Passwords do not match'); return; }
    if (form.password.length < 6) { setLocalErr('Password must be at least 6 characters'); return; }
    dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <div className="page-center">
      <div style={styles.card}>
        <h1 style={styles.title}>Create Account 🎉</h1>
        <p style={styles.sub}>Join thousands of happy shoppers</p>

        {(error || localErr) && <div className="alert alert-error">{error || localErr}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input required placeholder="Rahul Sharma"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required placeholder="rahul@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required placeholder="Min 6 characters"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Confirm Password</label>
            <input type="password" required placeholder="Re-enter password"
              value={form.confirm} onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}
            style={{ padding: 14, fontSize: 16, marginTop: 8 }}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={styles.link}>
          Already have an account? <Link to="/login" style={{ color: '#1a1a1a', fontWeight: 600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  card:  { background: 'white', border: '1px solid #eee', borderRadius: 16, padding: 40, width: '100%', maxWidth: 420 },
  title: { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub:   { color: '#888', fontSize: 14, marginBottom: 24 },
  link:  { textAlign: 'center', fontSize: 14, color: '#666', marginTop: 16 },
};
