import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => { api<any[]>('/api/orders').then(setOrders); }, []);
  return <section><h2>Customer Orders</h2><table><thead><tr><th>Customer</th><th>Package</th><th>Status</th><th>Updated</th></tr></thead><tbody>{orders.map(order => <tr key={order.id}><td><Link to={`/orders/${order.id}`}>{order.customerName}</Link><br /><small>{order.customerEmail}</small></td><td>{order.websitePackage}</td><td>{order.status}</td><td>{new Date(order.updatedAt).toLocaleString()}</td></tr>)}</tbody></table></section>;
}
