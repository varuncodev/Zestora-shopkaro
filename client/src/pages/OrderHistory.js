import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../store/slices/orderSlice';

const STATUS_COLORS = {
  pending:    'badge-secondary',
  paid:       'badge-info',
  processing: 'badge-warning',
  shipped:    'badge-warning',
  delivered:  'badge-success',
  cancelled:  'badge-danger',
  refunded:   'badge-secondary',
};

export default function OrderHistory() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector(s => s.order);

  useEffect(() => { dispatch(fetchMyOrders()); }, [dispatch]);

  if (loading) return <div className="page-center"><span className="spinner" /></div>;

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="page-center" style={{ flexDirection: 'column', gap: 12 }}>
          <span style={{ fontSize: 48 }}>📦</span>
          <p>No orders yet.</p>
          <Link to="/products" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {orders.map(order => (
            <div key={order._id} style={styles.orderCard}>
              <div style={styles.orderHeader}>
                <div>
                  <div style={styles.orderId}>#{order._id.slice(-8).toUpperCase()}</div>
                  <div style={styles.orderDate}>{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <span className={`badge ${STATUS_COLORS[order.status] || 'badge-secondary'}`} style={{ textTransform: 'capitalize', fontSize: 12 }}>
                  {order.status}
                </span>
              </div>
              <div style={styles.itemsPreview}>
                {order.items.slice(0, 3).map(item => (
                  <img key={item._id} src={item.image || 'https://via.placeholder.com/48'} alt={item.name}
                    title={item.name} style={styles.previewImg} />
                ))}
                {order.items.length > 3 && <div style={styles.moreItems}>+{order.items.length - 3}</div>}
                <div style={styles.orderNames}>{order.items.map(i => i.name).join(', ')}</div>
              </div>
              <div style={styles.orderFooter}>
                <span style={styles.orderTotal}>₹{order.totalPrice.toLocaleString()}</span>
                <Link to={`/orders/${order._id}`} className="btn btn-secondary btn-sm">View Details</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  orderCard:    { background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 20 },
  orderHeader:  { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  orderId:      { fontWeight: 700, fontSize: 16 },
  orderDate:    { color: '#888', fontSize: 12, marginTop: 2 },
  itemsPreview: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, flexWrap: 'wrap' },
  previewImg:   { width: 48, height: 48, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee' },
  moreItems:    { width: 48, height: 48, borderRadius: 8, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 },
  orderNames:   { fontSize: 13, color: '#666', flex: 1 },
  orderFooter:  { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  orderTotal:   { fontSize: 18, fontWeight: 700 },
};
