import React, { createContext, useContext, useMemo, useState } from 'react'
import { api } from '../utils/api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [profile, setProfile] = useState(() => {
    const token = localStorage.getItem('token')
    const role = localStorage.getItem('role')
    const firstName = localStorage.getItem('firstName')
    const lastName = localStorage.getItem('lastName')
    return token ? { token, role, firstName, lastName } : null
  })

  const login = async (email, password) => {
    const { data } = await api('/auth/login', { method: 'POST', auth: false, body: { email, password } })
    localStorage.setItem('token', data.token)
    localStorage.setItem('role', data.role)
    localStorage.setItem('firstName', data.firstName)
    localStorage.setItem('lastName', data.lastName)
    setProfile({ token: data.token, role: data.role, firstName: data.firstName, lastName: data.lastName })
  }

  const logout = () => {
    localStorage.clear()
    setProfile(null)
    window.location.href = '/login'
  }

  const value = useMemo(() => ({ profile, login, logout }), [profile])
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
