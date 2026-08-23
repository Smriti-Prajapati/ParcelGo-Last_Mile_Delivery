import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter } from 'lucide-react'
import api from '../../lib/api'
import { type Order, type OrderStatus } from '../../types'
import { formatCurrency, formatDate } from '../../lib/utils'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const ALL_STATUSES: OrderStatus[] = [
  'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED'
]

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<OrderStatus | ''>('')

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data.data)).finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter((o) => {
    const matchSearch = !search
      || o.trackingId.toLowerCase().includes(search.toLowerCase())
      || o.customerName.toLowerCase().includes(search.toLowerCase())
      || (o.agentName?.toLowerCase().includes(search.toLowerCase()) ?? false)
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  if (loading) {
    return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Orders</h1>
        <span className="text-sm text-gray-500">{filtered.length} orders</span>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-8"
            placeholder="Search by ID, customer, agent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-auto"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as OrderStatus | '')}
        >
          <option value="">All statuses</option>
          {ALL_STATUSES.map((s) => (
            <option key={s} value={s}>{s.replace('_', ' ')}</option>
          ))}
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Customer</th>
                <th>Route</th>
                <th>Type</th>
                <th>Payment</th>
                <th>Agent</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/admin/orders/${order.id}`} className="font-medium text-brand-600 hover:underline">
                      {order.trackingId}
                    </Link>
                  </td>
                  <td>{order.customerName}</td>
                  <td className="text-xs text-gray-500">
                    {order.pickupZoneName} → {order.dropZoneName}
                  </td>
                  <td>
                    <span className={`badge ${order.orderType === 'B2B' ? 'bg-indigo-50 text-indigo-700' : 'bg-pink-50 text-pink-700'}`}>
                      {order.orderType}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${order.paymentType === 'COD' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                      {order.paymentType}
                    </span>
                  </td>
                  <td>{order.agentName ?? <span className="text-gray-400 text-xs">Unassigned</span>}</td>
                  <td className="font-medium">{formatCurrency(order.totalCharge)}</td>
                  <td><StatusBadge status={order.status} /></td>
                  <td className="text-xs text-gray-400">{formatDate(order.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <EmptyState title="No orders found" description="Try adjusting your search or filter" />
          )}
        </div>
      </div>
    </div>
  )
}
