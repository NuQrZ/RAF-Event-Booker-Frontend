import React, { useState } from 'react'
import { Button, Input, Label, Title2, Text, Card } from '@fluentui/react-components'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { Mail24Regular, LockClosed24Regular, Eye24Regular, EyeOff24Regular } from '@fluentui/react-icons'
import '../styles/pages/Login.css'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [err, setErr] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      await login(email, password)
      nav('/')
    } catch (e) {
      setErr(e.message || 'Login failed')
    }
  }

  return (
    <div className="login-page">
      <Card className="login-card">
        <header className="login-header">
          <Title2 className="login-title">Sign in</Title2>
        </header>

        {err && <div className="login-error">{err}</div>}

        <form onSubmit={onSubmit} className="login-form">
          <div className="field">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e, d) => setEmail(d.value)}
              required
              contentBefore={<Mail24Regular />}
              placeholder="Your email address"
            />
          </div>

          <div className="field">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={(e, d) => setPassword(d.value)}
              required
              contentBefore={<LockClosed24Regular />}
              contentAfter={
                <Button
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                  appearance="transparent"
                  onClick={(e) => { e.preventDefault(); setShowPw(v => !v) }}
                  icon={showPw ? <EyeOff24Regular /> : <Eye24Regular />}
                />
              }
              placeholder="Your password"
            />
          </div>

          <Button appearance="primary" type="submit" className="login-submit">Login</Button>
        </form>
      </Card>
    </div>
  )
}
