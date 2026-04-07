import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../../store/slices/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const { _id, name, price, discountPrice, images, rating, numReviews, stock, category } = product;
  const img      = images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image';
  const stars    = '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  const discount = discountPrice && discountPrice < price
    ? Math.round(((price - discountPrice) / price) * 100)
    : null;

  const handleAddToCart = e => {
    e.preventDefault();
    dispatch(addToCart({ product: _id, name, price: discountPrice || price, image: img, stock }));
  };

  return (
    <Link to={`/products/${_id}`} style={styles.card}>
      <div style={styles.imgWrap}>
        <img src={img} alt={name} style={styles.img} loading="lazy" />
        {discount && <span style={styles.discBadge}>-{discount}%</span>}
        {stock === 0 && <span style={styles.outBadge}>Out of Stock</span>}
        <span style={styles.catBadge}>{category}</span>
      </div>
      <div style={styles.body}>
        <h3 style={styles.name}>{name}</h3>
        <div style={styles.rating}>
          <span style={{ color: '#f59e0b' }}>{stars}</span>
          <span style={styles.reviews}>({numReviews})</span>
        </div>
        <div style={styles.priceRow}>
          <span style={styles.price}>₹{(discountPrice || price).toLocaleString()}</span>
          {discount && <span style={styles.oldPrice}>₹{price.toLocaleString()}</span>}
        </div>
        <button
          className="btn btn-primary btn-full btn-sm"
          onClick={handleAddToCart}
          disabled={stock === 0}
          style={{ marginTop: 10 }}
        >
          {stock === 0 ? 'Out of Stock' : '+ Add to Cart'}
        </button>
      </div>
    </Link>
  );
}

const styles = {
  card:      { background: 'white', borderRadius: 12, border: '1px solid #eee', overflow: 'hidden', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'box-shadow .2s', cursor: 'pointer' },
  imgWrap:   { position: 'relative', paddingBottom: '100%', overflow: 'hidden', background: '#f8f8f8' },
  img:       { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .3s' },
  discBadge: { position: 'absolute', top: 10, left: 10, background: '#dc3545', color: 'white', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 },
  outBadge:  { position: 'absolute', top: 10, right: 10, background: '#6c757d', color: 'white', padding: '3px 8px', borderRadius: 6, fontSize: 11 },
  catBadge:  { position: 'absolute', bottom: 10, left: 10, background: 'rgba(0,0,0,.6)', color: 'white', padding: '2px 8px', borderRadius: 20, fontSize: 10 },
  body:      { padding: '14px' },
  name:      { fontSize: 14, fontWeight: 600, marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 },
  rating:    { display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 },
  reviews:   { fontSize: 12, color: '#888' },
  priceRow:  { display: 'flex', alignItems: 'center', gap: 8 },
  price:     { fontSize: 18, fontWeight: 700 },
  oldPrice:  { fontSize: 13, color: '#999', textDecoration: 'line-through' },
};
