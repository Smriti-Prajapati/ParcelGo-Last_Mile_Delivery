import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import { type Order, type OrderStatus } from '../../types'
import { formatCurrency, formatDate } from '../../lib/utils'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AgentOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<OrderStatus | 'ACTIVE' | ''>('ACTIVE')

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data.data)).finally(() => setLoading(false))
  }, [])

  const filtered = orders.filter((o) => {
    if (!filter) return true
    if (filter === 'ACTIVE') return ['CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.status)
    return o.status === filter
  })

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">My Deliveries</h1>
        <span className="text-sm text-gray-500">{filtered.length} orders</span>
      </div>

      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'ACTIVE', label: 'Active' },
          { value: '', label: 'All' },
          { value: 'DELIVERED', label: 'Delivered' },
          { value: 'FAILED', label: 'Failed' },
        ].map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.value as any)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.value ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No orders in this category" />
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <Link
              key={order.id}
              to={`/agent/orders/${order.id}`}
              className="card p-4 flex items-center justify-between hover:border-brand-200 transition-colors block"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold">{order.trackingId}</p>
                  <StatusBadge status={order.status} />
                </div>
                <p className="text-xs text-gray-500">{order.pickupAddress}</p>
                <p className="text-xs text-gray-500">→ {order.dropAddress}</p>
                <p className="text-xs text-gray-400 mt-0.5">Customer: {order.customerName}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-brand-600">{formatCurrency(order.totalCharge)}</p>
                <p className="text-xs text-gray-400">{formatDate(order.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
