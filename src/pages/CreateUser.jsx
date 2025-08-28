import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import {
  Title2,
  Button,
  Input,
  Dropdown,
  Option,
  Text,
  Card,
  Field,
  Divider
} from '@fluentui/react-components';
import { Add24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import '../styles/pages/CreateUser.css';

const roles = ['ADMIN', 'EVENT_CREATOR'];
const statuses = ['ACTIVE', 'INACTIVE'];

export default function CreateUser() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    userRole: roles[1],     // default EVENT_CREATOR
    userStatus: statuses[0] // default ACTIVE
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const { data } = await api('/ems/users', { method: 'POST', body: form });
      nav(`/ems/users/${data.userID}`);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pageWrap">
      <Title2>Create user</Title2>
      <Card className="createCard">
        <form onSubmit={onSubmit} className="createForm">
          <div className="createTwoCols">
            <Field label="First name" required>
              <Input
                value={form.firstName}
                onChange={(e, d) => set('firstName', d.value)}
                required
              />
            </Field>
            <Field label="Last name" required>
              <Input
                value={form.lastName}
                onChange={(e, d) => set('lastName', d.value)}
                required
              />
            </Field>
          </div>

          <Field label="Email" required>
            <Input
              type="email"
              value={form.email}
              onChange={(e, d) => set('email', d.value)}
              required
            />
          </Field>

          <Divider />

          <Field label="Password" required>
            <Input
              type="password"
              value={form.password}
              onChange={(e, d) => set('password', d.value)}
              required
            />
          </Field>

          <div className="createTwoCols">
            <Field label="Role" required>
              <Dropdown
                selectedOptions={[form.userRole]}
                onOptionSelect={(e, d) =>
                  set('userRole', d.optionValue ?? form.userRole)
                }
              >
                {roles.map((r) => (
                  <Option key={r} value={r}>
                    {r}
                  </Option>
                ))}
              </Dropdown>
            </Field>

            <Field label="Status" required>
              <Dropdown
                selectedOptions={[form.userStatus]}
                onOptionSelect={(e, d) =>
                  set('userStatus', d.optionValue ?? form.userStatus)
                }
              >
                {statuses.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Dropdown>
            </Field>
          </div>

          {err && <Text className="errorText">{err}</Text>}

          <div className="formActions">
            <Button icon={<Add24Regular />} appearance="primary" type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create'}
            </Button>
            <Button icon={<Dismiss24Regular />} onClick={() => nav(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
