import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AppShell from './components/AppShell';
import ProtectedRoute from './components/ProtectedRoute';

// PUBLIC
import PublicHome from './pages/public/PublicHome';
import PublicMostViewed from './pages/public/PublicMostViewed';
import PublicMostReacted from './pages/public/PublicMostReacted';
import PublicByCategory from './pages/public/PublicByCategory';
import PublicByTag from './pages/public/PublicByTag';
import PublicEvent from './pages/public/PublicEvent';

// AUTH / EMS
import Login from './pages/Login';
import NoAccess from './pages/NoAccess';
import Home from './pages/Home'; // admin dashboard
import UsersList from './pages/UsersList';
import UserDetails from './pages/UserDetails';
import UserEdit from './pages/UserEdit';
import CreateUser from './pages/CreateUser';
import Categories from './pages/Categories';
import Events from './pages/Events';
import EventForm from './pages/EventsForm';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/public/events" replace />} />

        <Route path="/public" element={<AppShell />}>
          <Route path="events" element={<PublicHome />} />
          <Route path="events/latest" element={<PublicHome />} />
          <Route path="events/most-viewed" element={<PublicMostViewed />} />
          <Route path="events/most-reacted" element={<PublicMostReacted />} />
          <Route path="events/by-category/:categoryID" element={<PublicByCategory />} />
          <Route path="events/by-tag/:tag" element={<PublicByTag />} />
          <Route path="events/:eventID" element={<PublicEvent />} />
        </Route>

        <Route path="/login" element={<Login />} />
        <Route path="/no-access" element={<NoAccess />} />

        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/adminHome" element={<Home />} />
          <Route path="/ems/users" element={<UsersList />} />
          <Route path="/ems/users/create" element={<CreateUser />} />
          <Route path="/ems/users/:userID" element={<UserDetails />} />
          <Route path="/ems/users/:userID/edit" element={<UserEdit />} />

          <Route path="/ems/events" element={<Events />} />
          <Route path="/ems/events/create" element={<EventForm mode="create" />} />
          <Route path="/ems/events/:eventID/edit" element={<EventForm mode="edit" />} />

          <Route path="/ems/categories" element={<Categories />} />
        </Route>

        <Route path="*" element={<Navigate to="/public/events" replace />} />
      </Routes>
    </AuthProvider>
  );
}
