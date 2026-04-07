import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearError } from '../store/slices/authSlice';

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { loading, error, user } = useSelector(s => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });
  const from = location.state?.from?.pathname || '/';

  useEffect(() => { if (user) navigate(from, { replace: true }); }, [user, navigate, from]);
  useEffect(() => { return () => dispatch(clearError()); }, [dispatch]);

  const handleSubmit = e => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <div className="page-center">
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome back 👋</h1>
        <p style={styles.sub}>Login to continue shopping</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" required placeholder="you@example.com"
              value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" required placeholder="••••••••"
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          </div>
          <button type="submit" className="btn btn-primary btn-full" disabled={loading}
            style={{ padding: 14, fontSize: 16, marginTop: 8 }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={styles.testCreds}>
          <strong>Test credentials:</strong><br />
          Admin: admin@shop.com / password123<br />
          User: rahul@test.com / password123
        </div>

        <p style={styles.link}>
          Don't have an account? <Link to="/register" style={{ color: '#1a1a1a', fontWeight: 600 }}>Register</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  card:      { background: 'white', border: '1px solid #eee', borderRadius: 16, padding: 40, width: '100%', maxWidth: 420 },
  title:     { fontSize: 26, fontWeight: 700, marginBottom: 4 },
  sub:       { color: '#888', fontSize: 14, marginBottom: 24 },
  testCreds: { background: '#f8f9fa', border: '1px solid #eee', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#555', margin: '16px 0', fontFamily: 'monospace', lineHeight: 1.8 },
  link:      { textAlign: 'center', fontSize: 14, color: '#666', marginTop: 8 },
};
