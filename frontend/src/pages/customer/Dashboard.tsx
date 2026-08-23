import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Truck, CheckCircle, XCircle, ArrowUpRight } from 'lucide-react'
import api from '../../lib/api'
import { type Order } from '../../types'
import { formatCurrency, formatDate } from '../../lib/utils'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuthContext } from '../../App'

export default function CustomerDashboard() {
  const { user } = useAuthContext()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/orders').then((r) => setOrders(r.data.data)).finally(() => setLoading(false))
  }, [])

  const active = orders.filter((o) => !['DELIVERED', 'FAILED'].includes(o.status))
  const delivered = orders.filter((o) => o.status === 'DELIVERED').length
  const failed = orders.filter((o) => o.status === 'FAILED').length

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{greeting}, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track and manage your shipments.</p>
      </div>

      {/* Stats */}
      <div className="card">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
          {[
            { label: 'Total Orders', value: orders.length,  icon: Package,     color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: 'Active',       value: active.length,  icon: Truck,       color: 'text-blue-500',   bg: 'bg-blue-50'   },
            { label: 'Delivered',    value: delivered,       icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-50'  },
            { label: 'Failed',       value: failed,          icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50'    },
          ].map((s) => (
            <div key={s.label} className="p-5 flex items-center gap-3">
              <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center flex-shrink-0`}>
                <s.icon size={20} className={s.color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promo banner */}
      <div
        className="card overflow-hidden border border-orange-200 flex items-center justify-between px-6 py-5"
        style={{ background: 'linear-gradient(135deg, #ffd9b0 0%, #ffbe80 100%)' }}
      >
        <div>
          <p className="text-lg font-bold text-gray-900 mb-1">Fast. Reliable. Everywhere.</p>
          <p className="text-sm text-gray-600 max-w-xs">We deliver your parcels safely to your loved ones.</p>
          <Link to="/dashboard/orders/new"
            className="inline-flex mt-3 px-5 py-2 bg-orange-500 text-white text-sm font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-sm">
            Place New Order
          </Link>
        </div>
        <img
          src="/delivery-man.png"
          alt="delivery"
          className="flex-shrink-0 hidden md:block h-32 w-auto object-contain"
          style={{ filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.15))' }}
        />
      </div>

      {/* Orders table */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">My Orders</h2>
          <Link to="/dashboard/orders" className="text-xs font-semibold text-orange-500 hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        {orders.length === 0 ? (
          <div className="py-14 text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-orange-50 flex items-center justify-center">
              <Package size={28} className="text-orange-300" />
            </div>
            <p className="text-sm font-medium text-gray-600">No orders yet</p>
            <p className="text-xs text-gray-400 mt-1">Use the New Order button in the top navigation</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Tracking ID</th>
                  <th>Route</th>
                  <th>Type</th>
                  <th>Payment</th>
                  <th>Agent</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id}>
                    <td>
                      <Link to={`/dashboard/orders/${o.id}`} className="font-semibold text-orange-500 hover:underline">
                        {o.trackingId}
                      </Link>
                    </td>
                    <td className="text-xs text-gray-500">{o.pickupZoneName} → {o.dropZoneName}</td>
                    <td><span className="badge bg-orange-50 text-orange-700">{o.orderType}</span></td>
                    <td>
                      <span className={`badge ${o.paymentType === 'COD' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                        {o.paymentType}
                      </span>
                    </td>
                    <td>{o.agentName ?? <span className="text-gray-400">—</span>}</td>
                    <td className="font-semibold">{formatCurrency(o.totalCharge)}</td>
                    <td><StatusBadge status={o.status} /></td>
                    <td className="text-xs text-gray-400">{formatDate(o.createdAt)}</td>
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
