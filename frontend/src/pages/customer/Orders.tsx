import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { PlusCircle } from 'lucide-react'
import api from '../../lib/api'
import { type Order } from '../../types'
import { formatCurrency, formatDate } from '../../lib/utils'
import StatusBadge from '../../components/ui/StatusBadge'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function CustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
        <Link to="/dashboard/orders/new" className="btn-primary">
          <PlusCircle size={16} /> New Order
        </Link>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Place your first order to get started"
          action={<Link to="/dashboard/orders/new" className="btn-primary inline-flex">Place an order</Link>}
        />
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={`/dashboard/orders/${order.id}`}
              className="card p-4 flex items-center justify-between hover:border-brand-200 transition-colors block"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-gray-900">{order.trackingId}</p>
                  <StatusBadge status={order.status} />
                  {order.paymentType === 'COD' && (
                    <span className="badge bg-amber-50 text-amber-700">COD</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{order.pickupZoneName} → {order.dropZoneName}</p>
                {order.agentName && (
                  <p className="text-xs text-gray-400 mt-0.5">Agent: {order.agentName}</p>
                )}
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
              </div>
              <div className="text-right">
                <p className="text-base font-bold text-brand-600">{formatCurrency(order.totalCharge)}</p>
                <p className="text-xs text-gray-400">{order.orderType}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
