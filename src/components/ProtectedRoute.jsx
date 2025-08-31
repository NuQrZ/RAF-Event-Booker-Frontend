import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isExpired } from '../utils/jwt';

export default function ProtectedRoute({ children }) {
  const loc = useLocation();
  const raw = (localStorage.getItem('token') || '').replace(/^["']|["']$/g, '');
  if (!raw || isExpired(raw)) {
    localStorage.setItem('next', encodeURIComponent(loc.pathname + loc.search));
    return <Navigate to="/login" replace />;
  }
  return children;
}
