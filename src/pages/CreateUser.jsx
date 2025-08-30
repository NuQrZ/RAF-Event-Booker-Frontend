import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';
import {
  Title2,
  Button,
  Input,
  Combobox,
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
    userRole: roles[1],
    userStatus: statuses[0]
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

          <Divider className="softDivider" />

          <Field label="Password" required hint="Minimum 8 characters.">
            <Input
              type="password"
              value={form.password}
              onChange={(e, d) => set('password', d.value)}
              required
            />
          </Field>

          <div className="createTwoCols">
            <Field label="Role" required>
              <Combobox
                selectedOptions={[form.userRole]}
                value={form.userRole}
                displayValue={form.userRole}
                onChange={(e, data) => set('userRole', data.value ?? '')}
                onOptionSelect={(e, data) => set('userRole', data.optionValue ?? '')}
                placeholder="Select role"
              >
                {roles.map(r => <Option key={r} value={r}>{r}</Option>)}
              </Combobox>
            </Field>

            <Field label="Status" required>
              <Combobox
                selectedOptions={[form.userStatus]}
                value={form.userStatus}
                displayValue={form.userStatus}
                onChange={(e, data) => set('userStatus', data.value ?? '')}
                onOptionSelect={(e, data) => set('userStatus', data.optionValue ?? '')}
                placeholder="Select status"
              >
                {statuses.map(s => <Option key={s} value={s}>{s}</Option>)}
              </Combobox>
            </Field>
          </div>

          {err && <Text className="errorText">{err}</Text>}

          <div className="formActions">
            <Button className="primary-btn" icon={<Add24Regular />} appearance="primary" type="submit" disabled={saving}>
              {saving ? 'Creating…' : 'Create'}
            </Button>
            <Button className="ghost-btn" icon={<Dismiss24Regular />} onClick={() => nav(-1)}>
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
