import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../utils/api'
import { Title2, Button, Input, Label, Dropdown, Option, Text, Card } from '@fluentui/react-components'
import '../styles/pages/CreateUser.css'

const roles = ['ADMIN', 'EVENT_CREATOR']
const statuses = ['ACTIVE', 'INACTIVE']

export default function CreateUser() {
  const nav = useNavigate()
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    userRole: 'EVENT_CREATOR',
    userStatus: 'ACTIVE'
  })
  const [err, setErr] = useState('')

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const { data } = await api('/users', { method: 'POST', body: form })
      const id = data.user_id
      nav(`/users/${id}`)
    } catch (e) {
      setErr(e.message)
    }
  }

  return (
    <div>
      <Title2>Create User</Title2>
      {err && <Text style={{ color: 'crimson' }}>{err}</Text>}

      <Card className="create-card">
        <form onSubmit={submit} className="create-form">
          <div className="form-section-title">Basic info</div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e,d)=>set('email', d.value)} required />
          </div>

          <div className="create-two-cols">
            <div>
              <Label>First name</Label>
              <Input value={form.firstName} onChange={(e,d)=>set('firstName', d.value)} required />
            </div>
            <div>
              <Label>Last name</Label>
              <Input value={form.lastName} onChange={(e,d)=>set('lastName', d.value)} required />
            </div>
          </div>

          <div className="form-section-title">Security</div>
          <div>
            <Label>Password</Label>
            <Input type="password" value={form.password} onChange={(e,d)=>set('password', d.value)} required />
          </div>

          <div className="form-section-title">Permissions</div>
          <div className="create-two-cols">
            <div>
              <Label>Role</Label>
              <Dropdown selectedOptions={[form.userRole]} onOptionSelect={(e,d)=>set('userRole', d.optionValue)}>
                {roles.map(r => <Option key={r} value={r}>{r}</Option>)}
              </Dropdown>
            </div>
            <div>
              <Label>Status</Label>
              <Dropdown selectedOptions={[form.userStatus]} onOptionSelect={(e,d)=>set('userStatus', d.optionValue)}>
                {statuses.map(s => <Option key={s} value={s}>{s}</Option>)}
              </Dropdown>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <Button appearance="primary" type="submit">Create</Button>
            <Button onClick={() => nav(-1)}>Cancel</Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
