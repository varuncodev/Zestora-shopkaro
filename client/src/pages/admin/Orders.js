import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';

const STATUSES = ['all','pending','paid','processing','shipped','delivered','cancelled','refunded'];
const STATUS_COLORS = { pending:'#f59e0b', paid:'#3b82f6', processing:'#8b5cf6', shipped:'#f97316', delivered:'#22c55e', cancelled:'#ef4444', refunded:'#6b7280' };

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter,  setFilter]  = useState('all');
  const [page,    setPage]    = useState(1);
  const [total,   setTotal]   = useState(0);

  const load = () => {
    setLoading(true);
    const params = { page, limit: 20 };
    if (filter !== 'all') params.status = filter;
    api.get('/admin/orders', { params })
      .then(r => { setOrders(r.data.orders); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filter, page]);

  const updateStatus = async (orderId, status) => {
    try {
      let endpoint = '';
      if (status === 'shipped')   endpoint = `/orders/${orderId}/ship`;
      else if (status === 'delivered') endpoint = `/orders/${orderId}/deliver`;
      else if (status === 'refunded') {
        await api.post('/payments/refund', { orderId });
        load(); return;
      }
      if (endpoint) await api.put(endpoint, {});
      load();
    } catch (err) { alert(err.response?.data?.message || 'Error updating status'); }
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
        ].map(item => <Link key={item.to} to={item.to} style={styles.sidebarLink}>{item.icon} {item.label}</Link>)}
      </aside>

      <main style={styles.main}>
        <h1 style={styles.pageTitle}>Orders ({total})</h1>

        {/* Status filter tabs */}
        <div style={styles.filterTabs}>
          {STATUSES.map(s => (
            <button key={s} onClick={() => { setFilter(s); setPage(1); }}
              style={{ ...styles.tab, ...(filter === s ? styles.tabActive : {}) }}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <div className="page-center"><span className="spinner" /></div> : (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #eee', overflow: 'hidden' }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Order ID', 'Customer', 'Date', 'Total', 'Status', 'Paid', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o._id} style={styles.tr}>
                    <td style={styles.td}><Link to={`/orders/${o._id}`} style={{ color: '#1a1a1a', fontWeight: 600 }}>#{o._id.slice(-8)}</Link></td>
                    <td style={styles.td}><div>{o.user?.name || 'Guest'}</div><div style={{ fontSize: 11, color: '#888' }}>{o.user?.email}</div></td>
                    <td style={styles.td} style={{ fontSize: 12, color: '#666', ...styles.td }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={styles.td}><strong>₹{o.totalPrice?.toLocaleString()}</strong></td>
                    <td style={styles.td}>
                      <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: STATUS_COLORS[o.status] + '22', color: STATUS_COLORS[o.status] }}>
                        {o.status}
                      </span>
                    </td>
                    <td style={styles.td}>{o.isPaid ? <span style={{ color: '#22c55e', fontWeight: 600 }}>✓ Yes</span> : <span style={{ color: '#ef4444' }}>✗ No</span>}</td>
                    <td style={styles.td}>
                      <select defaultValue="" onChange={e => { if (e.target.value) updateStatus(o._id, e.target.value); }}
                        style={{ padding: '5px 8px', border: '1px solid #ddd', borderRadius: 6, fontSize: 12 }}>
                        <option value="" disabled>Update →</option>
                        {o.isPaid && o.status === 'paid'       && <option value="shipped">Mark Shipped</option>}
                        {o.status === 'shipped'                 && <option value="delivered">Mark Delivered</option>}
                        {o.isPaid && o.status !== 'refunded'   && <option value="refunded">Refund</option>}
                      </select>
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
  main:        { flex: 1, padding: 32, overflow: 'auto' },
  pageTitle:   { fontSize: 24, fontWeight: 700, marginBottom: 16 },
  filterTabs:  { display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' },
  tab:         { padding: '6px 14px', borderRadius: 20, border: '1px solid #ddd', background: 'white', cursor: 'pointer', fontSize: 13 },
  tabActive:   { background: '#1a1a1a', color: 'white', borderColor: '#1a1a1a' },
  table:       { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:          { textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#666', fontWeight: 600, borderBottom: '1px solid #eee' },
  td:          { padding: '12px 16px', borderBottom: '1px solid #f5f5f5', verticalAlign: 'middle' },
  tr:          {},
};
