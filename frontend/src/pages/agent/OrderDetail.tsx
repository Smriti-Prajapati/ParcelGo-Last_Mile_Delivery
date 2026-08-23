import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, CheckCircle, XCircle, Package } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { type Order, type OrderStatus } from '../../types'
import { formatCurrency, formatDate, statusLabel, getErrorMessage } from '../../lib/utils'
import StatusBadge from '../../components/ui/StatusBadge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

interface TrackingEvent {
  id: number
  status: OrderStatus
  actorId: number | null
  actorName: string | null
  notes: string | null
  createdAt: string
}

const NEXT_STATUS: Record<OrderStatus, OrderStatus[]> = {
  CONFIRMED:          ['PICKED_UP'],
  PICKED_UP:          ['IN_TRANSIT'],
  IN_TRANSIT:         ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY:   ['DELIVERED', 'FAILED'],
  DELIVERED:          [],
  FAILED:             [],
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  CONFIRMED:          'Confirm Pickup',
  PICKED_UP:          'Mark In Transit',
  IN_TRANSIT:         'Out for Delivery',
  OUT_FOR_DELIVERY:   '',
  DELIVERED:          'Mark Delivered',
  FAILED:             'Mark Failed',
}

export default function AgentOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [timeline, setTimeline] = useState<TrackingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [notes, setNotes] = useState('')

  async function fetchData() {
    const [orderRes, trackRes] = await Promise.all([
      api.get(`/orders/${id}`),
      api.get(`/orders/${id}/tracking`),
    ])
    setOrder(orderRes.data.data)
    setTimeline(trackRes.data.data)
  }

  useEffect(() => {
    fetchData().finally(() => setLoading(false))
  }, [id])

  async function handleStatusUpdate(newStatus: OrderStatus) {
    setUpdating(true)
    try {
      await api.post(`/orders/${id}/status`, { status: newStatus, notes })
      toast.success(`Marked as ${statusLabel(newStatus)}`)
      setNotes('')
      await fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUpdating(false)
    }
  }

  if (loading || !order) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  const nextStatuses = NEXT_STATUS[order.status] ?? []

  return (
    <div className="space-y-5 max-w-3xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{order.trackingId}</h1>
          <p className="text-sm text-gray-500">Order #{order.id}</p>
        </div>
        <div className="ml-auto"><StatusBadge status={order.status} /></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Route */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
            <MapPin size={15} className="text-orange-400" />
            <h2 className="text-sm font-semibold">Delivery Route</h2>
          </div>
          <div className="card-body space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Pickup</p>
                <p className="text-sm font-medium text-gray-800">{order.pickupAddress}</p>
                <p className="text-xs text-gray-400">{order.pickupPincode} — {order.pickupZoneName}</p>
              </div>
            </div>
            <div className="ml-1.5 w-0.5 h-6 bg-gray-200" />
            <div className="flex items-start gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-400">Drop</p>
                <p className="text-sm font-medium text-gray-800">{order.dropAddress}</p>
                <p className="text-xs text-gray-400">{order.dropPincode} — {order.dropZoneName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order info */}
        <div className="card">
          <div className="card-header flex items-center gap-2">
              <Package size={15} className="text-orange-400" />
              <h2 className="text-sm font-semibold">Order Info</h2>
            </div>
          <div className="card-body space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Customer</span>
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Order Type</span>
              <span className="font-medium">{order.orderType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Payment</span>
              <span className={`font-semibold ${order.paymentType === 'COD' ? 'text-amber-600' : 'text-gray-700'}`}>
                {order.paymentType}
              </span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3">
              <span className="text-gray-500">Amount</span>
              <span className="font-bold text-orange-500">{formatCurrency(order.totalCharge)}</span>
            </div>
            {order.paymentType === 'COD' && (
              <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-700 font-medium">
                Collect ₹{order.totalCharge} cash on delivery
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status update */}
      {nextStatuses.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-800">Update Delivery Status</h2>
          </div>
          <div className="card-body space-y-3">
            <div>
              <label className="label">Notes (optional)</label>
              <input className="input" placeholder="Any remarks about this delivery..."
                value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
            <div className="flex flex-wrap gap-2">
              {nextStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusUpdate(s)}
                  disabled={updating}
                  className={`btn flex-1 py-3 font-semibold ${s === 'FAILED' ? 'btn-danger' : 'btn-primary'}`}
                >
                  {updating ? <LoadingSpinner size="sm" /> : statusLabel(s)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {(order.status === 'DELIVERED' || order.status === 'FAILED') && (
        <div className={`card p-4 flex items-center gap-4 ${order.status === 'DELIVERED' ? 'border-green-100 bg-green-50' : 'border-red-100 bg-red-50'}`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${order.status === 'DELIVERED' ? 'bg-green-100' : 'bg-red-100'}`}>
            {order.status === 'DELIVERED'
              ? <CheckCircle size={24} className="text-green-500" />
              : <XCircle size={24} className="text-red-500" />
            }
          </div>
          <div>
            <p className={`text-sm font-semibold ${order.status === 'DELIVERED' ? 'text-green-700' : 'text-red-700'}`}>
              {order.status === 'DELIVERED' ? 'Delivery completed successfully' : 'Delivery failed'}
            </p>
            <p className="text-xs text-gray-500">This order has been finalised.</p>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-800">Tracking History</h2>
        </div>
        <div className="p-5">
          {timeline.length === 0 ? (
            <p className="text-sm text-gray-400">No events yet</p>
          ) : (
            timeline.map((event, i) => (
              <div key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    event.status === 'FAILED' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {event.status === 'FAILED'
                      ? <XCircle size={16} className="text-red-500" />
                      : <CheckCircle size={16} className="text-green-500" />
                    }
                  </div>
                  {i < timeline.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 my-1" />}
                </div>
                <div className="pb-5 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold">{statusLabel(event.status)}</p>
                      {event.notes && <p className="text-xs text-gray-400">{event.notes}</p>}
                    </div>
                    <p className="text-xs text-gray-400 whitespace-nowrap">{formatDate(event.createdAt)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
