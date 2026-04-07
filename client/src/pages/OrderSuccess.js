import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function OrderSuccess() {
  const { state } = useLocation();
  return (
    <div className="page-center" style={{ flexDirection: 'column', gap: 16, padding: 40, textAlign: 'center' }}>
      <div style={{ fontSize: 80 }}>🎉</div>
      <h1 style={{ fontSize: 32, fontWeight: 800 }}>Order Placed!</h1>
      <p style={{ color: '#666', fontSize: 16 }}>Thank you! A confirmation email has been sent to you.</p>
      {state?.orderId && (
        <p style={{ background: '#f8f9fa', padding: '10px 20px', borderRadius: 8, fontFamily: 'monospace', fontSize: 14 }}>
          Order ID: {state.orderId}
        </p>
      )}
      <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
        <Link to="/orders" className="btn btn-primary">Track Order</Link>
        <Link to="/products" className="btn btn-secondary">Continue Shopping</Link>
      </div>
    </div>
  );
}
