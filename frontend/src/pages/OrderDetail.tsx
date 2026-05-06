import { FormEvent, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';

export function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>();
  const [message, setMessage] = useState('');
  const load = () => api<any>(`/api/orders/${id}`).then(setOrder);
  useEffect(() => { load(); }, [id]);
  async function note(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const body = String(new FormData(event.currentTarget).get('body')); await api(`/api/orders/${id}/notes`, { method: 'POST', body: JSON.stringify({ body }) }); event.currentTarget.reset(); load(); }
  async function email() { const result = await api<any>(`/api/orders/${id}/email-update`, { method: 'POST', body: JSON.stringify({ message }) }); alert(result.response ?? 'Email sent'); }
  if (!order) return <section>Loading...</section>;
  return <section><h2>{order.customerName}</h2><p>{order.customerEmail} · {order.websitePackage} · <strong>{order.status}</strong></p><p>{order.description}</p><Link className="button" to={`/orders/${id}/edit`}>Edit order</Link><h3>Send customer update</h3><textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Email message" /><button onClick={email}>Send email update</button><h3>Internal notes</h3><form onSubmit={note}><textarea name="body" placeholder="Add internal note" /><button>Add note</button></form>{order.notes?.map((n: any) => <p className="note" key={n.id}>{n.body}<br /><small>{new Date(n.createdAt).toLocaleString()}</small></p>)}</section>;
}
