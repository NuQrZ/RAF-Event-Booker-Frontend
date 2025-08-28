import React, { useEffect, useState } from 'react';
import {
  Button, Input, Label, Dropdown, Option,
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, Tooltip
} from '@fluentui/react-components';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';

export default function Events() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const size = 10;

  const [categories, setCategories] = useState([]);
  const [catMap, setCatMap] = useState(new Map());     // categoryID -> categoryName
  const [error, setError] = useState('');

  // "" znači: prikaz svih kategorija
  const [categoryId, setCategoryId] = useState('');
  const [tag, setTag] = useState('');
  const [query, setQuery] = useState('');

  const normItems = (data) => {
    if (Array.isArray(data)) return data;
    if (data?.items && Array.isArray(data.items)) return data.items;
    if (data?.content && Array.isArray(data.content)) return data.content;
    if (data?.results && Array.isArray(data.results)) return data.results;
    if (data?.data && Array.isArray(data.data)) return data.data;
    return [];
  };

  async function loadCategories() {
    try {
      setError('');
      const { data } = await api(`/ems/categories?page=1&size=100`);
      const items = normItems(data);
      setCategories(items);
      const m = new Map(items.map(c => [Number(c.categoryID ?? c.id), c.categoryName ?? c.name]));
      setCatMap(m);
    } catch (e) {
      setError(e.message || 'Greška pri učitavanju kategorija.');
    }
  }

  async function loadList() {
    try {
      setError('');
      const isAllCats = !categoryId; // "" => sve kategorije

      // podrazumevano: sve događaje
      let path = `/ems/events?page=${page}&size=${size}`;

      // ako je izabrana konkretna kategorija → filtriraj po kategoriji
      if (!isAllCats) {
        path = `/ems/events/by-category/${categoryId}?page=${page}&size=${size}`;
      }

      // tag ima prioritet nad kategorijom
      if (tag) {
        path = `/ems/events/by-tag/${encodeURIComponent(tag)}?page=${page}&size=${size}`;
      }

      // pretraga kroz SVE kategorije (samo ako je “Sve” i nema tag filtera)
      if (query && isAllCats && !tag) {
        path = `/ems/events?page=${page}&size=${size}&query=${encodeURIComponent(query)}`;
      }

      const { data } = await api(path); // EMS poziv (auth)
      const items = normItems(data);
      setRows(items);
    } catch (e) {
      setRows([]);
      setError(e.message || 'Greška pri učitavanju događaja.');
    }
  }

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadList(); }, [page, categoryId, tag]);

  const applyFilters = () => { setPage(1); loadList(); };

  return (
    <div className="pageWrap">
      <h2>Događaji</h2>

      {error && (
        <div style={{background:'#ffecec', border:'1px solid #f5a9a9', padding:12, borderRadius:8, marginBottom:12}}>
          {error}
        </div>
      )}

      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:16, flexWrap:'wrap'}}>
        <Label>Kategorija:</Label>
        <Dropdown
          placeholder="Sve kategorije"
          selectedOptions={[categoryId]}
          onOptionSelect={(_, d) => { setCategoryId(d.optionValue ?? ''); setPage(1); }}
        >
          <Option value="">Sve</Option>
          {categories.map(c => (
            <Option key={c.categoryID ?? c.id} value={String(c.categoryID ?? c.id)}>
              {c.categoryName ?? c.name}
            </Option>
          ))}
        </Dropdown>

        <Label>Tag:</Label>
        <Input value={tag} onChange={(_, v) => setTag(v.value)} placeholder="npr. muzika" style={{minWidth:180}} />

        <Label>Pretraga:</Label>
        <Input value={query} onChange={(_, v) => setQuery(v.value)} placeholder="naslov/opis…" style={{minWidth:200}} />

        <Button onClick={applyFilters}>Filtriraj</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHeaderCell>ID</TableHeaderCell>
            <TableHeaderCell>Naslov</TableHeaderCell>
            <TableHeaderCell>Kategorija</TableHeaderCell>
            <TableHeaderCell>Tagovi</TableHeaderCell>
            <TableHeaderCell>Vreme</TableHeaderCell>
            <TableHeaderCell>Lokacija</TableHeaderCell>
            <TableHeaderCell>Akcije</TableHeaderCell>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 && !error && (
            <TableRow>
              <TableCell colSpan={7} style={{opacity:.7}}>Nema podataka za prikaz.</TableCell>
            </TableRow>
          )}

          {rows.map(ev => {
            const id   = ev.eventID ?? ev.id;
            const name = ev.eventName ?? ev.title ?? ev.name ?? '(bez naslova)';
            const when = ev.startTime ?? ev.startAt ?? '';
            const loc  = ev.eventLocation ?? ev.location ?? '';
            const catId = ev.categoryID ?? ev.categoryId ?? ev.category?.categoryID;
            const catName = (ev.category?.categoryName) || (catMap.get(Number(catId))) || ev.categoryName || '';

            // Tagovi su List<Tag> (objekti) → prikaži imena
            const tagNames = (Array.isArray(ev.tags) ? ev.tags : [])
              .map(t => t?.tagName ?? t?.name ?? t?.label)
              .filter(Boolean);

            return (
              <TableRow key={id ?? Math.random()}>
                <TableCell>{id}</TableCell>
                <TableCell>
                  {id ? (
                    <Link to={`/public/events/${id}`} target="_blank" rel="noreferrer">{name}</Link>
                  ) : name}
                </TableCell>
                <TableCell>
                  {catName ? (
                    <Tooltip content={`ID: ${catId}`} relationship="label">
                      <span>{catName}</span>
                    </Tooltip>
                  ) : (catId ?? '')}
                </TableCell>
                <TableCell>
                  {tagNames.length ? tagNames.join(', ') : <span style={{opacity:.6}}>—</span>}
                </TableCell>
                <TableCell>{when}</TableCell>
                <TableCell>{loc}</TableCell>
                <TableCell>
                  {id && <Link to={`/ems/events/${id}/edit`}><Button>Izmeni</Button></Link>}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      <div style={{marginTop:12, display:'flex', gap:8}}>
        <Button disabled={page<=1} onClick={() => setPage(p => p-1)}>Prethodna</Button>
        <Button disabled={rows.length < size} onClick={() => setPage(p => p+1)}>Sledeća</Button>
      </div>
    </div>
  );
}
