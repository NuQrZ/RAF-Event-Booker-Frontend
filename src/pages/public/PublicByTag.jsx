import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Link, useParams } from 'react-router-dom';

export default function PublicByTag(){
  const { tag } = useParams();
  const [items, setItems] = useState([]);
  useEffect(()=>{ (async()=>{ const { data } = await api(`/public/events/by-tag/${encodeURIComponent(tag)}?page=1&limit=20`, { auth:false }); setItems(data.items || data); })(); }, [tag]);
  return (<div className="pageWrap"><h2>Događaji za tag: {tag}</h2><ul>{items.map(ev => <li key={ev.eventID}><Link to={`/public/events/${ev.eventID}`}>{ev.title}</Link></li>)}</ul></div>);
}