import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function AdminRoute() {
  const { user, accessToken } = useSelector(s => s.auth);
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin')  return <Navigate to="/"     replace />;
  return <Outlet />;
}
