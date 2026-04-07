import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { fetchMe } from './store/slices/authSlice';

import Navbar          from './components/common/Navbar';
import Footer          from './components/common/Footer';
import ProtectedRoute  from './components/common/ProtectedRoute';
import AdminRoute      from './components/common/AdminRoute';

// Pages
import HomePage        from './pages/HomePage';
import ProductsPage    from './pages/ProductsPage';
import ProductDetail   from './pages/ProductDetail';
import CartPage        from './pages/CartPage';
import LoginPage       from './pages/LoginPage';
import RegisterPage    from './pages/RegisterPage';
import CheckoutPage    from './pages/CheckoutPage';
import OrderSuccess    from './pages/OrderSuccess';
import OrderHistory    from './pages/OrderHistory';
import OrderDetail     from './pages/OrderDetail';
import ProfilePage     from './pages/ProfilePage';

// Admin Pages
import AdminDashboard  from './pages/admin/Dashboard';
import AdminProducts   from './pages/admin/Products';
import AdminOrders     from './pages/admin/Orders';
import AdminUsers      from './pages/admin/Users';

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

function App() {
  const dispatch = useDispatch();
  const { accessToken } = useSelector(s => s.auth);

  useEffect(() => {
    if (accessToken) dispatch(fetchMe());
  }, [accessToken, dispatch]);

  return (
    <BrowserRouter>
      <Elements stripe={stripePromise}>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              {/* Public */}
              <Route path="/"              element={<HomePage />} />
              <Route path="/products"      element={<ProductsPage />} />
              <Route path="/products/:id"  element={<ProductDetail />} />
              <Route path="/cart"          element={<CartPage />} />
              <Route path="/login"         element={<LoginPage />} />
              <Route path="/register"      element={<RegisterPage />} />

              {/* Protected (logged in users) */}
              <Route element={<ProtectedRoute />}>
                <Route path="/checkout"        element={<CheckoutPage />} />
                <Route path="/order-success"   element={<OrderSuccess />} />
                <Route path="/orders"          element={<OrderHistory />} />
                <Route path="/orders/:id"      element={<OrderDetail />} />
                <Route path="/profile"         element={<ProfilePage />} />
              </Route>

              {/* Admin only */}
              <Route element={<AdminRoute />}>
                <Route path="/admin"           element={<AdminDashboard />} />
                <Route path="/admin/products"  element={<AdminProducts />} />
                <Route path="/admin/orders"    element={<AdminOrders />} />
                <Route path="/admin/users"     element={<AdminUsers />} />
              </Route>

              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Elements>
    </BrowserRouter>
  );
}

export default App;
