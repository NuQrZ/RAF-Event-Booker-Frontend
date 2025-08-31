import React, { useEffect, useState } from 'react';
import {
  Button,
  Table,
  TableHeader,
  TableRow,
  TableCell,
  TableBody,
  TableHeaderCell,
  Title2,
  Text
} from '@fluentui/react-components';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import '../styles/pages/UsersList.css';

export default function UsersList() {
  const nav = useNavigate();
  const { profile } = useAuth();
  const [params, setParams] = useSearchParams();
  const pageParam = Number(params.get('page') || 0);
  const sizeParam = Number(params.get('size') || 10);
  const [page, setPage] = useState({
    content: [],
    pageNumber: 0,
    pageSize: sizeParam,
    totalElements: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  const load = async (pg = pageParam, sz = sizeParam) => {
    setLoading(true);
    setErr('');
    try {
      const { data } = await api(`/ems/users?page=${pg}&size=${sz}`);
      setPage(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [params.toString()]);

  const onPageChange = (next) => {
    params.set('page', String(next));
    params.set('size', String(sizeParam));
    setParams(params, { replace: true });
  };

  return (
    <div>
      <div className="users-header-actions">
        <Title2>Users</Title2>
        {profile?.role === 'ADMIN' && (
          <Button appearance="primary" onClick={() => nav('/ems/users/create')}>
            Create
          </Button>
        )}
      </div>

      {err && <Text style={{ color: 'crimson' }}>{err}</Text>}
      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <div className="full-width-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell style={{ width: '50px' }}>ID</TableHeaderCell>
                <TableHeaderCell style={{ width: '300px' }}>Email</TableHeaderCell>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Role</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {page.content.map((u) => (
                <TableRow key={u.userID}>
                  <TableCell>{u.userID}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {u.firstName} {u.lastName}
                  </TableCell>
                  <TableCell>{u.userRole}</TableCell>
                  <TableCell>
                    <span className={`status-pill status-${u.userStatus}`}>{u.userStatus}</span>
                  </TableCell>
                  <TableCell>
                    <div className="users-table-actions">
                      <Button size="small" onClick={() => nav(`/ems/users/${u.userID}`)}>
                        Details
                      </Button>
                      <Button size="small" onClick={() => nav(`/ems/users/${u.userID}/edit`)}>
                        Edit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="pager">
        <Button
          className="pager-btn"
          disabled={page.pageNumber <= 0}
          onClick={() => onPageChange(page.pageNumber - 1)}
        >
          Previous
        </Button>

        <Text className="pager-info">
          Page {page.pageNumber + 1} / {page.totalPages || 1}
        </Text>

        <Button
          className="pager-btn"
          disabled={page.pageNumber + 1 >= page.totalPages}
          onClick={() => onPageChange(page.pageNumber + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
