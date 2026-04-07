import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty'];

export default function HomePage() {
  const dispatch   = useDispatch();
  const { products, loading } = useSelector(s => s.product);

  useEffect(() => { dispatch(fetchProducts({ featured: true, limit: 8 })); }, [dispatch]);

  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <div className="container" style={styles.heroInner}>
          <h1 style={styles.heroTitle}>India's Favourite<br />Online Shop 🛍️</h1>
          <p style={styles.heroSub}>Electronics, Fashion, Books & more — delivered fast</p>
          <div style={{ display: 'flex', gap: 12 }}>
            <Link to="/products" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: 16 }}>
              Shop Now
            </Link>
            <Link to="/register" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: 16 }}>
              Join Free
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section style={styles.section}>
        <div className="container">
          <h2 style={styles.sectionTitle}>Shop by Category</h2>
          <div style={styles.catGrid}>
            {CATEGORIES.map(cat => (
              <Link key={cat} to={`/products?category=${cat}`} style={styles.catCard}>
                <span style={styles.catIcon}>{catIcon(cat)}</span>
                <span style={styles.catName}>{cat}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section style={styles.section}>
        <div className="container">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>⭐ Featured Products</h2>
            <Link to="/products" className="btn btn-secondary btn-sm">View All →</Link>
          </div>
          {loading ? (
            <div className="page-center"><span className="spinner" /></div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* USP Banner */}
      <section style={styles.uspBanner}>
        <div className="container">
          <div style={styles.uspGrid}>
            {[
              { icon: '🚚', title: 'Free Shipping', desc: 'On orders above ₹499' },
              { icon: '🔒', title: 'Secure Payment', desc: 'Powered by Stripe' },
              { icon: '↩️', title: 'Easy Returns',  desc: '7-day return policy' },
              { icon: '⚡', title: 'Fast Delivery',  desc: '3-5 business days' },
            ].map(u => (
              <div key={u.title} style={styles.uspCard}>
                <span style={styles.uspIcon}>{u.icon}</span>
                <div>
                  <div style={styles.uspTitle}>{u.title}</div>
                  <div style={styles.uspDesc}>{u.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

const catIcon = c => ({ Electronics:'📱', Clothing:'👕', Books:'📚', Home:'🏠', Sports:'⚽', Beauty:'💄' }[c] || '🛍️');

const styles = {
  hero:         { background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)', color: 'white', padding: '80px 0' },
  heroInner:    { maxWidth: 600 },
  heroTitle:    { fontSize: 48, fontWeight: 800, lineHeight: 1.2, marginBottom: 16 },
  heroSub:      { fontSize: 18, opacity: .8, marginBottom: 32 },
  section:      { padding: '60px 0' },
  sectionTitle: { fontSize: 26, fontWeight: 700, marginBottom: 24 },
  sectionHeader:{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  catGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 },
  catCard:      { background: 'white', border: '1px solid #eee', borderRadius: 12, padding: '20px 12px', textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, transition: 'box-shadow .2s', cursor: 'pointer' },
  catIcon:      { fontSize: 32 },
  catName:      { fontSize: 13, fontWeight: 600 },
  uspBanner:    { background: '#f8f9fa', padding: '40px 0' },
  uspGrid:      { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 24 },
  uspCard:      { display: 'flex', alignItems: 'center', gap: 12 },
  uspIcon:      { fontSize: 28 },
  uspTitle:     { fontWeight: 600, fontSize: 14 },
  uspDesc:      { fontSize: 12, color: '#666', marginTop: 2 },
};
