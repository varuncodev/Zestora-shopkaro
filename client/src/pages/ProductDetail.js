import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import api from '../api/axiosConfig';

export default function ProductDetail() {
  const { id } = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { product, loading } = useSelector(s => s.product);
  const { user }             = useSelector(s => s.auth);

  const [qty,       setQty]       = useState(1);
  const [imgIdx,    setImgIdx]    = useState(0);
  const [rating,    setRating]    = useState(5);
  const [comment,   setComment]   = useState('');
  const [revLoading,setRevLoading]= useState(false);
  const [revMsg,    setRevMsg]    = useState('');

  useEffect(() => { dispatch(fetchProductById(id)); }, [id, dispatch]);

  if (loading || !product) return <div className="page-center"><span className="spinner" /></div>;

  const { name, description, price, discountPrice, images, rating: prodRating,
          numReviews, stock, category, brand, reviews } = product;
  const finalPrice = discountPrice || price;
  const img        = images?.[imgIdx]?.url || 'https://via.placeholder.com/600x600?text=No+Image';
  const stars      = n => '★'.repeat(n) + '☆'.repeat(5 - n);

  const handleAddToCart = () => {
    dispatch(addToCart({ product: id, name, price: finalPrice, image: images?.[0]?.url, stock, qty }));
    navigate('/cart');
  };

  const submitReview = async e => {
    e.preventDefault();
    setRevLoading(true); setRevMsg('');
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      setRevMsg('Review submitted!');
      setComment(''); setRating(5);
      dispatch(fetchProductById(id));
    } catch (err) {
      setRevMsg(err.response?.data?.message || 'Error submitting review');
    } finally { setRevLoading(false); }
  };

  return (
    <div className="container" style={{ padding: '40px 16px' }}>
      <div style={styles.grid}>
        {/* Images */}
        <div>
          <img src={img} alt={name} style={styles.mainImg} />
          {images?.length > 1 && (
            <div style={styles.thumbRow}>
              {images.map((im, i) => (
                <img key={i} src={im.url} alt="" onClick={() => setImgIdx(i)}
                  style={{ ...styles.thumb, ...(i === imgIdx ? styles.thumbActive : {}) }} />
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span style={styles.catTag}>{category}</span>
          {brand && <span style={{ ...styles.catTag, marginLeft: 8 }}>{brand}</span>}
          <h1 style={styles.name}>{name}</h1>

          <div style={styles.ratingRow}>
            <span style={{ color: '#f59e0b', fontSize: 18 }}>{stars(Math.round(prodRating))}</span>
            <span style={{ color: '#666', fontSize: 14 }}>({numReviews} reviews)</span>
          </div>

          <div style={styles.priceRow}>
            <span style={styles.price}>₹{finalPrice.toLocaleString()}</span>
            {discountPrice && discountPrice < price && (
              <>
                <span style={styles.oldPrice}>₹{price.toLocaleString()}</span>
                <span style={styles.discount}>{Math.round(((price - discountPrice) / price) * 100)}% OFF</span>
              </>
            )}
          </div>

          <p style={styles.desc}>{description}</p>

          <div style={styles.stockRow}>
            Status: <strong style={{ color: stock > 0 ? '#28a745' : '#dc3545' }}>
              {stock > 0 ? `In Stock (${stock} left)` : 'Out of Stock'}
            </strong>
          </div>

          {stock > 0 && (
            <div style={styles.qtyRow}>
              <label style={{ fontWeight: 600 }}>Qty:</label>
              <select value={qty} onChange={e => setQty(Number(e.target.value))} style={styles.qtySelect}>
                {Array.from({ length: Math.min(stock, 10) }, (_, i) => i + 1).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            <button className="btn btn-primary" onClick={handleAddToCart} disabled={stock === 0}
              style={{ flex: 1, padding: 14, fontSize: 16 }}>
              🛒 Add to Cart
            </button>
            <button className="btn btn-secondary" onClick={() => { handleAddToCart(); }} style={{ flex: 1, padding: 14, fontSize: 16 }}>
              ⚡ Buy Now
            </button>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div style={styles.reviewSection}>
        <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24 }}>Customer Reviews</h2>

        {reviews?.length === 0 && <p style={{ color: '#888' }}>No reviews yet. Be the first!</p>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {reviews?.map(r => (
            <div key={r._id} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <div style={styles.avatar}>{r.name?.[0]?.toUpperCase()}</div>
                <div>
                  <div style={{ fontWeight: 600 }}>{r.name}</div>
                  <div style={{ color: '#f59e0b' }}>{stars(r.rating)}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: '#999', fontSize: 12 }}>
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ marginTop: 8, color: '#444', fontSize: 14 }}>{r.comment}</p>
            </div>
          ))}
        </div>

        {user ? (
          <form onSubmit={submitReview} style={styles.reviewForm}>
            <h3 style={{ fontWeight: 600, marginBottom: 12 }}>Write a Review</h3>
            <div style={styles.starPicker}>
              {[1,2,3,4,5].map(n => (
                <span key={n} onClick={() => setRating(n)}
                  style={{ fontSize: 28, cursor: 'pointer', color: n <= rating ? '#f59e0b' : '#ddd' }}>★</span>
              ))}
            </div>
            <textarea value={comment} onChange={e => setComment(e.target.value)}
              placeholder="Share your experience..." rows={4} required
              style={{ width: '100%', padding: 12, border: '1px solid #ddd', borderRadius: 8, fontSize: 14, resize: 'vertical', marginBottom: 12 }} />
            {revMsg && <p style={{ marginBottom: 8, color: revMsg.includes('Error') ? '#dc3545' : '#28a745' }}>{revMsg}</p>}
            <button type="submit" className="btn btn-primary" disabled={revLoading}>
              {revLoading ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        ) : (
          <p style={{ color: '#666' }}>
            <a href="/login" style={{ color: '#1a1a1a', fontWeight: 600 }}>Login</a> to write a review.
          </p>
        )}
      </div>
    </div>
  );
}

const styles = {
  grid:          { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 48, marginBottom: 48 },
  mainImg:       { width: '100%', borderRadius: 12, objectFit: 'cover', aspectRatio: '1' },
  thumbRow:      { display: 'flex', gap: 8, marginTop: 12 },
  thumb:         { width: 64, height: 64, objectFit: 'cover', borderRadius: 8, cursor: 'pointer', border: '2px solid transparent' },
  thumbActive:   { border: '2px solid #1a1a1a' },
  catTag:        { display: 'inline-block', background: '#f0f0f0', padding: '4px 10px', borderRadius: 20, fontSize: 12, marginBottom: 10 },
  name:          { fontSize: 28, fontWeight: 700, lineHeight: 1.3, margin: '8px 0 12px' },
  ratingRow:     { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 },
  priceRow:      { display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 },
  price:         { fontSize: 32, fontWeight: 800 },
  oldPrice:      { fontSize: 18, color: '#999', textDecoration: 'line-through' },
  discount:      { background: '#d4edda', color: '#155724', padding: '3px 10px', borderRadius: 20, fontSize: 13, fontWeight: 600 },
  desc:          { color: '#555', lineHeight: 1.7, marginBottom: 16 },
  stockRow:      { fontSize: 14, marginBottom: 12 },
  qtyRow:        { display: 'flex', alignItems: 'center', gap: 12 },
  qtySelect:     { padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 },
  reviewSection: { borderTop: '1px solid #eee', paddingTop: 40 },
  reviewCard:    { background: 'white', border: '1px solid #eee', borderRadius: 10, padding: 16 },
  reviewHeader:  { display: 'flex', alignItems: 'center', gap: 12 },
  avatar:        { width: 40, height: 40, borderRadius: '50%', background: '#1a1a1a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 },
  reviewForm:    { background: 'white', border: '1px solid #eee', borderRadius: 12, padding: 24 },
  starPicker:    { display: 'flex', gap: 4, marginBottom: 12 },
};
