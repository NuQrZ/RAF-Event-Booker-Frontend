import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { Link } from "react-router-dom";
import "../../styles/pages/PublicLists.css";

function normItems(d) {
  if (Array.isArray(d)) return d;
  if (Array.isArray(d?.items)) return d.items;
  if (Array.isArray(d?.content)) return d.content;
  if (Array.isArray(d?.data)) return d.data;
  return [];
}

export default function PublicMostViewed() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api("/public/events/most-viewed?limit=10", { auth: false });
      setItems(normItems(data));
    })();
  }, []);

  return (
    <div className="pageWrap">
      <h2>Najposećeniji</h2>
      <ul>
        {items.length === 0 && <li className="empty">No events found.</li>}
        {items.map((ev) => {
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
