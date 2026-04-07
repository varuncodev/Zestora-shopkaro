import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../../api/axiosConfig';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-center"><span className="spinner" /></div>;
  if (!data)   return <div className="page-center">Failed to load dashboard</div>;

  const { stats, monthlyRevenue, ordersByStatus, recentOrders, lowStock } = data;

  const chartData = monthlyRevenue.map(d => ({
    month: MONTHS[d._id.month - 1],
    revenue: Math.round(d.revenue),
    orders: d.orders,
  }));

  const statusData = ordersByStatus.map(s => ({ name: s._id, count: s.count }));

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.sidebarTitle}>⚙️ Admin</div>
        {[
          { to: '/admin',          icon: '📊', label: 'Dashboard' },
          { to: '/admin/products', icon: '📦', label: 'Products' },
          { to: '/admin/orders',   icon: '🧾', label: 'Orders' },
          { to: '/admin/users',    icon: '👥', label: 'Users' },
          { to: '/',               icon: '🛍️', label: 'View Store' },
        ].map(item => (
          <Link key={item.to} to={item.to} style={styles.sidebarLink}>
            {item.icon} {item.label}
          </Link>
        ))}
      </aside>

      {/* Main content */}
      <main style={styles.main}>
        <h1 style={styles.pageTitle}>Dashboard Overview</h1>

        {/* Stat cards */}
        <div style={styles.statsGrid}>
          {[
            { label: 'Total Revenue',  value: `₹${stats.totalRevenue?.toLocaleString()}`,  icon: '💰', bg: '#f0fdf4', color: '#15803d' },
            { label: 'Total Orders',   value: stats.totalOrders,                             icon: '🧾', bg: '#eff6ff', color: '#1d4ed8' },
            { label: 'Products',       value: stats.totalProducts,                           icon: '📦', bg: '#fefce8', color: '#a16207' },
            { label: 'Customers',      value: stats.totalUsers,                              icon: '👥', bg: '#fdf4ff', color: '#7e22ce' },
          ].map(s => (
            <div key={s.label} style={{ ...styles.statCard, background: s.bg }}>
              <span style={{ fontSize: 28 }}>{s.icon}</span>
              <div>
                <div style={{ fontSize: 13, color: '#666', marginBottom: 2 }}>{s.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div style={styles.chartsRow}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Revenue (Last 6 months)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#1a1a1a" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Orders by Status</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={statusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#1a1a1a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom row: Recent orders + Low stock */}
        <div style={styles.chartsRow}>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>Recent Orders</h3>
            <table style={styles.table}>
              <thead>
                <tr>{['Order ID', 'Customer', 'Total', 'Status'].map(h => <th key={h} style={styles.th}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o._id} style={styles.tr}>
                    <td style={styles.td}><Link to={`/orders/${o._id}`} style={{ color: '#1a1a1a' }}>#{o._id.slice(-6)}</Link></td>
                    <td style={styles.td}>{o.user?.name || '—'}</td>
                    <td style={styles.td}>₹{o.totalPrice?.toLocaleString()}</td>
                    <td style={styles.td}><span style={{ textTransform: 'capitalize', fontSize: 12, fontWeight: 600 }}>{o.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={styles.chartCard}>
            <h3 style={styles.chartTitle}>⚠️ Low Stock Alerts</h3>
            {lowStock.length === 0 ? <p style={{ color: '#888', fontSize: 14 }}>All products well stocked!</p> : lowStock.map(p => (
              <div key={p._id} style={styles.stockRow}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: p.stock === 0 ? '#dc3545' : '#f59e0b' }}>
                  {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page:        { display: 'flex', minHeight: '100vh', background: '#f8f9fa' },
  sidebar:     { width: 220, background: '#1a1a1a', padding: '24px 0', flexShrink: 0 },
  sidebarTitle:{ color: 'white', fontWeight: 700, fontSize: 18, padding: '0 20px 24px' },
  sidebarLink: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', color: '#ccc', textDecoration: 'none', fontSize: 14, transition: 'all .15s' },
  main:        { flex: 1, padding: 32, overflow: 'auto' },
  pageTitle:   { fontSize: 26, fontWeight: 800, marginBottom: 24 },
  statsGrid:   { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 },
  statCard:    { borderRadius: 12, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 },
  chartsRow:   { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 },
  chartCard:   { background: 'white', borderRadius: 12, padding: 20, border: '1px solid #eee' },
  chartTitle:  { fontSize: 15, fontWeight: 700, marginBottom: 16 },
  table:       { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:          { textAlign: 'left', padding: '8px', borderBottom: '1px solid #eee', fontWeight: 600, fontSize: 12, color: '#888' },
  td:          { padding: '10px 8px', borderBottom: '1px solid #f5f5f5' },
  tr:          { transition: 'background .1s' },
  stockRow:    { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f5f5f5' },
};
