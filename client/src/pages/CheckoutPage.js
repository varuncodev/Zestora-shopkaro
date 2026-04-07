import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder } from '../store/slices/orderSlice';
import { clearCart, selectCartSubtotal } from '../store/slices/cartSlice';
import CheckoutForm from '../components/cart/CheckoutForm';

const STEPS = ['Shipping', 'Review', 'Payment'];

export default function CheckoutPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { items } = useSelector(s => s.cart);
  const { order, loading, error } = useSelector(s => s.order);
  const { user }  = useSelector(s => s.auth);
  const subtotal  = useSelector(selectCartSubtotal);

  const [step, setStep]     = useState(0);
  const [address, setAddr]  = useState({
    name: user?.name || '', street: '', city: '', state: '',
    zip: '', country: 'India', phone: '',
  });

  const shipping = subtotal > 499 ? 0 : 49;
  const tax      = Math.round(subtotal * 0.18 * 100) / 100;
  const total    = subtotal + shipping + tax;

  const handlePlaceOrder = async () => {
    const result = await dispatch(createOrder({
      items: items.map(i => ({ product: i.product, qty: i.qty })),
      shippingAddress: address,
    }));
    if (result.meta.requestStatus === 'fulfilled') setStep(2);
  };

  const handlePaymentSuccess = () => {
    dispatch(clearCart());
    navigate('/order-success', { state: { orderId: order._id } });
  };

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: 900 }}>
      {/* Step indicator */}
      <div style={styles.stepper}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <div style={styles.stepItem}>
              <div style={{ ...styles.stepDot, ...(i <= step ? styles.stepDotActive : {}) }}>{i + 1}</div>
              <span style={{ fontSize: 13, color: i <= step ? '#1a1a1a' : '#999' }}>{s}</span>
            </div>
            {i < STEPS.length - 1 && <div style={{ ...styles.stepLine, ...(i < step ? { background: '#1a1a1a' } : {}) }} />}
          </React.Fragment>
        ))}
      </div>

      <div style={styles.layout}>
        <div style={{ flex: 1 }}>
          {/* Step 0: Shipping */}
          {step === 0 && (
            <div style={styles.box}>
              <h2 style={styles.boxTitle}>Shipping Address</h2>
              {[
                { label: 'Full Name',    key: 'name',    type: 'text',  placeholder: 'Rahul Sharma' },
                { label: 'Phone',        key: 'phone',   type: 'tel',   placeholder: '9876543210' },
                { label: 'Street',       key: 'street',  type: 'text',  placeholder: '123 MG Road, Apt 4' },
                { label: 'City',         key: 'city',    type: 'text',  placeholder: 'Mumbai' },
                { label: 'State',        key: 'state',   type: 'text',  placeholder: 'Maharashtra' },
                { label: 'PIN Code',     key: 'zip',     type: 'text',  placeholder: '400001' },
                { label: 'Country',      key: 'country', type: 'text',  placeholder: 'India' },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  <input type={f.type} required placeholder={f.placeholder}
                    value={address[f.key]} onChange={e => setAddr(a => ({ ...a, [f.key]: e.target.value }))} />
                </div>
              ))}
              <button className="btn btn-primary" onClick={() => setStep(1)}
                disabled={!address.name || !address.street || !address.city || !address.zip}
                style={{ padding: '12px 32px' }}>
                Continue to Review →
              </button>
            </div>
          )}

          {/* Step 1: Review */}
          {step === 1 && (
            <div style={styles.box}>
              <h2 style={styles.boxTitle}>Review Order</h2>
              {items.map(item => (
                <div key={item.product} style={styles.reviewItem}>
                  <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ color: '#666', fontSize: 13 }}>Qty: {item.qty} × ₹{item.price.toLocaleString()}</div>
                  </div>
                  <div style={{ fontWeight: 700 }}>₹{(item.price * item.qty).toLocaleString()}</div>
                </div>
              ))}
              {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setStep(0)}>← Back</button>
                <button className="btn btn-primary" onClick={handlePlaceOrder} disabled={loading}
                  style={{ flex: 1, padding: 12 }}>
                  {loading ? 'Placing Order...' : 'Place Order & Pay →'}
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && order && (
            <CheckoutForm orderId={order._id} amount={order.totalPrice} onSuccess={handlePaymentSuccess} />
          )}
        </div>

        {/* Order summary sidebar */}
        <div style={styles.summary}>
          <h3 style={{ fontWeight: 700, marginBottom: 16 }}>Summary</h3>
          <div style={styles.sumRow}><span>Subtotal</span><span>₹{subtotal.toLocaleString()}</span></div>
          <div style={styles.sumRow}><span>GST (18%)</span><span>₹{tax.toFixed(2)}</span></div>
          <div style={styles.sumRow}><span>Shipping</span><span style={{ color: shipping === 0 ? '#28a745' : 'inherit' }}>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
          <hr style={{ margin: '12px 0' }} />
          <div style={{ ...styles.sumRow, fontWeight: 700, fontSize: 18 }}><span>Total</span><span>₹{total.toFixed(2)}</span></div>
          <div style={{ marginTop: 16, background: '#f8f9fa', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Shipping to:</div>
            {address.street && <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
              {address.name}<br />{address.street}, {address.city}<br />{address.state} - {address.zip}
            </div>}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  stepper:       { display: 'flex', alignItems: 'center', marginBottom: 40, maxWidth: 400 },
  stepItem:      { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 },
  stepDot:       { width: 32, height: 32, borderRadius: '50%', border: '2px solid #ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 13, color: '#999' },
  stepDotActive: { background: '#1a1a1a', borderColor: '#1a1a1a', color: 'white' },
  stepLine:      { flex: 1, height: 2, background: '#eee', margin: '0 12px', marginBottom: 20 },
  layout:        { display: 'flex', gap: 32, alignItems: 'flex-start' },
  box:           { background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 24, flex: 1 },
  boxTitle:      { fontSize: 20, fontWeight: 700, marginBottom: 20 },
  reviewItem:    { display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderBottom: '1px solid #eee' },
  summary:       { width: 280, background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 20, position: 'sticky', top: 80 },
  sumRow:        { display: 'flex', justifyContent: 'space-between', marginBottom: 10, fontSize: 14 },
};
