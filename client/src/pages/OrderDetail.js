import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderById } from '../store/slices/orderSlice';

export default function OrderDetail() {
  const { id }   = useParams();
  const dispatch = useDispatch();
  const { order, loading } = useSelector(s => s.order);

  useEffect(() => { dispatch(fetchOrderById(id)); }, [id, dispatch]);

  if (loading || !order) return <div className="page-center"><span className="spinner" /></div>;

  const { shippingAddress: a, items, subtotal, taxPrice, shippingPrice, totalPrice, status, isPaid, paidAt, trackingNumber } = order;

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: 800 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
        <Link to="/orders" style={{ color: '#666', textDecoration: 'none' }}>← Orders</Link>
        <h1 style={{ fontSize: 22, fontWeight: 700 }}>Order #{id.slice(-8).toUpperCase()}</h1>
        <span style={{ marginLeft: 'auto', textTransform: 'capitalize', background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>{status}</span>
      </div>

      <div style={styles.grid}>
        <div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Items</h3>
            {items.map(item => (
              <div key={item._id} style={styles.item}>
                <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  <div style={{ color: '#888', fontSize: 13 }}>{item.qty} × ₹{item.price.toLocaleString()}</div>
                </div>
                <div style={{ fontWeight: 700 }}>₹{(item.price * item.qty).toLocaleString()}</div>
              </div>
            ))}
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Shipping Address</h3>
            <p style={styles.address}>{a.name}<br />{a.street}<br />{a.city}, {a.state} - {a.zip}<br />{a.country}<br />📞 {a.phone}</p>
          </div>
        </div>

        <div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Payment</h3>
            <div style={styles.row}><span>Status</span><span style={{ color: isPaid ? '#28a745' : '#dc3545', fontWeight: 600 }}>{isPaid ? `✓ Paid on ${new Date(paidAt).toLocaleDateString()}` : '✗ Unpaid'}</span></div>
          </div>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Order Total</h3>
            <div style={styles.row}><span>Subtotal</span><span>₹{subtotal?.toLocaleString()}</span></div>
            <div style={styles.row}><span>GST</span><span>₹{taxPrice?.toFixed(2)}</span></div>
            <div style={styles.row}><span>Shipping</span><span>{shippingPrice === 0 ? 'FREE' : `₹${shippingPrice}`}</span></div>
            <hr style={{ margin: '8px 0' }} />
            <div style={{ ...styles.row, fontWeight: 700, fontSize: 18 }}><span>Total</span><span>₹{totalPrice?.toLocaleString()}</span></div>
          </div>
          {trackingNumber && (
            <div style={styles.section}>
              <h3 style={styles.sectionTitle}>Tracking</h3>
              <code style={{ fontSize: 14, background: '#f0f0f0', padding: '6px 10px', borderRadius: 6 }}>{trackingNumber}</code>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  grid:         { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24 },
  section:      { background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 18, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: 700, marginBottom: 14 },
  item:         { display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0' },
  address:      { fontSize: 14, color: '#555', lineHeight: 1.8 },
  row:          { display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 14 },
};
