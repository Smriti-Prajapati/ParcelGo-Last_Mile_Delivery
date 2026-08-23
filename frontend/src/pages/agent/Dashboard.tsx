import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, CheckCircle, Truck, XCircle } from 'lucide-react'
import api from '../../lib/api'
import { type Order } from '../../types'
import { formatCurrency, formatDate } from '../../lib/utils'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuthContext } from '../../App'

export default function AgentDashboard() {
  const { user } = useAuthContext()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders').then((res) => setOrders(res.data.data)).finally(() => setLoading(false))
  }, [])

  const active = orders.filter((o) => ['CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(o.status))
  const delivered = orders.filter((o) => o.status === 'DELIVERED').length
  const failed = orders.filter((o) => o.status === 'FAILED').length

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500">Your assigned deliveries</p>
        </div>
      </div>

      {/* Track banner */}
      <div className="card overflow-hidden border border-orange-100 flex items-center justify-between px-6 py-4" style={{ background: 'linear-gradient(135deg, #ffe4cc 0%, #ffcc99 100%)' }}>
        <div>
          <p className="text-lg font-bold text-gray-900">Track. Deliver. Succeed.</p>
          <p className="text-sm text-gray-500 mt-0.5">Update your delivery status in real time.</p>
        </div>
        <img src="/track.png" alt="tracking" className="h-28 w-auto object-contain flex-shrink-0"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.15))' }} />
      </div>

      {/* Stats in one card */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
          {[
            { label: 'Total',     value: orders.length,  icon: Package,     color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Active',    value: active.length,  icon: Truck,       color: 'text-blue-500',   bg: 'bg-blue-50'   },
            { label: 'Delivered', value: delivered,       icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-50'  },
            { label: 'Failed',    value: failed,          icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50'    },
          ].map((s) => (
            <div key={s.label} className="p-5 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon size={18} className={s.color} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active orders */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-800">Active Orders</h2>
        </div>
        {active.length === 0 ? (
          <div className="py-12 text-center text-sm text-gray-400">No active orders assigned to you</div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Customer</th>
                  <th>Pickup</th>
                  <th>Drop</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {active.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <Link to={`/agent/orders/${order.id}`} className="font-semibold text-orange-500 hover:underline">
                        {order.trackingId}
                      </Link>
                    </td>
                    <td className="font-medium">{order.customerName}</td>
                    <td className="text-xs text-gray-500">{order.pickupAddress}</td>
                    <td className="text-xs text-gray-500">{order.dropAddress}</td>
                    <td className="font-semibold">{formatCurrency(order.totalCharge)}</td>
                    <td>
                      <span className={`badge ${order.paymentType === 'COD' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                        {order.paymentType}
                      </span>
                    </td>
                    <td><StatusBadge status={order.status} /></td>
                    <td className="text-xs text-gray-400">{formatDate(order.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

