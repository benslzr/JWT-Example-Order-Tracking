import { FormEvent, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api/client';

const statuses = ['NEW', 'IN_PROGRESS', 'WAITING_ON_CUSTOMER', 'COMPLETED', 'CANCELLED'];

export function OrderForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<any>({ status: 'NEW' });
  useEffect(() => { if (id) api<any>(`/api/orders/${id}`).then(setOrder); }, [id]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const saved = await api<any>(id ? `/api/orders/${id}` : '/api/orders', { method: id ? 'PUT' : 'POST', body: JSON.stringify(data) });
    navigate(`/orders/${saved.id}`);
  }
  return <section><h2>{id ? 'Edit Order' : 'Create Order'}</h2><form onSubmit={submit} className="form"><input name="customerName" placeholder="Customer name" defaultValue={order.customerName} required /><input name="customerEmail" type="email" placeholder="Customer email" defaultValue={order.customerEmail} required /><input name="websitePackage" placeholder="Website package" defaultValue={order.websitePackage} required /><select name="status" defaultValue={order.status}>{statuses.map(s => <option key={s}>{s}</option>)}</select><textarea name="description" placeholder="Description" defaultValue={order.description} required /><button>Save order</button></form></section>;
}
