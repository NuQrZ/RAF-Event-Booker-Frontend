import React from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Toolbar, ToolbarButton, Divider, Avatar, Badge } from '@fluentui/react-components'
import { Add24Regular, Home24Regular, SignOut24Regular, People24Regular } from '@fluentui/react-icons'
import './AppShell.css'

export default function AppShell() {
  const { profile, logout } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()

  return (
    <div className="app-container app-gradient">
      <Toolbar style={{ padding: 12 }}>
        <ToolbarButton appearance="transparent" onClick={() => nav('/')} icon={<Home24Regular />}>
          Home
        </ToolbarButton>

        <ToolbarButton
          appearance={loc.pathname.startsWith('/users') ? 'primary' : 'subtle'}
          onClick={() => { if (profile?.role === 'ADMIN') nav('/users'); else nav('/no-access') }}
          icon={<People24Regular />}>
          Users
        </ToolbarButton>

        <ToolbarButton appearance="subtle" onClick={() => { if (profile?.role === 'ADMIN') nav('/users/create'); else nav('/no-access') }} icon={<Add24Regular />}>
          Create User
        </ToolbarButton>

        <div className="toolbar-spacer" />

        <div className="profile-area">
          <Avatar name={`${profile?.firstName} ${profile?.lastName}`} color="brand" size={28} />
          <span className="profile-name">{profile?.firstName} {profile?.lastName}</span>
          <Badge appearance="tint">{profile?.role}</Badge>
        </div>

        <Divider vertical style={{ marginLeft: 12, marginRight: 12 }} />
        <ToolbarButton appearance="subtle" onClick={logout} icon={<SignOut24Regular />}>
          Logout
        </ToolbarButton>
      </Toolbar>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
