import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children }) {
  const { profile } = useAuth()
  if (!profile) return <Navigate to="/login" replace />
  return children
}
