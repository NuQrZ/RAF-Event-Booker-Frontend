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

// ⬇️ dodaj ove import-e
import Categories from './pages/Categories'
import Events from './pages/Events'
import EventForm from './pages/EventForm'
import PublicHome from './pages/public/PublicHome'
import PublicMostViewed from './pages/public/PublicMostViewed'
import PublicMostReacted from './pages/public/PublicMostReacted'
import PublicByCategory from './pages/public/PublicByCategory'
import PublicByTag from './pages/public/PublicByTag'
import PublicEvent from './pages/public/PublicEvent'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Javne rute – VAN ProtectedRoute */}
        <Route path="/public/events" element={<PublicHome />} />            {/* ⬅️ ovo ti je nedostajalo */}
        <Route path="/public/events/latest" element={<PublicHome />} />
        <Route path="/public/events/most-viewed" element={<PublicMostViewed />} />
        <Route path="/public/events/most-reacted" element={<PublicMostReacted />} />
        <Route path="/public/events/by-category/:categoryID" element={<PublicByCategory />} />
        <Route path="/public/events/by-tag/:tag" element={<PublicByTag />} />
        <Route path="/public/events/:eventID" element={<PublicEvent />} />

        {/* Login / No access (takođe javno dostupno) */}
        <Route path="/login" element={<Login />} />
        <Route path="/no-access" element={<NoAccess />} />

        {/* EMS – ZAŠTIĆENO */}
        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route index element={<Home />} />
          <Route path="/ems/users" element={<UsersList />} />
          <Route path="/ems/users/create" element={<CreateUser />} />
          <Route path="/ems/users/:userID" element={<UserDetails />} />
          <Route path="/ems/users/:userID/edit" element={<UserEdit />} />

          {/* EMS Events/Categories */}
          <Route path="/ems/events" element={<Events />} />
          <Route path="/ems/events/create" element={<EventForm mode="create" />} />
          <Route path="/ems/events/:eventID/edit" element={<EventForm mode="edit" />} />
          <Route path="/ems/categories" element={<Categories />} />
        </Route>

        {/* Catch-all MORA na kraju */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
