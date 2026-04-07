import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import api from '../api/axiosConfig';
import { fetchMe } from '../store/slices/authSlice';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector(s => s.auth);
  const [form,    setForm]    = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [msg,     setMsg]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true); setMsg('');
    try {
      await api.put('/auth/profile', form);
      await dispatch(fetchMe());
      setMsg('Profile updated!');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Update failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="container" style={{ padding: '40px 16px', maxWidth: 600 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 28 }}>My Profile</h1>

      <div style={styles.card}>
        <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{user?.name}</div>
          <div style={{ color: '#888', fontSize: 14 }}>{user?.email}</div>
          <span style={{ display: 'inline-block', marginTop: 6, background: user?.role === 'admin' ? '#fef3c7' : '#e0f2fe', color: user?.role === 'admin' ? '#92400e' : '#0369a1', padding: '2px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>
            {user?.role}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 18 }}>Update Details</h2>
        <div className="form-group">
          <label>Full Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Phone</label>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="9876543210" />
        </div>
        {msg && <div className={`alert ${msg.includes('failed') || msg.includes('Error') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  card:   { background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 },
  avatar: { width: 64, height: 64, borderRadius: '50%', background: '#1a1a1a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, flexShrink: 0 },
  form:   { background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 24 },
};
