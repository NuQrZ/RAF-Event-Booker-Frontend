import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useParams } from 'react-router-dom';
import { getVisitorID } from '../../utils/visitor';
import { Button, Input, Textarea } from '@fluentui/react-components';
import '../../styles/pages/PublicEvent.css';

const normItems = (d) => {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  if (Array.isArray(d.items)) return d.items;
  if (Array.isArray(d.content)) return d.content;
  if (Array.isArray(d.results)) return d.results;
  if (Array.isArray(d.data)) return d.data;
  return [];
};

const normEvent = (e) => !e ? null : ({
  id: e.eventID ?? e.id,
  title: e.eventName ?? e.title ?? e.name ?? '(bez naslova)',
  description: e.eventDescription ?? e.description ?? '',
  startAt: e.startTime ?? e.startAt ?? '',
  location: e.eventLocation ?? e.location ?? '',
  categoryName: e.category?.categoryName ?? e.categoryName ?? '',
  likes: e.likes ?? 0,
  dislikes: e.dislikes ?? 0,
  tags: Array.isArray(e.tags) ? e.tags.map(t => t?.tagName ?? t?.name ?? t) : []
});

export default function PublicEvent() {
  const { eventID } = useParams();
  const [ev, setEv] = useState(null);
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [err, setErr] = useState('');

  const headers = { 'X-Visitor-Id': getVisitorId() };

  async function load() {
    setErr('');
    try {
      const { data } = await api(`/public/events/${eventID}`, { auth: false, headers });
      setEv(normEvent(data));
      const cs = await api(`/public/events/${eventID}/comments?page=1&limit=20`, { auth: false });
      setComments(normItems(cs?.data));
    } catch (e) {
      setErr(e?.message || 'Greška pri učitavanju.');
      setComments([]);
    }
  }
  useEffect(() => { load(); }, [eventID]);

  const like = async () => { await api(`/public/events/${eventID}/like`, { method: 'POST', auth: false, headers }); await load(); };
  const dislike = async () => { await api(`/public/events/${eventID}/dislike`, { method: 'POST', auth: false, headers }); await load(); };
  const rsvp = async () => { await api(`/public/events/${eventID}/rsvp`, { method: 'POST', auth: false, headers, body: {} }); await load(); };
  const cancel = async () => { await api(`/public/events/${eventID}/rsvp`, { method: 'DELETE', auth: false, headers }); await load(); };
  const addComment = async () => {
    if (!name.trim() || !text.trim()) return;
    await api(`/public/events/${eventID}/comments`, { method: 'POST', auth: false, headers, body: { authorName: name, text } });
    setName(''); setText(''); await load();
  };

  if (!ev) return <div className="pe-shell"><div className="pe-card">Loading…</div></div>;
  const date = ev.startAt ? new Date(ev.startAt).toLocaleString('sr-RS') : '';

  return (
    <div className="pe-shell">
      <h2 className="pe-title">{ev.title}</h2>
      {err && <div className="pe-card" style={{ marginBottom: 12, borderColor: '#fecdca', background: '#fee4e2' }}> {err} </div>}

      <div className="pe-card">
        <div className="pe-meta">
          {date && <span className="pe-pill">{date}</span>}
          {ev.location && <span className="pe-pill">{ev.location}</span>}
          {ev.categoryName && <span className="pe-pill pe-pill--cat">{ev.categoryName}</span>}
        </div>
        {ev.description && <p className="pe-desc">{ev.description}</p>}
        <div className="pe-actions">
          <Button className="pe-btn" onClick={like}>Like ({ev.likes})</Button>
          <Button className="pe-btn" onClick={dislike}>Dislike ({ev.dislikes})</Button>
          <Button className="pe-btn" appearance="primary" onClick={rsvp}>RSVP</Button>
          <Button className="pe-btn" appearance="secondary" onClick={cancel}>Cancel RSVP</Button>
        </div>
      </div>

      <h3 style={{ margin: '12px 0 8px' }}>Comments</h3>
      <div className="pe-card pe-comments-card">
        <div className="pe-form">
          <label><span>Name</span><Input value={name} onChange={(_, v) => setName(v.value)} /></label>
          <label><span>Comment</span><Textarea value={text} onChange={(_, v) => setText(v.value)} /></label>
        </div>
        <div className="pe-send">
          <Button className="pe-btn" appearance="primary" onClick={addComment}>Sen</Button>
        </div>
      </div>

      {comments.length > 0 ? (
        <ul className="pe-comments">
          {comments.map(c => {
            const author =
              ((c.authorName ?? c.name ?? '').trim()) || 'Anonimni';
            const text =
              (c.text ?? c.commentText ?? c.body ?? c.message ?? c.content ?? c.comment ?? '').toString();

            return (
              <li key={c.commentID ?? c.id} className="pe-card pe-comment">
                <span className="pe-author">{author}</span>
                <div className="pe-text">{text || <i>— No text —</i>}</div>
              </li>
            );
          })}

        </ul>
      ) : (
        <div className="pe-card" style={{ marginTop: 8 }}>No comments yet.</div>
      )}
    </div>
  );
}
