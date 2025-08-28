import React, { useEffect, useState } from 'react';
import { Button, Input, Textarea, Label, Dropdown, Option } from '@fluentui/react-components';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../utils/api';

export default function EventForm({ mode }){
  const nav = useNavigate();
  const { eventID } = useParams();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startAt, setStartAt] = useState('');
  const [location, setLocation] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [tags, setTags] = useState('');
  const [maxCapacity, setMaxCapacity] = useState('');
  const [cats, setCats] = useState([]);

  useEffect(() => { (async () => {
    const { data } = await api('/ems/categories?page=1&limit=100');
    setCats(data.items || []);
  })(); }, []);

  useEffect(() => { if(mode==='edit' && eventID){ (async () => {
    const { data } = await api(`/ems/events/${eventID}`);
    setTitle(data.title||''); setDescription(data.description||'');
    setStartAt((data.startAt||'').replace(' ', 'T')); setLocation(data.location||'');
    setCategoryId(String(data.categoryId||'')); setTags((data.tags||[]).join(', '));
    setMaxCapacity(data.maxCapacity ?? '');
  })(); } }, [mode, eventID]);

  async function save(){
    const body = {
      title, description, startAt: startAt ? startAt : null, location,
      categoryId: categoryId ? Number(categoryId) : null,
      tags: tags.split(',').map(t=>t.trim()).filter(Boolean),
      maxCapacity: maxCapacity === '' ? null : Number(maxCapacity)
    };
    if(mode==='create'){
      await api('/ems/events', { method: 'POST', body });
    } else {
      await api(`/ems/events/${eventID}`, { method: 'PUT', body });
    }
    nav('/ems/events');
  }

  return (
    <div className="pageWrap">
      <h2>{mode==='create' ? 'Novi događaj' : 'Izmeni događaj'}</h2>
      <div className="createCard createForm">
        <label><span>Naslov</span><Input value={title} onChange={(_,v)=>setTitle(v.value)} /></label>
        <label><span>Opis</span><Textarea value={description} onChange={(_,v)=>setDescription(v.value)} /></label>
        <div className="createTwoCols">
          <label><span>Datum i vreme</span><Input type="datetime-local" value={startAt} onChange={(_,v)=>setStartAt(v.value)} /></label>
          <label><span>Lokacija</span><Input value={location} onChange={(_,v)=>setLocation(v.value)} /></label>
        </div>
        <div className="createTwoCols">
          <label><span>Kategorija</span>
            <Dropdown value={categoryId} onOptionSelect={(_,d)=>setCategoryId(d.optionValue)}>
              {cats.map(c=>(<Option key={c.categoryID} value={String(c.categoryID)}>{c.categoryName}</Option>))}
            </Dropdown>
          </label>
          <label><span>Maks. kapacitet</span><Input type="number" value={maxCapacity} onChange={(_,v)=>setMaxCapacity(v.value)} /></label>
        </div>
        <label><span>Tagovi (zarezom)</span><Input value={tags} onChange={(_,v)=>setTags(v.value)} /></label>

        <Button appearance="primary" onClick={save}>{mode==='create'?'Kreiraj':'Sačuvaj'}</Button>
      </div>
    </div>
  );
}