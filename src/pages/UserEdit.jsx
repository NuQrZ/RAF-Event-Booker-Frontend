import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'
import { Title2, Button, Input, Label, Dropdown, Option, Text } from '@fluentui/react-components'
import '../styles/pages/UserEdit.css'

const roles = ['ADMIN', 'EVENT_CREATOR']
const statuses = ['ACTIVE', 'INACTIVE']

export default function UserEdit() {
  const { userID } = useParams()
  const nav = useNavigate()
  const [form, setForm] = useState(null)
  const [err, setErr] = useState('')

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }))

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api(`/users/${userID}`)
        setForm({ email: data.email, firstName: data.firstName, lastName: data.lastName, password: '', userRole: data.userRole, userStatus: data.userStatus })
      } catch (e) { setErr(e.message) }
    })()
  }, [userID])

  const submit = async (e) => {
    e.preventDefault()
    setErr('')
    try {
      const body = { ...form }
      if (!body.password) delete body.password
      await api(`/users/${userID}`, { method: 'PUT', body })
      nav(`/users/${userID}`)
    } catch (e) { setErr(e.message) }
  }

  if (!form) return <Text>Loading...</Text>

  return (
    <div>
      <Title2>Edit User</Title2>
      {err && <Text style={{ color: 'crimson' }}>{err}</Text>}
      <form className="edit-form" onSubmit={submit}>
        <div>
          <Label>Email</Label>
          <Input type="email" value={form.email} onChange={(e,d)=>set('email', d.value)} required/>
        </div>
        <div className="edit-two-cols">
          <div><Label>First name</Label><Input value={form.firstName} onChange={(e,d)=>set('firstName', d.value)} required/></div>
          <div><Label>Last name</Label><Input value={form.lastName} onChange={(e,d)=>set('lastName', d.value)} required/></div>
        </div>
        <div>
          <Label>New password (optional)</Label>
          <Input type="password" value={form.password} onChange={(e,d)=>set('password', d.value)} placeholder="Leave blank to keep unchanged"/>
        </div>
        <div className="edit-two-cols">
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
          <Button appearance="primary" type="submit">Save</Button>
          <Button onClick={() => nav(-1)}>Cancel</Button>
        </div>
      </form>
    </div>
  )
}
