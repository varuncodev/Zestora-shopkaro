import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../api/axiosConfig';

export default function CheckoutForm({ orderId, amount, onSuccess }) {
  const stripe   = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setError('');

    try {
      // 1. Create PaymentIntent on server
      const { data } = await api.post('/payments/create-payment-intent', { orderId });

      // 2. Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement) },
      });

      if (result.error) {
        setError(result.error.message);
        return;
      }

      if (result.paymentIntent.status === 'succeeded') {
        // 3. Mark order as paid on server
        await api.put(`/orders/${orderId}/pay`, {
          paymentResult: {
            id:          result.paymentIntent.id,
            status:      result.paymentIntent.status,
            update_time: new Date().toISOString(),
          },
        });
        onSuccess();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h3 style={styles.heading}>💳 Payment Details</h3>
      <p style={styles.testNote}>
        Test card: <code>4242 4242 4242 4242</code> · Exp: 12/26 · CVV: 123
      </p>

      <div style={styles.cardWrap}>
        <CardElement options={{ style: { base: { fontSize: '16px', color: '#1a1a1a' } } }} />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button
        type="submit"
        className="btn btn-primary btn-full"
        disabled={!stripe || loading}
        style={{ marginTop: 16, padding: '14px', fontSize: 16 }}
      >
        {loading ? <><span className="spinner" style={{ width: 18, height: 18, marginRight: 8 }} /> Processing…</> : `Pay ₹${amount?.toLocaleString()}`}
      </button>
    </form>
  );
}

const styles = {
  form:     { background: 'white', borderRadius: 12, padding: 24, border: '1px solid #eee' },
  heading:  { fontSize: 18, fontWeight: 600, marginBottom: 12 },
  testNote: { background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 8, padding: '10px 14px', fontSize: 13, marginBottom: 16 },
  cardWrap: { border: '1px solid #ddd', borderRadius: 8, padding: '14px 16px', marginBottom: 8 },
};
