import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { clearCart, selectCartCount } from '../../store/slices/cartSlice';

export default function Navbar() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { user }   = useSelector(s => s.auth);
  const cartCount  = useSelector(selectCartCount);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch]     = useState('');

  const handleLogout = () => {
    dispatch(logout());
    dispatch(clearCart());
    navigate('/login');
  };

  const handleSearch = e => {
    e.preventDefault();
    if (search.trim()) navigate(`/products?keyword=${encodeURIComponent(search.trim())}`);
  };

  return (
    <nav style={styles.nav}>
      <div className="container" style={styles.inner}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>🛍️ ShopKaro</Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={styles.searchForm}>
          <input
            type="text" placeholder="Search products..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={styles.searchInput}
          />
          <button type="submit" style={styles.searchBtn}>🔍</button>
        </form>

        {/* Nav Links */}
        <div style={styles.links}>
          <Link to="/products" style={styles.link}>Products</Link>

          <Link to="/cart" style={styles.cartLink}>
            🛒
            {cartCount > 0 && <span style={styles.badge}>{cartCount}</span>}
          </Link>

          {user ? (
            <div style={styles.dropdown}>
              <button style={styles.userBtn} onClick={() => setMenuOpen(!menuOpen)}>
                👤 {user.name.split(' ')[0]} ▾
              </button>
              {menuOpen && (
                <div style={styles.dropdownMenu} onClick={() => setMenuOpen(false)}>
                  <Link to="/profile" style={styles.dropItem}>My Profile</Link>
                  <Link to="/orders"  style={styles.dropItem}>My Orders</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" style={{ ...styles.dropItem, color: '#e67e22', fontWeight: 600 }}>
                      ⚙️ Admin Panel
                    </Link>
                  )}
                  <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #eee' }} />
                  <button onClick={handleLogout} style={{ ...styles.dropItem, border: 'none', background: 'none', cursor: 'pointer', color: '#dc3545', width: '100%', textAlign: 'left' }}>
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login"    style={styles.link}>Login</Link>
              <Link to="/register" style={{ ...styles.link, background: '#1a1a1a', color: 'white', padding: '8px 16px', borderRadius: 8 }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

const styles = {
  nav:        { background: 'white', borderBottom: '1px solid #eee', position: 'sticky', top: 0, zIndex: 100 },
  inner:      { display: 'flex', alignItems: 'center', gap: 16, height: 64 },
  logo:       { fontWeight: 700, fontSize: 22, textDecoration: 'none', color: '#1a1a1a', whiteSpace: 'nowrap' },
  searchForm: { flex: 1, display: 'flex', maxWidth: 400 },
  searchInput:{ flex: 1, padding: '8px 14px', border: '1px solid #ddd', borderRadius: '8px 0 0 8px', fontSize: 14, outline: 'none' },
  searchBtn:  { padding: '8px 14px', background: '#1a1a1a', color: 'white', border: 'none', borderRadius: '0 8px 8px 0', cursor: 'pointer' },
  links:      { display: 'flex', alignItems: 'center', gap: 16 },
  link:       { textDecoration: 'none', color: '#555', fontSize: 14, fontWeight: 500 },
  cartLink:   { position: 'relative', textDecoration: 'none', fontSize: 20 },
  badge:      { position: 'absolute', top: -8, right: -8, background: '#dc3545', color: 'white', borderRadius: '50%', width: 18, height: 18, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  userBtn:    { background: 'none', border: '1px solid #ddd', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontSize: 14 },
  dropdown:   { position: 'relative' },
  dropdownMenu:{ position: 'absolute', right: 0, top: '110%', background: 'white', border: '1px solid #eee', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,.1)', minWidth: 180, zIndex: 200, padding: '6px 0' },
  dropItem:   { display: 'block', padding: '10px 16px', textDecoration: 'none', color: '#333', fontSize: 14 },
};
