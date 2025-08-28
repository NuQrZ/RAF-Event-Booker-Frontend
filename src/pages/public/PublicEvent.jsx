import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useParams } from 'react-router-dom';
import { getVisitorId } from '../../utils/visitor';
import { Button, Input, Textarea } from '@fluentui/react-components';

function h(){ return {'X-Visitor-Id': getVisitorId() }; }

export default function PublicEvent(){
  const { eventID } = useParams();
  const [ev, setEv] = useState(null);
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [text, setText] = useState('');

  async function load(){
    const { data } = await api(`/public/events/${eventID}`, { auth: false, headers: h() });
    setEv(data);
    const cs = await api(`/public/events/${eventID}/comments?page=1&limit=20`, { auth: false });
    setComments(cs.data.items || cs.data);
  }
  useEffect(()=>{ load(); }, [eventID]);

  async function like(){ await api(`/public/events/${eventID}/like`, { method:'POST', auth:false, headers:h() }); await load(); }
  async function dislike(){ await api(`/public/events/${eventID}/dislike`, { method:'POST', auth:false, headers:h() }); await load(); }

  async function rsvp(){ await api(`/public/events/${eventID}/rsvp`, { method:'POST', auth:false, headers:h(), body:{} }); await load(); }
  async function cancel(){ await api(`/public/events/${eventID}/rsvp`, { method:'DELETE', auth:false, headers:h() }); await load(); }

  async function addComment(){
    await api(`/public/events/${eventID}/comments`, { method:'POST', auth:false, body:{ authorName:name, text }, headers:h() });
    setName(''); setText(''); await load();
  }

  if(!ev) return <div>Učitavanje...</div>;
  return (
    <div className="pageWrap">
      <h2>{ev.title}</h2>
      <div className="createCard">
        <p><b>Vreme održavanja:</b> {ev.startAt}</p>
        <p><b>Lokacija:</b> {ev.location}</p>
        <p><b>Kategorija:</b> {ev.categoryName}</p>
        <p>{ev.description}</p>
        <div style={{display:'flex', gap:8}}>
          <Button onClick={like}>Like ({ev.likes||0})</Button>
          <Button onClick={dislike}>Dislike ({ev.dislikes||0})</Button>
          <Button appearance="primary" onClick={rsvp}>RSVP</Button>
          <Button appearance="secondary" onClick={cancel}>Otkaži RSVP</Button>
        </div>
      </div>

      <h3>Komentari</h3>
      <div className="createCard createForm">
        <div className="createTwoCols">
          <label><span>Ime</span><Input value={name} onChange={(_,v)=>setName(v.value)} /></label>
          <label><span>Komentar</span><Textarea value={text} onChange={(_,v)=>setText(v.value)} /></label>
        </div>
        <Button onClick={addComment}>Pošalji</Button>
      </div>

      <ul>
        {comments.map(c => (
          <li key={c.commentID} style={{marginBottom:8}}>
            <b>{c.authorName}</b> — {c.text}
          </li>
        ))}
      </ul>
    </div>
  );
}