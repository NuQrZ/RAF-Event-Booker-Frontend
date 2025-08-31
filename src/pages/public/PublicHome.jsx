import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../utils/api';
import { Link, useNavigate } from 'react-router-dom';
import { Combobox, Option, Input } from '@fluentui/react-components';
import '../../styles/pages/Public.css';

function normItems(d) {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.results)) return d.results;
  if (Array.isArray(d?.data)) return d.data;
  return [];
}

function EventCard({ ev }) {
  const eventID = ev.eventID ?? ev.id;
  const title = ev.eventName ?? ev.title ?? ev.name ?? '(bez naslova)';
  const startAt = ev.startTime ?? ev.startAt ?? '';
  const date = startAt ? new Date(startAt).toLocaleString('sr-RS') : '';
  const category = ev.category?.categoryName ?? ev.categoryName ?? '';
  const tags = (Array.isArray(ev.tags) ? ev.tags : [])
    .map(t => t?.tagName ?? t?.name ?? t)
    .filter(Boolean);

  return (
    <article className="pub-card">
      <h3 className="pub-card__title">
        {eventID ? (
          <Link className="pub-link" to={`/public/events/${eventID}`}>{title}</Link>
        ) : title}
      </h3>

      <div className="pub-card__meta">
        {category && <span className="pill pill-role">{category}</span>}
        {date && <span className="pill">{date}</span>}
      </div>

      {tags.length > 0 && (
        <div className="pub-card__tags">
          {tags.map((t, i) => (
            <Link key={i} to={`/public/events/by-tag/${encodeURIComponent(t)}`} className="tag-link">
              #{t}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}

export default function PublicHome() {
  const nav = useNavigate();

  const [items, setItems] = useState([]);
  const [loading, setLoad] = useState(true);
  const [error, setError] = useState('');

  const [categories, setCategories] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catsError, setCatsError] = useState('');

  const [catInput, setCatInput] = useState('');
  const [catSelected, setCatSelected] = useState('');
  const [open, setOpen] = useState(false);

  const [tag, setTag] = useState('');

  useEffect(() => {
    (async () => {
      try {
        setLoad(true); setError('');
        const res = await api('/public/events/latest?page=1&limit=10', { auth: false });
        setItems(normItems(res?.data));
      } catch (e) {
        setItems([]);
        setError(e?.message || 'Error loading events.');
      } finally {
        setLoad(false);
      }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setCatsLoading(true); setCatsError('');
        const k1 = await api(`/public/categories`);
        const list1 = normItems(k1?.data)
          .map(c => ({
            id: String(c.categoryID ?? c.id),
            name: String(c.categoryName ?? c.name ?? '')
          }))
          .filter(c => c.id && c.name);
        setCategories(list1);
      } catch (e) {
        setCategories([]);
        setCatsError('Error loading categories.');
      } finally {
        setCatsLoading(false);
      }
    })();
  }, []);

  const goToTag = () => {
    const t = tag.trim();
    if (!t) return;
    nav(`/public/events/by-tag/${encodeURIComponent(t)}`);
  };

  const onCatSelect = (_, data) => {
    const id = data?.optionValue ?? '';
    const text = data?.optionText ?? '';
    if (text) setCatInput(text);
    if (id) {
      setCatSelected(id);
      nav(`/public/events/by-category/${id}`);
      setOpen(false);
    }
  };

  const onCatChange = (_, data) => {
    setCatInput(data.value);
    if (catSelected) setCatSelected('');
  };

  const onCatEnter = (e) => {
    if (e.key !== 'Enter') return;
    const typed = catInput.trim().toLowerCase();
    if (!typed) return;
    const match = categories.find(c => c.name.toLowerCase() === typed);
    if (match?.id) {
      setCatSelected(match.id);
      nav(`/public/events/by-category/${match.id}`);
      setOpen(false);
    }
  };

  const catOptions = useMemo(() => categories, [categories]);

  return (
    <div className="publicPage">
      <h2 className="publicTitle">Most recent events</h2>

      <div className="publicActions">
        <Link className="pub-btn" to="/public/events">Most recent</Link>
        <Link className="pub-btn" to="/public/events/most-viewed">Most viewed</Link>
        <Link className="pub-btn" to="/public/events/most-reacted">Most reacted</Link>

        <div className="pub-actions__group">
          <Input
            className="pub-input"
            placeholder="tag…"
            value={tag}
            onChange={(_, v) => setTag(v.value)}
            onKeyDown={(e) => e.key === 'Enter' && goToTag()}
          />
          <button className="pub-btn" onClick={goToTag}>Go</button>
        </div>

        <div style={{ minWidth: 240 }}>
          <Combobox
            className="pub-combobox"
            size="medium"
            placeholder={catsLoading ? 'Loading categories…' : (catsError || 'Category…')}
            value={catInput}
            selectedOptions={catSelected ? [catSelected] : []}
            onChange={onCatChange}
            onOptionSelect={onCatSelect}
            onKeyDown={onCatEnter}
            expandIconPosition="end"
            freeform
            disabled={catsLoading || !!catsError}
            open={open}
            onOpenChange={(_, d) => setOpen(!!d.open)}
          >
            {catOptions.map((c) => (
              <Option key={c.id} text={c.name} value={c.id}>
                {c.name}
              </Option>
            ))}
          </Combobox>
        </div>
      </div>

      {loading && <div className="publicInfo">Loading…</div>}
      {error && <div className="publicError">{error}</div>}
      {!loading && !error && items.length === 0 && (
        <div className="publicInfo">No events currently.</div>
      )}

      <div className="publicGrid">
        {items.map(ev => (
          <EventCard key={ev.eventID ?? ev.id ?? Math.random()} ev={ev} />
        ))}
      </div>
    </div>
  );
}
