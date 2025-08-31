import React, { useEffect, useState } from "react";
import { api } from '../../utils/api';
import { Link, useParams } from 'react-router-dom';
import "../../styles/pages/PublicLists.css";

function normItems(d) {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
}

export default function PublicByCategory() {
  const { categoryID } = useParams();
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api(`/public/events/by-category/${categoryID}?page=1&size=20`, { auth: false });
      setItems(normItems(data));
    })();
  }, [categoryID]);

  return (
    <div className="pageWrap">
      <h2>Events by category {categoryID}</h2>
      <ul>
        {items.length === 0 && <li className="empty">No events found.</li>}
        {items.map(ev => {
          const id = ev.eventID ?? ev.id;
          const title = ev.eventName ?? ev.title ?? ev.name ?? '(no title)';
          return (
            <li key={id}>
              {id ? <Link to={`/public/events/${id}`}>{title}</Link> : title}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
