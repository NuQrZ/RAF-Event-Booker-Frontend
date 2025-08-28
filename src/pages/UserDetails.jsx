import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';
import {
  Title2,
  Subtitle2,
  Text,
  Button,
  Dropdown,
  Option,
  Card,
  CardHeader,
  CardFooter,
  Avatar,
  Badge,
  Divider
} from '@fluentui/react-components';
import { ArrowLeft24Regular, Edit24Regular } from '@fluentui/react-icons';
import '../styles/pages/UserDetails.css';

const statusColor = (s) => (s === 'ACTIVE' ? 'success' : 'warning');

export default function UserDetails() {
  const { userID } = useParams();
  const nav = useNavigate();
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('ACTIVE');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api(`/ems/users/${userID}`);
        setUser(data);
        setStatus(data.userStatus);
      } catch (e) {
        setErr(String(e.message || e));
      }
    })();
  }, [userID]);

  const onPatchStatus = async () => {
    try {
      setSaving(true);
      await api(`/ems/users/${userID}/status`, {
        method: 'PATCH',
        body: { userStatus: status }
      });
      setUser((u) => ({ ...u, userStatus: status }));
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="pageWrap">
        <Title2>User details</Title2>
        <Text>Loading…</Text>
      </div>
    );
  }

  return (
    <div className="pageWrap">
      <div className="pageHeader">
        <Button
          className="ghost-btn"
          icon={<ArrowLeft24Regular />}
          appearance="secondary"
          onClick={() => nav(-1)}
        >
          Back
        </Button>
      </div>

      <Card className="detailsCard">
        <CardHeader
          header={
            <div className="detailsHead">
              <Avatar name={`${user.firstName} ${user.lastName}`} size={56} />
              <div className="headText">
                <Title2>
                  {user.firstName} {user.lastName}
                </Title2>
                <Subtitle2>{user.email}</Subtitle2>
              </div>
            </div>
          }
          description={
            <div className="headBadges">
              <Badge appearance="filled" color="brand">
                {user.userRole}
              </Badge>
              <Badge appearance="tint" color={statusColor(user.userStatus)}>
                {user.userStatus}
              </Badge>
            </div>
          }
          action={
            <Button
              className="primary-btn"
              style={{width: "130px"}}
              icon={<Edit24Regular />}
              appearance="primary"
              onClick={() => nav(`/ems/users/${user.userID}/edit`)}
            >
              Edit user
            </Button>
          }
        />

        <Divider className="detailsDivider" />

        <div className="detailsGrid">
          <Text weight="semibold">User ID</Text>
          <Text>{user.userID}</Text>

          <Text weight="semibold">First name</Text>
          <Text>{user.firstName}</Text>

          <Text weight="semibold">Last name</Text>
          <Text>{user.lastName}</Text>

          <Text weight="semibold">Email</Text>
          <Text>{user.email}</Text>

          <Text weight="semibold">Role</Text>
          <Text>{user.userRole}</Text>

          <Text weight="semibold">Status</Text>
          <Text>{user.userStatus}</Text>
        </div>

        {err && <Text className="errorText">{err}</Text>}

        <CardFooter>
          <div className="statusToolbar">
            <Text>Change status:</Text>
            <Dropdown
              selectedOptions={[status]}
              onOptionSelect={(e, d) => setStatus(d.optionValue)}
            >
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="INACTIVE">INACTIVE</Option>
            </Dropdown>
            <Button
              className="primary-btn"
              onClick={onPatchStatus}
              disabled={saving}
              appearance="primary"
            >
              {saving ? 'Updating…' : 'Update'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
