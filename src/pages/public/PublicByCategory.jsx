import React, { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { Link, useParams } from 'react-router-dom';

export default function PublicByCategory(){
  const { categoryID } = useParams();
  const [items, setItems] = useState([]);
  useEffect(()=>{ (async()=>{ const { data } = await api(`/public/events/by-category/${categoryID}?page=1&limit=20`, { auth:false }); setItems(data.items || data); })(); }, [categoryID]);
  return (<div className="pageWrap"><h2>Događaji u kategoriji {categoryID}</h2><ul>{items.map(ev => <li key={ev.eventID}><Link to={`/public/events/${ev.eventID}`}>{ev.title}</Link></li>)}</ul></div>);
}