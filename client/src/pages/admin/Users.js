import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function AdminUsers() {
  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');
  const [total,   setTotal]   = useState(0);

  const load = () => {
    setLoading(true);
    api.get('/admin/users', { params: { search } })
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const toggleStatus = async (id) => {
    await api.put(`/admin/users/${id}/toggle`);
    load();
  };

  return (
    <div style={styles.page}>
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTitle}>⚙️ Admin</div>
        {[
          { to: '/admin',          icon: '📊', label: 'Dashboard' },
          { to: '/admin/products', icon: '📦', label: 'Products' },
          { to: '/admin/orders',   icon: '🧾', label: 'Orders' },
          { to: '/admin/users',    icon: '👥', label: 'Users' },
          { to: '/',               icon: '🛍️', label: 'View Store' },
        ].map(i => <Link key={i.to} to={i.to} style={styles.sidebarLink}>{i.icon} {i.label}</Link>)}
      </aside>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <h1 style={styles.pageTitle}>Users ({total})</h1>
          <input placeholder="Search by name or email..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, width: 280 }} />
        </div>

        {loading ? <div className="page-center"><span className="spinner" /></div> : (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #eee', overflow: 'hidden' }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['User', 'Email', 'Role', 'Joined', 'Status', 'Action'].map(h =>
                    <th key={h} style={styles.th}>{h}</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id}>
                    <td style={styles.td}>
                      <div style={styles.userAvatar}>{u.name?.[0]?.toUpperCase()}</div>
                      <span style={{ fontWeight: 600 }}>{u.name}</span>
                    </td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={{ background: u.role === 'admin' ? '#fef3c7' : '#e0f2fe', color: u.role === 'admin' ? '#92400e' : '#0369a1', padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={styles.td}><span style={{ fontSize: 12, color: '#888' }}>{new Date(u.createdAt).toLocaleDateString()}</span></td>
                    <td style={styles.td}>
                      <span style={{ color: u.isActive ? '#22c55e' : '#ef4444', fontWeight: 600, fontSize: 13 }}>
                        {u.isActive ? '● Active' : '● Inactive'}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                        onClick={() => toggleStatus(u._id)}>
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  page:        { display: 'flex', minHeight: '100vh', background: '#f8f9fa' },
  sidebar:     { width: 220, background: '#1a1a1a', padding: '24px 0', flexShrink: 0 },
  sidebarTitle:{ color: 'white', fontWeight: 700, fontSize: 18, padding: '0 20px 24px' },
  sidebarLink: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', color: '#ccc', textDecoration: 'none', fontSize: 14 },
  main:        { flex: 1, padding: 32 },
  topBar:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  pageTitle:   { fontSize: 24, fontWeight: 700 },
  table:       { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:          { textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#666', fontWeight: 600, borderBottom: '1px solid #eee' },
  td:          { padding: '12px 16px', borderBottom: '1px solid #f5f5f5', verticalAlign: 'middle', display: 'table-cell' },
  userAvatar:  { width: 32, height: 32, borderRadius: '50%', background: '#1a1a1a', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, marginRight: 10 },
};
