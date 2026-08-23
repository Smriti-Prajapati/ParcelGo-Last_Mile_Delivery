import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Package, Truck, CheckCircle, XCircle, Clock, IndianRupee, Users, ArrowUpRight, TrendingUp } from 'lucide-react'
import api from '../../lib/api'
import { type DashboardStats, type Order } from '../../types'
import { formatCurrency, formatDate } from '../../lib/utils'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuthContext } from '../../App'

export default function AdminDashboard() {
  const { user } = useAuthContext()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/admin/dashboard'), api.get('/orders')])
      .then(([s, o]) => { setStats(s.data.data); setRecentOrders(o.data.data.slice(0, 8)) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{greeting}, {user?.name?.split(' ')[0]}</h1>
        <p className="text-sm text-gray-500 mt-0.5">Here's what's happening with your deliveries today.</p>
      </div>

      {stats && (
        <>
          <div className="card">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
              {[
                { label: 'Total Orders',     value: stats.totalOrders,    icon: Package,      color: 'text-orange-500', bg: 'bg-orange-50' },
                { label: 'In Transit',       value: stats.inTransit,      icon: Truck,        color: 'text-blue-500',   bg: 'bg-blue-50'   },
                { label: 'Delivered',        value: stats.delivered,       icon: CheckCircle, color: 'text-green-500',  bg: 'bg-green-50'  },
                { label: 'Failed',           value: stats.failed,          icon: XCircle,     color: 'text-red-500',    bg: 'bg-red-50'    },
                { label: 'Confirmed',        value: stats.confirmed,       icon: Clock,       color: 'text-violet-500', bg: 'bg-violet-50' },
                { label: 'Out for Delivery', value: stats.outForDelivery,  icon: TrendingUp,  color: 'text-amber-500',  bg: 'bg-amber-50'  },
                { label: 'COD Orders',       value: stats.codOrders,       icon: IndianRupee, color: 'text-pink-500',   bg: 'bg-pink-50'   },
                { label: 'Agents Available', value: stats.availableAgents, icon: Users,       color: 'text-teal-500',   bg: 'bg-teal-50'   },
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

          <div className="card overflow-hidden border border-orange-100 flex items-center justify-between px-6 py-5" style={{ background: 'linear-gradient(135deg, #ffe4cc 0%, #ffcc99 100%)' }}>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue (Delivered Orders)</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{formatCurrency(stats.revenue)}</p>
              <p className="text-xs text-gray-400 mt-1">{stats.delivered} orders delivered</p>
            </div>
            <img src="/boxes.png" alt="boxes" className="h-32 w-auto object-contain flex-shrink-0 drop-shadow-lg" />
          </div>
        </>
      )}

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-orange-500 hover:underline flex items-center gap-1">
            View all <ArrowUpRight size={12} />
          </Link>
        </div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Tracking ID</th>
                <th>Customer</th>
                <th>Route</th>
                <th>Type</th>
                <th>Agent</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((o) => (
                <tr key={o.id}>
                  <td>
                    <Link to={`/admin/orders/${o.id}`} className="font-semibold text-orange-500 hover:underline">
                      {o.trackingId}
                    </Link>
                  </td>
                  <td className="font-medium">{o.customerName}</td>
                  <td className="text-gray-500 text-xs">{o.pickupZoneName} → {o.dropZoneName}</td>
                  <td>
                    <span className={`badge ${o.orderType === 'B2B' ? 'bg-indigo-50 text-indigo-700' : 'bg-pink-50 text-pink-700'}`}>
                      {o.orderType}
                    </span>
                  </td>
                  <td>{o.agentName ?? <span className="text-gray-400 text-xs">Unassigned</span>}</td>
                  <td className="font-semibold">{formatCurrency(o.totalCharge)}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td className="text-xs text-gray-400">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <div className="py-12 text-center text-sm text-gray-400">No orders yet</div>
          )}
        </div>
      </div>
    </div>
  )
}

