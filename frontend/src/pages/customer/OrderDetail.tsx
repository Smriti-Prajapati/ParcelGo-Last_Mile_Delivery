import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, CheckCircle, XCircle, CalendarDays, Package } from 'lucide-react'
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

const STATUS_ORDER: OrderStatus[] = [
  'CONFIRMED', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED'
]

export default function CustomerOrderDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [timeline, setTimeline] = useState<TrackingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduling, setRescheduling] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)

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

  async function handleReschedule() {
    if (!rescheduleDate) return
    setRescheduling(true)
    try {
      await api.post(`/orders/${id}/reschedule`, { newDate: rescheduleDate })
      toast.success('Delivery rescheduled! A new agent will be assigned shortly.')
      setShowReschedule(false)
      await fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setRescheduling(false)
    }
  }

  if (loading || !order) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1)
  const minDateStr = minDate.toISOString().split('T')[0]
  const currentStatusIndex = STATUS_ORDER.indexOf(order.status as OrderStatus)

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{order.trackingId}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <StatusBadge status={order.status} />
          <Link to={`/track/${order.trackingId}`}
            className="btn-secondary text-xs hidden md:inline-flex">
            Public Tracking
          </Link>
        </div>
      </div>

      {/* Progress bar */}
      {order.status !== 'FAILED' && (
        <div className="card p-4">
          <div className="flex items-center gap-1">
            {STATUS_ORDER.map((s, i) => (
              <div key={s} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    i <= currentStatusIndex ? 'bg-orange-500 text-white shadow-sm' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {i < currentStatusIndex ? '✓' : i + 1}
                  </div>
                  <span className="text-xs text-gray-400 hidden md:block whitespace-nowrap">
                    {statusLabel(s)}
                  </span>
                </div>
                {i < STATUS_ORDER.length - 1 && (
                  <div className={`flex-1 h-1 mx-1 rounded-full mb-4 transition-colors ${
                    i < currentStatusIndex ? 'bg-orange-400' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-4">          {/* Route */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <MapPin size={15} className="text-orange-400" />
              <h2 className="text-sm font-semibold">Route</h2>
            </div>
            <div className="card-body grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Pickup</p>
                <p className="font-medium">{order.pickupAddress}</p>
                <p className="text-xs text-gray-400">{order.pickupPincode} — {order.pickupZoneName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Drop</p>
                <p className="font-medium">{order.dropAddress}</p>
                <p className="text-xs text-gray-400">{order.dropPincode} — {order.dropZoneName}</p>
              </div>
            </div>
          </div>

          {/* Charge summary */}
          <div className="card">
            <div className="card-header flex items-center gap-2">
              <Package size={15} className="text-orange-400" />
              <h2 className="text-sm font-semibold">Charge Breakdown</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">Actual Weight</p>
                  <p className="font-semibold mt-0.5">{order.actualWeight} kg</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-400">Volumetric</p>
                  <p className="font-semibold mt-0.5">{order.volumetricWeight} kg</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-gray-400">Billable Weight</p>
                  <p className="font-bold text-orange-600 mt-0.5">{order.billableWeight} kg</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="font-bold text-orange-600 mt-0.5">{formatCurrency(order.totalCharge)}</p>
                </div>
              </div>
              <div className="flex gap-2 text-xs text-gray-500">
                <span className="badge bg-orange-50 text-orange-700">{order.orderType}</span>
                <span className={`badge ${order.paymentType === 'COD' ? 'bg-amber-50 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                  {order.paymentType}
                </span>
                <span className={`badge ${order.pickupZoneName === order.dropZoneName ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                  {order.pickupZoneName === order.dropZoneName ? 'Intra-Zone' : 'Inter-Zone'}
                </span>
              </div>
            </div>
          </div>

          {/* Failed delivery — reschedule */}
          {order.status === 'FAILED' && (
            <div className="card border-red-100 bg-red-50">
              <div className="card-body">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <XCircle size={24} className="text-red-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-red-700">Delivery attempt failed</p>
                    <p className="text-sm text-red-600 mt-0.5">
                      Your package couldn't be delivered. Please choose a new delivery date.
                    </p>
                  </div>
                </div>
                {showReschedule ? (
                  <div className="flex gap-3 items-end flex-wrap">
                    <div>
                      <label className="label text-red-700">New Delivery Date</label>
                      <input type="date" className="input" min={minDateStr}
                        value={rescheduleDate} onChange={(e) => setRescheduleDate(e.target.value)} />
                    </div>
                    <button onClick={handleReschedule} className="btn-primary" disabled={rescheduling || !rescheduleDate}>
                      {rescheduling ? <LoadingSpinner size="sm" /> : 'Confirm Reschedule'}
                    </button>
                    <button className="btn-secondary" onClick={() => setShowReschedule(false)}>Cancel</button>
                  </div>
                ) : (
                  <button className="btn-primary" onClick={() => setShowReschedule(true)}>
                    <CalendarDays size={16} /> Schedule New Delivery
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right col — agent + timeline */}
        <div className="space-y-4">
          {/* Agent */}          {order.agentName ? (
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-lg font-bold text-orange-600">
                    {order.agentName.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Delivery Agent</p>
                  <p className="text-sm font-semibold text-gray-800">{order.agentName}</p>
                  {order.agentPhone && <p className="text-xs text-gray-400">{order.agentPhone}</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                <span className="text-gray-400 text-lg">—</span>
              </div>
              <div>
                <p className="text-xs text-gray-400">Delivery Agent</p>
                <p className="text-sm text-gray-500">Not yet assigned</p>
              </div>
            </div>
          )}

          {/* Timeline */}
          <div className="card">
            <div className="card-header">
              <h2 className="text-sm font-semibold text-gray-800">Tracking Timeline</h2>
            </div>
            <div className="p-5">
              {timeline.length === 0 ? (
                <p className="text-sm text-gray-400">No events yet</p>
              ) : (
                <div>
                  {timeline.map((event, i) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          event.status === 'FAILED' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          {event.status === 'FAILED'
                            ? <XCircle size={15} className="text-red-500" />
                            : <CheckCircle size={15} className="text-green-500" />
                          }
                        </div>
                        {i < timeline.length - 1 && (
                          <div className="w-0.5 h-full bg-gray-200 my-1 min-h-[24px]" />
                        )}
                      </div>
                      <div className={`flex-1 min-w-0 ${i < timeline.length - 1 ? 'pb-5' : ''}`}>
                        <p className="text-sm font-semibold text-gray-800">{statusLabel(event.status)}</p>
                        {event.actorName && (
                          <p className="text-xs text-gray-500">by {event.actorName}</p>
                        )}
                        {event.notes && (
                          <p className="text-xs text-gray-400">{event.notes}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(event.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
