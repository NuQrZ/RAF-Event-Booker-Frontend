import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import AppShell from './components/AppShell'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Home from './pages/Home'
import UsersList from './pages/UsersList'
import UserDetails from './pages/UserDetails'
import UserEdit from './pages/UserEdit'
import CreateUser from './pages/CreateUser'
import NoAccess from './pages/NoAccess'
import { useAuth } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="/users" element={<UsersList />} />
          <Route path="/users/create" element={<CreateUser />} />
          <Route path="/users/:userID" element={<UserDetails />} />
          <Route path="/users/:userID/edit" element={<UserEdit />} />
          <Route path="/no-access" element={<NoAccess />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
