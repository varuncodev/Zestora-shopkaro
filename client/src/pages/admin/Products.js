import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosConfig';

const EMPTY = { name: '', description: '', price: '', category: 'Electronics', brand: '', stock: '', discountPrice: '' };
const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Other'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(false);
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY);
  const [msg,      setMsg]      = useState('');
  const [search,   setSearch]   = useState('');

  const load = () => {
    setLoading(true);
    api.get('/products', { params: { limit: 100, keyword: search } })
      .then(r => setProducts(r.data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); setMsg(''); };
  const openEdit   = p => { setEditing(p._id); setForm({ name: p.name, description: p.description, price: p.price, category: p.category, brand: p.brand || '', stock: p.stock, discountPrice: p.discountPrice || '' }); setModal(true); setMsg(''); };

  const handleSubmit = async e => {
    e.preventDefault(); setMsg('');
    try {
      if (editing) await api.put(`/products/${editing}`, form);
      else         await api.post('/products', form);
      setModal(false); load();
    } catch (err) { setMsg(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this product?')) return;
    await api.delete(`/products/${id}`);
    load();
  };

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
          <Link key={item.to} to={item.to} style={styles.sidebarLink}>{item.icon} {item.label}</Link>
        ))}
      </aside>

      <main style={styles.main}>
        <div style={styles.topBar}>
          <h1 style={styles.pageTitle}>Products ({products.length})</h1>
          <div style={{ display: 'flex', gap: 12 }}>
            <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, width: 220 }} />
            <button className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
          </div>
        </div>

        {loading ? <div className="page-center"><span className="spinner" /></div> : (
          <div style={{ background: 'white', borderRadius: 12, border: '1px solid #eee', overflow: 'hidden' }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  {['Image', 'Name', 'Category', 'Price', 'Stock', 'Rating', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id} style={styles.tr}>
                    <td style={styles.td}><img src={p.images?.[0]?.url || 'https://via.placeholder.com/48'} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 8 }} /></td>
                    <td style={styles.td}><div style={{ fontWeight: 600, maxWidth: 200 }}>{p.name}</div><div style={{ fontSize: 11, color: '#888' }}>{p.brand}</div></td>
                    <td style={styles.td}><span style={styles.catBadge}>{p.category}</span></td>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 700 }}>₹{p.price?.toLocaleString()}</div>
                      {p.discountPrice > 0 && <div style={{ fontSize: 12, color: '#28a745' }}>Sale: ₹{p.discountPrice}</div>}
                    </td>
                    <td style={styles.td}><span style={{ color: p.stock < 5 ? '#dc3545' : p.stock < 20 ? '#f59e0b' : '#28a745', fontWeight: 600 }}>{p.stock}</span></td>
                    <td style={styles.td}><span style={{ color: '#f59e0b' }}>★</span> {p.rating?.toFixed(1)} ({p.numReviews})</td>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(p)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal */}
      {modal && (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setModal(false)} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer' }}>×</button>
            </div>
            <form onSubmit={handleSubmit} style={styles.modalBody}>
              {[
                { label: 'Product Name', key: 'name',     type: 'text',   req: true,  placeholder: 'iPhone 15' },
                { label: 'Price (₹)',    key: 'price',    type: 'number', req: true,  placeholder: '79999' },
                { label: 'Sale Price',   key: 'discountPrice', type: 'number', placeholder: '69999' },
                { label: 'Stock',        key: 'stock',    type: 'number', req: true,  placeholder: '50' },
                { label: 'Brand',        key: 'brand',    type: 'text',   placeholder: 'Apple' },
              ].map(f => (
                <div className="form-group" key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 13 }}>{f.label}</label>
                  <input type={f.type} required={f.req} placeholder={f.placeholder}
                    value={form[f.key]} onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                    style={{ padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, width: '100%', fontSize: 14 }} />
                </div>
              ))}
              <div className="form-group" style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 13 }}>Category</label>
                <select value={form.category} onChange={e => setForm(v => ({ ...v, category: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 }}>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13 }}>Description</label>
                <textarea rows={3} required value={form.description} onChange={e => setForm(v => ({ ...v, description: e.target.value }))}
                  placeholder="Product description..."
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, resize: 'vertical' }} />
              </div>
              {msg && <div className="alert alert-error">{msg}</div>}
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setModal(false)} style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  page:        { display: 'flex', minHeight: '100vh', background: '#f8f9fa' },
  sidebar:     { width: 220, background: '#1a1a1a', padding: '24px 0', flexShrink: 0 },
  sidebarTitle:{ color: 'white', fontWeight: 700, fontSize: 18, padding: '0 20px 24px' },
  sidebarLink: { display: 'flex', alignItems: 'center', gap: 10, padding: '12px 20px', color: '#ccc', textDecoration: 'none', fontSize: 14 },
  main:        { flex: 1, padding: 32, overflow: 'auto' },
  topBar:      { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  pageTitle:   { fontSize: 24, fontWeight: 700 },
  table:       { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
  th:          { textAlign: 'left', padding: '12px 16px', fontSize: 12, color: '#666', fontWeight: 600, borderBottom: '1px solid #eee' },
  td:          { padding: '12px 16px', borderBottom: '1px solid #f5f5f5', verticalAlign: 'middle' },
  tr:          {},
  catBadge:    { background: '#f0f0f0', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600 },
  overlay:     { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  modal:       { background: 'white', borderRadius: 16, width: '100%', maxWidth: 480, maxHeight: '90vh', overflow: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', borderBottom: '1px solid #eee' },
  modalBody:   { padding: 24 },
};
