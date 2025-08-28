import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { Save24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import '../styles/pages/UserEdit.css';

/* Include USER since backend may return it; prevents blank selection */
const roles = ['ADMIN', 'EVENT_CREATOR', 'USER'];
const statuses = ['ACTIVE', 'INACTIVE'];

export default function UserEdit() {
  const { userID } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(null);
  const [err, setErr] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api(`/ems/users/${userID}`);
        setForm({
          email: data.email ?? '',
          firstName: data.firstName ?? '',
          lastName: data.lastName ?? '',
          password: '',
          userRole: data.userRole ?? 'ADMIN',   // must be a valid option
          userStatus: data.userStatus ?? 'ACTIVE',
        });
      } catch (e) {
        setErr(String(e.message || e));
      }
    })();
  }, [userID]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const body = { ...form };
      if (!body.password) delete body.password;
      await api(`/ems/users/${userID}`, { method: 'PUT', body });
      nav(`/ems/users/${userID}`);
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return (
      <div className="pageWrap">
        <Title2>Edit user</Title2>
        <Text>Loading…</Text>
      </div>
    );
  }

  return (
    <div className="pageWrap">
      <Title2>Edit user</Title2>
      <Card className="editCard">
        <form onSubmit={onSubmit} className="editForm">
          <div className="editTwoCols">
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

          <Field
            label="New password (optional)"
            hint="Leave blank to keep the current password."
          >
            <Input
              type="password"
              value={form.password}
              onChange={(e, d) => set('password', d.value)}
            />
          </Field>

          <div className="editTwoCols">
            <Field label="Role" required>
              <Dropdown
                multiselect={false}
                selectedOptions={[form.userRole]}
                onOptionSelect={(e, d) => {
                  const next = d.selectedOptions?.[0] ?? form.userRole;
                  set('userRole', next);
                }}
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
                multiselect={false}
                selectedOptions={[form.userStatus]}
                onOptionSelect={(e, d) => {
                  const next = d.selectedOptions?.[0] ?? form.userStatus;
                  set('userStatus', next);
                }}
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
            <Button icon={<Save24Regular />} appearance="primary" type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save changes'}
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
