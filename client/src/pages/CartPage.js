import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { removeFromCart, updateQty, clearCart, selectCartSubtotal } from '../store/slices/cartSlice';

export default function CartPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { items } = useSelector(s => s.cart);
  const subtotal  = useSelector(selectCartSubtotal);
  const { user }  = useSelector(s => s.auth);

  const shipping  = subtotal > 499 ? 0 : 49;
  const tax       = Math.round(subtotal * 0.18 * 100) / 100;
  const total     = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!user) { navigate('/login'); return; }
    navigate('/checkout');
  };

  if (items.length === 0) return (
    <div className="page-center" style={{ flexDirection: 'column', gap: 16 }}>
      <span style={{ fontSize: 64 }}>🛒</span>
      <h2>Your cart is empty</h2>
      <Link to="/products" className="btn btn-primary">Start Shopping</Link>
    </div>
  );

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 24 }}>Shopping Cart ({items.length} items)</h1>
      <div style={styles.layout}>
        {/* Items */}
        <div>
          {items.map(item => (
            <div key={item.product} style={styles.item}>
              <img src={item.image || 'https://via.placeholder.com/80'} alt={item.name} style={styles.itemImg} />
              <div style={{ flex: 1 }}>
                <Link to={`/products/${item.product}`} style={styles.itemName}>{item.name}</Link>
                <div style={styles.itemPrice}>₹{item.price.toLocaleString()}</div>
              </div>
              <div style={styles.qtyWrap}>
                <button style={styles.qtyBtn} onClick={() => item.qty > 1
                  ? dispatch(updateQty({ product: item.product, qty: item.qty - 1 }))
                  : dispatch(removeFromCart(item.product))}>−</button>
                <span style={styles.qty}>{item.qty}</span>
                <button style={styles.qtyBtn} onClick={() => item.qty < item.stock
                  && dispatch(updateQty({ product: item.product, qty: item.qty + 1 }))}>+</button>
              </div>
              <div style={{ fontWeight: 700, minWidth: 80, textAlign: 'right' }}>
                ₹{(item.price * item.qty).toLocaleString()}
              </div>
              <button onClick={() => dispatch(removeFromCart(item.product))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#dc3545', fontSize: 18, marginLeft: 8 }}>×</button>
            </div>
          ))}
          <button className="btn btn-secondary btn-sm" onClick={() => dispatch(clearCart())} style={{ marginTop: 12 }}>
            🗑 Clear Cart
          </button>
        </div>

        {/* Summary */}
        <div style={styles.summary}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Order Summary</h3>
          <div style={styles.summaryRow}><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
          <div style={styles.summaryRow}><span>GST (18%)</span><span>₹{tax.toFixed(2)}</span></div>
          <div style={styles.summaryRow}><span>Shipping</span><span style={{ color: shipping === 0 ? '#28a745' : 'inherit' }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
          {shipping > 0 && <p style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>Add ₹{(499 - subtotal).toFixed(0)} more for free shipping</p>}
          <hr style={{ margin: '12px 0', borderColor: '#eee' }} />
          <div style={{ ...styles.summaryRow, fontWeight: 700, fontSize: 18 }}><span>Total</span><span>₹{total.toFixed(2)}</span></div>
          <button className="btn btn-primary btn-full" onClick={handleCheckout} style={{ marginTop: 20, padding: 14, fontSize: 16 }}>
            Proceed to Checkout →
          </button>
          <Link to="/products" style={{ display: 'block', textAlign: 'center', marginTop: 12, color: '#666', fontSize: 13 }}>← Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout:     { display: 'grid', gridTemplateColumns: '1fr 360px', gap: 32 },
  item:       { display: 'flex', alignItems: 'center', gap: 16, background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 16, marginBottom: 12 },
  itemImg:    { width: 80, height: 80, objectFit: 'cover', borderRadius: 8 },
  itemName:   { fontWeight: 600, textDecoration: 'none', color: '#1a1a1a', display: 'block', marginBottom: 4 },
  itemPrice:  { color: '#666', fontSize: 14 },
  qtyWrap:    { display: 'flex', alignItems: 'center', gap: 8 },
  qtyBtn:     { width: 30, height: 30, border: '1px solid #ddd', borderRadius: 6, background: 'white', cursor: 'pointer', fontSize: 16 },
  qty:        { minWidth: 24, textAlign: 'center', fontWeight: 600 },
  summary:    { background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 24, height: 'fit-content', position: 'sticky', top: 80 },
  summaryRow: { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 },
};
