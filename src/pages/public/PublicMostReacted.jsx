import React, { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { Link } from "react-router-dom";

export default function PublicMostReacted() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    (async () => {
      const { data } = await api(
        "/public/events/most-reacted?page=1&limit=10",
        { auth: false }
      );
      setItems(data.items || data);
    })();
  }, []);

  return (
    <div className="pageWrap">
      <h2>Najviše reakcija</h2>
      <ul>
        {items.map((ev) => (
          <li key={ev.eventID}>
            <Link to={`/public/events/${ev.eventID}`}>{ev.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
