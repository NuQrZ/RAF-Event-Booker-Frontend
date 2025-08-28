export function getVisitorId() {
  let id = localStorage.getItem('visitorId');
  if (!id) { id = crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`; localStorage.setItem('visitorId', id); }
  return id;
}