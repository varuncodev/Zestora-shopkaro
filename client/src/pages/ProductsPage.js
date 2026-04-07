import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../store/slices/productSlice';
import ProductCard from '../components/product/ProductCard';

const CATEGORIES = ['All', 'Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys'];
const SORT_OPTIONS = [
  { label: 'Newest',       value: '-createdAt' },
  { label: 'Price: Low',   value: 'price' },
  { label: 'Price: High',  value: '-price' },
  { label: 'Top Rated',    value: '-rating' },
];

export default function ProductsPage() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const { products, loading, total, pages } = useSelector(s => s.product);

  const [filters, setFilters] = useState({
    keyword:  params.get('keyword')  || '',
    category: params.get('category') || '',
    minPrice: '', maxPrice: '',
    sort:     '-createdAt',
    page:     1,
  });

  const loadProducts = useCallback(() => {
    const p = {};
    if (filters.keyword)  p.keyword  = filters.keyword;
    if (filters.category) p.category = filters.category;
    if (filters.minPrice) p.minPrice = filters.minPrice;
    if (filters.maxPrice) p.maxPrice = filters.maxPrice;
    p.sort  = filters.sort;
    p.page  = filters.page;
    p.limit = 12;
    dispatch(fetchProducts(p));
  }, [filters, dispatch]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val, page: 1 }));

  return (
    <div className="container" style={{ padding: '32px 16px' }}>
      <div style={styles.layout}>
        {/* Sidebar Filters */}
        <aside style={styles.sidebar}>
          <h3 style={styles.filterTitle}>Filters</h3>

          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>Category</label>
            {CATEGORIES.map(cat => (
              <button key={cat}
                onClick={() => setFilter('category', cat === 'All' ? '' : cat)}
                style={{ ...styles.filterBtn, ...(filters.category === (cat === 'All' ? '' : cat) ? styles.filterBtnActive : {}) }}>
                {cat}
              </button>
            ))}
          </div>

          <div style={styles.filterSection}>
            <label style={styles.filterLabel}>Price Range (₹)</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input type="number" placeholder="Min" value={filters.minPrice}
                onChange={e => setFilter('minPrice', e.target.value)}
                style={{ width: '50%', padding: '8px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} />
              <input type="number" placeholder="Max" value={filters.maxPrice}
                onChange={e => setFilter('maxPrice', e.target.value)}
                style={{ width: '50%', padding: '8px', border: '1px solid #ddd', borderRadius: 6, fontSize: 13 }} />
            </div>
          </div>

          <button className="btn btn-secondary btn-full btn-sm"
            onClick={() => setFilters({ keyword: '', category: '', minPrice: '', maxPrice: '', sort: '-createdAt', page: 1 })}>
            Clear Filters
          </button>
        </aside>

        {/* Product Grid */}
        <div style={styles.main}>
          <div style={styles.topBar}>
            <p style={styles.count}>{total} products found</p>
            <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)} style={styles.sortSelect}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          {loading ? (
            <div className="page-center"><span className="spinner" /></div>
          ) : products.length === 0 ? (
            <div className="page-center" style={{ flexDirection: 'column', gap: 12 }}>
              <span style={{ fontSize: 48 }}>😕</span>
              <p>No products found. Try different filters.</p>
            </div>
          ) : (
            <div className="products-grid">
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {pages > 1 && (
            <div style={styles.pagination}>
              {Array.from({ length: pages }, (_, i) => i + 1).map(n => (
                <button key={n} onClick={() => setFilters(f => ({ ...f, page: n }))}
                  style={{ ...styles.pageBtn, ...(filters.page === n ? styles.pageBtnActive : {}) }}>
                  {n}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  layout:          { display: 'grid', gridTemplateColumns: '220px 1fr', gap: 32 },
  sidebar:         { background: 'white', borderRadius: 12, padding: 20, border: '1px solid #eee', height: 'fit-content', position: 'sticky', top: 80 },
  filterTitle:     { fontSize: 16, fontWeight: 700, marginBottom: 16 },
  filterSection:   { marginBottom: 20 },
  filterLabel:     { display: 'block', fontSize: 12, fontWeight: 600, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '.05em' },
  filterBtn:       { display: 'block', width: '100%', textAlign: 'left', padding: '7px 12px', margin: '3px 0', border: '1px solid #eee', borderRadius: 6, background: 'none', cursor: 'pointer', fontSize: 13 },
  filterBtnActive: { background: '#1a1a1a', color: 'white', borderColor: '#1a1a1a' },
  main:            { minWidth: 0 },
  topBar:          { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  count:           { fontSize: 14, color: '#666' },
  sortSelect:      { padding: '8px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14 },
  pagination:      { display: 'flex', justifyContent: 'center', gap: 8, marginTop: 40 },
  pageBtn:         { width: 36, height: 36, border: '1px solid #ddd', borderRadius: 8, background: 'white', cursor: 'pointer', fontSize: 14 },
  pageBtnActive:   { background: '#1a1a1a', color: 'white', borderColor: '#1a1a1a' },
};
