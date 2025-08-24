// full updated file — see zip too
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../utils/api'
import {
  Title2,
  Text,
  Button,
  Dropdown,
  Option,
  Card,
  CardHeader,
  CardFooter,
  Badge
} from '@fluentui/react-components'
import '../styles/pages/UserDetails.css'

export default function UserDetails() {
  const { userID } = useParams()
  const nav = useNavigate()
  const [user, setUser] = useState(null)
  const [err, setErr] = useState('')
  const [status, setStatus] = useState('ACTIVE')

  const load = async () => {
    setErr('')
    try {
      const { data } = await api(`/users/${userID}`)
      setUser(data)
      setStatus(data.userStatus || 'ACTIVE')
    } catch (e) {
      setErr(e.message)
    }
  }

  useEffect(() => { load() }, [userID])

  const onDelete = async () => {
    if (!confirm('Delete this user?')) return
    await api(`/users/${userID}`, { method: 'DELETE' })
    nav('/users')
  }

  const onPatchStatus = async () => {
    try {
      await api(`/users/${userID}/status`, { method: 'PATCH', body: { userStatus: status } })
      await load()
    } catch (e) { alert(e.message) }
  }

  if (!user) return <Text>Loading...</Text>

  return (
    <div>
      <Title2>User #{user.userID}</Title2>
      {err && <Text style={{ color: 'crimson' }}>{err}</Text>}

      <Card className="details-card">
        <CardHeader
          header={
            <div className="details-header">
              <div className="person">
                <span className="name">{user.firstName} {user.lastName}</span>
                <span className="email mono">{user.email}</span>
              </div>
              <div className="badges">
                <Badge appearance="tint">{user.userRole}</Badge>
                <span className={`status-pill status-${user.userStatus}`}>{user.userStatus}</span>
              </div>
            </div>
          }
        />

        <div className="details-grid">
          <div className="details-row"><span className="label">User ID:  </span><span className="value mono">{user.userID}</span></div>
          <div className="details-row"><span className="label">First name:  </span><span className="value mono">{user.firstName}</span></div>
          <div className="details-row"><span className="label">Last name:  </span><span className="value mono">{user.lastName}</span></div>
          <div className="details-row"><span className="label">Role:  </span><span className="value mono">{user.userRole}</span></div>
          <div className="details-row"><span className="label">Status:  </span><span className="value mono">{user.userStatus}</span></div>
        </div>

        <CardFooter className="details-footer">
          <div className="left"><span className="muted">Quick actions</span></div>
          <div className="right">
            <Button onClick={() => nav(`/users/${user.userID}/edit`)}>Edit</Button>
            <Button appearance="primary" onClick={() => nav('/users')}>Back</Button>
            <Button appearance="secondary" onClick={onDelete}>Delete</Button>
          </div>
        </CardFooter>
      </Card>

      <div className="status-toolbar">
        <Text>Change status:</Text>
        <Dropdown selectedOptions={[status]} onOptionSelect={(e, d) => setStatus(d.optionValue)}>
          <Option value="ACTIVE">ACTIVE</Option>
          <Option value="INACTIVE">INACTIVE</Option>
        </Dropdown>
        <Button onClick={onPatchStatus}>Update</Button>
      </div>
    </div>
  )
}
