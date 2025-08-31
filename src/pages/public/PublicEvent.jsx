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

const normEvent = (e) =>
  !e
    ? null
    : {
      id: e.eventID ?? e.id,
      title: e.eventName ?? e.title ?? e.name ?? '(bez naslova)',
      description: e.eventDescription ?? e.description ?? '',
      startAt: e.startTime ?? e.startAt ?? '',
      location: e.eventLocation ?? e.location ?? '',
      categoryName: e.category?.categoryName ?? e.categoryName ?? '',
      likes: e.likes ?? 0,
      dislikes: e.dislikes ?? 0,
      tags: Array.isArray(e.tags) ? e.tags.map((t) => t?.tagName ?? t?.name ?? t) : [],
    };

export default function PublicEvent() {
  const { eventID } = useParams();

  const [ev, setEv] = useState(null);
  const [comments, setComments] = useState([]);

  const [name, setName] = useState('');
  const [text, setText] = useState('');

  const [email, setEmail] = useState('');

  const [hasRsvp, setHasRsvp] = useState(false);
  const [rsvpCount, setRsvpCount] = useState(0);

  const [err, setErr] = useState('');

  const headers = { VisitorId: getVisitorID() };

  const rsvpKey = (eid, em) => `rsvp:${String(eid)}:${(em || '').trim().toLowerCase()}`;

  async function load() {
    setErr('');
    try {
      const { data } = await api(`/public/events/${eventID}`, { auth: false, headers });
      setEv(normEvent(data));

      const cs = await api(`/public/events/${eventID}/comments?page=1&limit=20`, { auth: false });
      setComments(normItems(cs?.data));

      const cnt = await api(`/public/events/${eventID}/rsvp-count`, { auth: false });
      const n = Number(cnt?.data ?? 0);
      setRsvpCount(Number.isFinite(n) ? n : 0);
    } catch (e) {
      setErr(e?.message || 'Error loading.');
      setComments([]);
    }
  }

  useEffect(() => { load(); }, [eventID]);

  useEffect(() => {
    const flag = localStorage.getItem(rsvpKey(eventID, email));
    setHasRsvp(flag === '1');
  }, [eventID, email]);

  const like = async () => {
    await api(`/public/events/${eventID}/like`, { method: 'POST', auth: false, headers });
    await load();
  };
  const dislike = async () => {
    await api(`/public/events/${eventID}/dislike`, { method: 'POST', auth: false, headers });
    await load();
  };

  const rsvp = async () => {
    const em = email.trim();
    if (!em) {
      setErr('Unesi email za RSVP.');
      return;
    }
    setErr('');
    try {
      await api(`/public/events/${eventID}/rsvp`, {
        method: 'POST',
        auth: false,
        headers,
        body: { userEmail: em },
      });
      localStorage.setItem(rsvpKey(eventID, em), '1');
      setHasRsvp(true);

      try {
        const cnt = await api(`/public/events/${eventID}/rsvp-count`, { auth: false });
        const n = Number(cnt?.data ?? 0);
        setRsvpCount(Number.isFinite(n) ? n : 0);
      } catch { }
    } catch (e) {
      setErr(e?.message || 'RSVP failed.');
    }
  };

  const cancel = async () => {
    const em = email.trim();
    if (!em) {
      setErr('Enter email to cancel RSVP.');
      return;
    }
    setErr('');
    try {
      await api(`/public/events/${eventID}/rsvp?email=${encodeURIComponent(em)}`, {
        method: 'DELETE',
        auth: false,
        headers,
      });
      localStorage.removeItem(rsvpKey(eventID, em));
      setHasRsvp(false);

      try {
        const cnt = await api(`/public/events/${eventID}/rsvp-count`, { auth: false });
        const n = Number(cnt?.data ?? 0);
        setRsvpCount(Number.isFinite(n) ? n : 0);
      } catch { }
    } catch (e) {
      setErr(e?.message || 'Canceling RSVP failed.');
    }
  };

  const addComment = async () => {
    const n = name.trim();
    const t = text.trim();
    if (!n || !t) {
      setErr('Name and comment are required.');
      return;
    }
    setErr('');
    try {
      await api(`/public/events/${eventID}/comments`, {
        method: 'POST',
        auth: false,
        body: { authorName: n, content: t },
      });
      setName('');
      setText('');
      await load();
    } catch (e) {
      setErr(e?.message || 'Sending comment failed.');
    }
  };

  if (!ev)
    return (
      <div className="pe-shell">
        <div className="pe-card">Loading…</div>
      </div>
    );

  const date = ev.startAt ? new Date(ev.startAt).toLocaleString('sr-RS') : '';

  return (
    <div className="pe-shell">
      <h2 className="pe-title">{ev.title}</h2>

      {err && (
        <div className="pe-card" style={{ marginBottom: 12, borderColor: '#fecdca', background: '#fee4e2' }}>
          {err}
        </div>
      )}

      <div className="pe-card">
        <div className="pe-meta">
          {date && <span className="pe-pill">{date}</span>}
          {ev.location && <span className="pe-pill">{ev.location}</span>}
          {ev.categoryName && <span className="pe-pill pe-pill--cat">{ev.categoryName}</span>}
          {ev.tags?.length > 0 && (
            <span className="pe-pill" title={ev.tags.join(', ')}>
              #{ev.tags.join(' #')}
            </span>
          )}
        </div>

        {ev.description && <p className="pe-desc">{ev.description}</p>}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginTop: 12,
            flexWrap: 'wrap',
            fontFamily: '"Cascadia Mono", monospace',
          }}
        >
          <Button onClick={like} className="pe-btn">Like ({ev.likes})</Button>
          <Button onClick={dislike} className="pe-btn">Dislike ({ev.dislikes})</Button>

          <Input
            style={{ minWidth: 220, borderRadius: 10, height: 40 }}
            placeholder="email for RSVP"
            value={email}
            onChange={(_, v) => setEmail(v.value)}
          />

          <Button appearance="primary" onClick={rsvp} disabled={hasRsvp}>
            RSVP
          </Button>

          <Button appearance="secondary" onClick={cancel} disabled={!hasRsvp}>
            Cancel RSVP
          </Button>

          {hasRsvp && (
            <span style={{ color: '#b42318', fontSize: 14 }}>
              You have already RSVP&apos;d.
            </span>
          )}

          <span style={{ marginLeft: '20px', fontSize: 14 }}>
            Total reservations: <b>{rsvpCount}</b>
          </span>
        </div>
      </div>

      <h3 style={{ margin: '12px 0 8px' }}>Comments</h3>
      <div className="pe-card pe-comments-card">
        <div className="pe-form">
          <label>
            <span>Name</span>
            <Input value={name} onChange={(_, v) => setName(v.value)} />
          </label>
        </div>
        <div className="pe-form">
          <label style={{ width: '100%' }}>
            <span>Comment</span>
            <Textarea value={text} onChange={(_, v) => setText(v.value)} />
          </label>
        </div>
        <div className="pe-send">
          <Button className="pe-btn" appearance="primary" onClick={addComment}>
            Send
          </Button>
        </div>
      </div>

      {comments.length > 0 ? (
        <ul className="pe-comments">
          {comments.map((c) => {
            const author =
              ((c.commentAuthor ?? c.authorName ?? c.name ?? '').toString().trim()) || 'Anonimni';
            const body =
              (c.commentContent ?? c.text ?? c.commentText ?? c.body ?? c.message ?? c.content ?? c.comment ?? '').toString();

            return (
              <li key={c.commentID ?? c.id} className="pe-card pe-comment">
                <span className="pe-author">{author}</span>
                <div className="pe-text">{body || <i>— No text —</i>}</div>

                <div className="pe-comment-actions">
                  <Button onClick={() => api(`/public/events/${eventID}/comments/${c.commentID}`, { method: 'POST', auth: false })}
                    className="pe-btn">👍 {c.likeCount ?? 0}</Button>
                  <Button onClick={() => api(`/public/events/${eventID}/comments/${c.commentID}`, { method: 'POST', auth: false })}
                    className="pe-btn">👎 {c.dislikeCount ?? 0}</Button>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="pe-card" style={{ marginTop: 8 }}>
          No comments yet.
        </div>
      )}
    </div>
  );
}
