import React, { useState } from 'react'
import { Button, Input, Label, Title2, Card, Text } from '@fluentui/react-components'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { useAuth } from '../context/AuthContext'
import '../styles/pages/Home.css'

export default function Home() {
  const nav = useNavigate()
  const { profile } = useAuth()
  const [email, setEmail] = useState('')
  const [result, setResult] = useState(null)
  const [err, setErr] = useState('')

  const findByEmail = async (e) => {
    e.preventDefault(); setErr(''); setResult(null)
    try { const { data } = await api(`/users/by-email?email=${encodeURIComponent(email)}`); setResult(data) } catch (e) { setErr(e.message) }
  }

  return (
    <div>
      <Title2>Welcome</Title2>
      <div className="home-actions">
        <Button appearance="primary" onClick={() => { if (profile?.role === 'ADMIN') nav('/users'); else nav('/no-access') }}>Manage Users</Button>
        <Button onClick={() => { if (profile?.role === 'ADMIN') nav('/users/create'); else nav('/no-access') }}>Create User</Button>
      </div>

      <Card style={{ marginTop: 24, padding: 16 }}>
        <form className="find-form" onSubmit={findByEmail}>
          <Label htmlFor="email">Find user by email</Label>
          <Input id="email" type="email" value={email} onChange={(e,d)=>setEmail(d.value)} placeholder="name@example.com" />
          <Button type="submit">Search</Button>
        </form>
        {err && <Text style={{ color: 'crimson' }}>{err}</Text>}
        {result && (
          <div style={{ marginTop: 12 }}>
            <Text>User found: {result.firstName} {result.lastName} — {result.email}</Text>
            <div><Button appearance="subtle" onClick={() => nav(`/users/${result.userID}`)}>Open details</Button></div>
          </div>
        )}
      </Card>
    </div>
  )
}
