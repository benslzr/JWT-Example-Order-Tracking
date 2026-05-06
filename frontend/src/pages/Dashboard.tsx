import { useEffect, useState } from 'react';
import { api } from '../api/client';

export function Dashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  useEffect(() => { api<any[]>('/api/orders').then(setOrders).catch(() => setOrders([])); }, []);
  const counts = orders.reduce((acc, order) => ({ ...acc, [order.status]: (acc[order.status] ?? 0) + 1 }), {} as Record<string, number>);
  return <section><h2>Dashboard</h2><div className="stats">{Object.entries(counts).map(([status, count]) => <div className="stat" key={status}><strong>{count}</strong><span>{status}</span></div>)}</div></section>;
}
