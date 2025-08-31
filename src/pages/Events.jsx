import React, { useEffect, useMemo, useState } from 'react';
import {
  Button, Input, Label,
  Combobox, Option,
  Table, TableHeader, TableRow, TableHeaderCell, TableBody, TableCell, Tooltip
} from '@fluentui/react-components';
import { Add24Regular, Save24Regular, Dismiss24Regular } from '@fluentui/react-icons';
import { api } from '../utils/api';
import { Link } from 'react-router-dom';
import '../styles/pages/Events.css';

export default function Events() {
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(1);
  const size = 10;

  const [categories, setCategories] = useState([]);
  const [catMap, setCatMap] = useState(new Map());
  const [error, setError] = useState('');

  const [categoryId, setCategoryId] = useState('');
  const [tag, setTag] = useState('');
  const [query, setQuery] = useState('');

  const [catInput, setCatInput] = useState('All');
  const [catSelected, setCatSelected] = useState('');
  const [open, setOpen] = useState(false);

  const normItems = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  };

  async function loadCategories() {
    try {
      setError('');
      const { data } = await api(`/public/categories?page=1&size=100`);
      const items = normItems(data);
      setCategories(items);

      const m = new Map(items.map(c => [
        Number(c.categoryID ?? c.id),
        String(c.categoryName ?? c.name ?? '')
      ]));
      setCatMap(m);

      if (categoryId) {
        const nm = m.get(Number(categoryId));
        if (nm) { setCatInput(nm); setCatSelected(String(categoryId)); }
      }
    } catch (e) {
      setError(e.message || 'Error loading categories.');
    }
  }

  async function loadList() {
    try {
      setError('');
      const isAllCats = !categoryId;
      let path = `/public/events?page=${page}&size=${size}`;
      if (!isAllCats) path = `/public/events/by-category/${categoryId}?page=${page}&size=${size}`;
      if (tag) path = `/public/events/by-tag/${encodeURIComponent(tag)}?page=${page}&size=${size}`;
      if (query && isAllCats && !tag)
        path = `/public/events?page=${page}&size=${size}&query=${encodeURIComponent(query)}`;

      const { data } = await api(path);
      setRows(normItems(data));
    } catch (e) {
      setRows([]);
      setError(e.message || 'Error loading events.');
    }
  }

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadList(); }, [page, categoryId, tag]);

  const applyFilters = () => { setPage(1); loadList(); };

  const catOptions = useMemo(() => ([
    { id: '', name: 'All' },
    ...categories.map(c => ({
      id: String(c.categoryID ?? c.id),
      name: String(c.categoryName ?? c.name ?? '')
    }))
  ]), [categories]);

  const onCatSelect = (_, data) => {
    const id = data?.optionValue ?? '';
    const text = data?.optionText ?? '';
    setCatSelected(id);
    setCatInput(text || (id ? String(catMap.get(Number(id)) || '') : 'All'));
    setCategoryId(id);
    setPage(1);
    setOpen(false);
  };

  const onCatChange = (_, data) => {
    setCatInput(data.value);
    if (catSelected) setCatSelected('')
    if (!data.value) {
      setCategoryId('');
    }
  };

  const onCatKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    const typed = catInput.trim().toLowerCase();
    if (!typed) { setCategoryId(''); setCatSelected(''); setCatInput('All'); setOpen(false); return; }
    const match = catOptions.find(o => o.name.toLowerCase() === typed);
    if (match) {
      setCatSelected(match.id);
      setCatInput(match.name);
      setCategoryId(match.id);
      setPage(1);
      setOpen(false);
    }
  };

  return (
    <div className="w11-pageShell">
      <header className="w11-titleRow">
        <h2 className="w11-title">Events</h2>

        <Link to="/ems/events/create">
          <Button appearance="primary" icon={<Add24Regular />} className="w11-btn w11-btnPrimary">
            New event
          </Button>
        </Link>
      </header>

      {error && <div className="w11-error">{error}</div>}

      <section className="w11-card">
        <div className="w11-toolbar">
          <div className="w11-field">
            <Label>Kategorija</Label>

            <Combobox
              className="w11-combobox"
              placeholder="Kategorija…"
              value={catInput}
              selectedOptions={[catSelected]}
              onChange={onCatChange}
              onOptionSelect={onCatSelect}
              onKeyDown={onCatKeyDown}
              expandIconPosition="end"
              open={open}
              onOpenChange={(_, d) => setOpen(!!d.open)}
              size="medium"
            >
              {catOptions.map(o => (
                <Option key={o.id} value={o.id} text={o.name}>
                  {o.name}
                </Option>
              ))}
            </Combobox>
          </div>

          <div className="w11-field">
            <Label>Tag</Label>
            <Input value={tag} onChange={(_, v) => setTag(v.value)} placeholder="e.g music" />
          </div>

          <div className="w11-field w11-grow">
            <Label>Search</Label>
            <Input value={query} onChange={(_, v) => setQuery(v.value)} placeholder="e.g title/description…" />
          </div>

          <div className="w11-actions">
            <Button
              appearance="primary"
              icon={<Save24Regular />}
              className="w11-btn w11-btnPrimary"
              onClick={applyFilters}
            >
              Apply filters
            </Button>
            <Button
              appearance="secondary"
              icon={<Dismiss24Regular />}
              className="w11-btn w11-btnSecondary"
              onClick={() => {
                setCategoryId('');
                setCatSelected('');
                setCatInput('All');
                setTag('');
                setQuery('');
                setPage(1);
                loadList();
              }}
            >
              Reset
            </Button>
          </div>
        </div>
      </section>

      <section className="w11-card">
        <div className="w11-tableWrap">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>Title</TableHeaderCell>
                <TableHeaderCell>Category</TableHeaderCell>
                <TableHeaderCell>Tags</TableHeaderCell>
                <TableHeaderCell>Time</TableHeaderCell>
                <TableHeaderCell>Location</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && !error && (
                <TableRow><TableCell colSpan={7} style={{ opacity: .7 }}>No data.</TableCell></TableRow>
              )}
              {rows.map(ev => {
                const id = ev.eventID ?? ev.id;
                const name = ev.eventName ?? ev.title ?? ev.name ?? '(no title)';
                const when = ev.startTime ?? ev.startAt ?? '';
                const loc = ev.eventLocation ?? ev.location ?? '';
                const catId = ev.categoryID ?? ev.categoryId ?? ev.category?.categoryID;
                const catName = (ev.category?.categoryName) || (catMap.get(Number(catId))) || ev.categoryName || '';
                const tagNames = (Array.isArray(ev.tags) ? ev.tags : [])
                  .map(t => t?.tagName ?? t?.name ?? t?.label).filter(Boolean);

                return (
                  <TableRow key={id ?? Math.random()}>
                    <TableCell>{id}</TableCell>
                    <TableCell>
                      {id ? <Link to={`/public/events/${id}`} target="_blank" rel="noreferrer">{name}</Link> : name}
                    </TableCell>
                    <TableCell>
                      {catName ? (
                        <Tooltip content={`ID: ${catId}`} relationship="label"><span>{catName}</span></Tooltip>
                      ) : (catId ?? '')}
                    </TableCell>
                    <TableCell>{tagNames.length ? tagNames.join(', ') : <span style={{ opacity: .6 }}>—</span>}</TableCell>
                    <TableCell>{when}</TableCell>
                    <TableCell>{loc}</TableCell>
                    <TableCell>
                      {id && (
                        <Link to={`/ems/events/${id}/edit`}>
                          <Button className="w11-btn w11-btnSecondary">Change</Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        <div className="w11-pager">
          <Button className="w11-btn w11-btnSecondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button className="w11-btn w11-btnSecondary" disabled={rows.length < size} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      </section>
    </div>
  );
}
