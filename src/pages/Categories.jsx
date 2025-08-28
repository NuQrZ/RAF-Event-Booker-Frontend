import React, { useEffect, useState } from 'react';
import { Button, Input, Label, Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell } from '@fluentui/react-components';
import { useNavigate } from 'react-router-dom';
import { api } from '../utils/api';

export default function Categories() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const limit = 10;

  async function load() {
    const { data } = await api(`/ems/categories?page=${page}&limit=${limit}`);
    setRows(data.items || data.data || data.content || data.results || []);
    setTotal(data.total || data.totalItems || 0);
  }
  useEffect(() => { load(); }, [page]);

  async function create() {
    if (!name || !desc) return;
    await api('/ems/categories', { method: 'POST', body: { categoryName: name, categoryDescription: desc } });
    setName(''); setDesc(''); await load();
  }

  async function update(c) {
    await api(`/ems/categories/${c.categoryID}`, { method: 'PUT', body: { categoryName: c.categoryName, categoryDescription: c.categoryDescription } });
    await load();
  }

  async function remove(id) {
    await api(`/ems/categories/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="pageWrap">
      <h2>Kategorije</h2>

      <div className="createCard">
        <div className="createForm">
          <div className="createTwoCols">
            <label>
              <span>Naziv</span>
              <Input value={name} onChange={(_,v)=>setName(v.value)} />
            </label>
            <label>
              <span>Opis</span>
              <Input value={desc} onChange={(_,v)=>setDesc(v.value)} />
            </label>
          </div>
          <Button appearance="primary" onClick={create}>Dodaj kategoriju</Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>ID</TableHeaderCell>
            <TableHeaderCell>Naziv</TableHeaderCell>
            <TableHeaderCell>Opis</TableHeaderCell>
            <TableHeaderCell>Akcije</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((c) => (
            <TableRow key={c.categoryID}>
              <TableCell>{c.categoryID}</TableCell>
              <TableCell>
                <Input value={c.categoryName} onChange={(_,v)=>{c.categoryName=v.value; setRows([...rows]);}} />
              </TableCell>
              <TableCell>
                <Input value={c.categoryDescription} onChange={(_,v)=>{c.categoryDescription=v.value; setRows([...rows]);}} />
              </TableCell>
              <TableCell>
                <Button onClick={()=>update(c)}>Sačuvaj</Button>
                <Button appearance="secondary" onClick={()=>remove(c.categoryID)} style={{marginLeft:8}}>Obriši</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div style={{marginTop:12, display:'flex', gap:8}}>
        <Button disabled={page<=1} onClick={()=>setPage(p=>p-1)}>Prethodna</Button>
        <Button disabled={rows.length<limit} onClick={()=>setPage(p=>p+1)}>Sledeća</Button>
      </div>
    </div>
  );
}