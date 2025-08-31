import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Toolbar, ToolbarButton, Divider, Avatar, Badge
} from '@fluentui/react-components';
import {
  Add24Regular, Home24Regular, SignOut24Regular, People24Regular,
  CalendarMonth24Regular, TagMultiple24Regular, Globe24Regular,
  Key24Regular
} from '@fluentui/react-icons';
import './AppShell.css';

export default function AppShell() {
  const { profile, logout } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();

  const role = profile?.role ?? null;
  const isAdmin = role === 'ADMIN';
  const isCreator = role === 'EVENT_CREATOR';
  const isAuthed = isAdmin || isCreator;

  const isEms = loc.pathname.startsWith('/ems') || loc.pathname === '/adminHome';
  const isPublic = loc.pathname.startsWith('/public');

  const adminHomeActive = loc.pathname === '/adminHome';
  const usersActive = loc.pathname.startsWith('/ems/users') && !loc.pathname.endsWith('/create');
  const createActive = loc.pathname.endsWith('/create') && loc.pathname.startsWith('/ems/users');
  const eventsActive = loc.pathname.startsWith('/ems/events');
  const categoriesActive = loc.pathname.startsWith('/ems/categories');
  const publicEventsActive = isPublic;

  return (
    <div className="app-container app-gradient">
      <Toolbar className="app-toolbar">
        {isAdmin && (
          <>
            <ToolbarButton
              className={`nav-btn ${adminHomeActive ? 'primary-btn' : ''}`}
              appearance={adminHomeActive ? 'primary' : 'subtle'}
              onClick={() => nav('/adminHome')}
              icon={<Home24Regular />}
            >
              Home
            </ToolbarButton>

            <ToolbarButton
              className={`nav-btn ${usersActive ? 'primary-btn' : ''}`}
              appearance={usersActive ? 'primary' : 'subtle'}
              onClick={() => nav('/ems/users')}
              icon={<People24Regular />}
            >
              Users
            </ToolbarButton>

            <ToolbarButton
              className={`nav-btn ${createActive ? 'primary-btn' : ''}`}
              appearance={createActive ? 'primary' : 'subtle'}
              onClick={() => nav('/ems/users/create')}
              icon={<Add24Regular />}
            >
              Create User
            </ToolbarButton>

            <div className="toolbar-spacer" />

            <div className="profile-chip">
              <Avatar
                name={`${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`}
                color="brand"
                size={28}
              />
              <span className="profile-name">
                {profile?.firstName} {profile?.lastName}
              </span>
              {role && <Badge appearance="tint">{role}</Badge>}
            </div>
            <Divider vertical className="toolbar-divider" />

            <ToolbarButton
              className={`nav-btn ${eventsActive ? 'primary-btn' : ''}`}
              appearance={eventsActive ? 'primary' : 'subtle'}
              onClick={() => nav('/ems/events')}
              icon={<CalendarMonth24Regular />}
            >
              Events
            </ToolbarButton>

            <ToolbarButton
              className={`nav-btn ${categoriesActive ? 'primary-btn' : ''}`}
              appearance={categoriesActive ? 'primary' : 'subtle'}
              onClick={() => nav('/ems/categories')}
              icon={<TagMultiple24Regular />}
            >
              Categories
            </ToolbarButton>

            <ToolbarButton
              className={`nav-btn ${publicEventsActive ? 'primary-btn' : ''}`}
              appearance={publicEventsActive ? 'primary' : 'subtle'}
              onClick={() => nav('/public/events')}
              icon={<Globe24Regular />}
            >
              Public Events
            </ToolbarButton>

            <ToolbarButton
              className="nav-btn ghost-danger"
              appearance="subtle"
              onClick={logout}
              icon={<SignOut24Regular />}
            >
              Logout
            </ToolbarButton>
          </>
        )}

        {isCreator && (
          <>
            <ToolbarButton
              className={`nav-btn ${eventsActive ? 'primary-btn' : ''}`}
              appearance={eventsActive ? 'primary' : 'subtle'}
              onClick={() => nav('/ems/events')}
              icon={<CalendarMonth24Regular />}
            >
              Events
            </ToolbarButton>

            <ToolbarButton
              className={`nav-btn ${categoriesActive ? 'primary-btn' : ''}`}
              appearance={categoriesActive ? 'primary' : 'subtle'}
              onClick={() => nav('/ems/categories')}
              icon={<TagMultiple24Regular />}
            >
              Categories
            </ToolbarButton>

            <ToolbarButton
              className={`nav-btn ${publicEventsActive ? 'primary-btn' : ''}`}
              appearance={publicEventsActive ? 'primary' : 'subtle'}
              onClick={() => nav('/public/events')}
              icon={<Globe24Regular />}
            >
              Public Events
            </ToolbarButton>

            <div className="profile-chip">
              <Avatar
                name={`${profile?.firstName ?? ''} ${profile?.lastName ?? ''}`}
                color="brand"
                size={28}
              />
              <span className="profile-name">
                {profile?.firstName} {profile?.lastName}
              </span>
              {role && <Badge appearance="tint">{role}</Badge>}
            </div>
            <Divider vertical className="toolbar-divider" />

            <div className="toolbar-spacer" />

            <ToolbarButton
              className="nav-btn ghost-danger"
              appearance="subtle"
              onClick={logout}
              icon={<SignOut24Regular />}
            >
              Logout
            </ToolbarButton>
          </>
        )}

        {!isAuthed && (
          <>
            <ToolbarButton
              className={`nav-btn ${publicEventsActive ? 'primary-btn' : ''}`}
              appearance={publicEventsActive ? 'primary' : 'subtle'}
              onClick={() => nav('/public/events')}
              icon={<Globe24Regular />}
            >
              Public Events
            </ToolbarButton>

            <div className="toolbar-spacer" />

            <ToolbarButton
              className="nav-btn"
              appearance="primary"
              onClick={() => nav('/login')}
              icon={<Key24Regular />}
            >
              Login
            </ToolbarButton>
          </>
        )}
      </Toolbar>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
