import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer style={styles.footer}>
      <div className="container" style={styles.inner}>
        <div style={styles.col}>
          <h3 style={styles.brand}>🛍️ ShopKaro</h3>
          <p style={styles.tagline}>Your one-stop shop for everything.</p>
        </div>
        <div style={styles.col}>
          <h4 style={styles.heading}>Shop</h4>
          <Link to="/products"           style={styles.link}>All Products</Link>
          <Link to="/products?featured=true" style={styles.link}>Featured</Link>
        </div>
        <div style={styles.col}>
          <h4 style={styles.heading}>Account</h4>
          <Link to="/login"   style={styles.link}>Login</Link>
          <Link to="/orders"  style={styles.link}>My Orders</Link>
          <Link to="/profile" style={styles.link}>Profile</Link>
        </div>
        <div style={styles.col}>
          <h4 style={styles.heading}>Test Card</h4>
          <p style={styles.cardInfo}>4242 4242 4242 4242</p>
          <p style={styles.cardInfo}>Exp: 12/26  CVV: 123</p>
        </div>
      </div>
      <div style={styles.bottom}>
        <p>© {new Date().getFullYear()} ShopKaro. Built with React + Node.js + Stripe</p>
      </div>
    </footer>
  );
}

const styles = {
  footer:   { background: '#1a1a1a', color: '#ccc', marginTop: 'auto', paddingTop: 40 },
  inner:    { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, paddingBottom: 32 },
  col:      { display: 'flex', flexDirection: 'column', gap: 8 },
  brand:    { color: 'white', fontSize: 20, marginBottom: 4 },
  tagline:  { fontSize: 13, color: '#999' },
  heading:  { color: 'white', fontSize: 14, fontWeight: 600, marginBottom: 4 },
  link:     { color: '#aaa', textDecoration: 'none', fontSize: 13 },
  cardInfo: { fontSize: 12, color: '#4caf50', fontFamily: 'monospace' },
  bottom:   { borderTop: '1px solid #333', padding: '16px 0', textAlign: 'center', fontSize: 12, color: '#666' },
};
