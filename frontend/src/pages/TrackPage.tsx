import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Search, CheckCircle, XCircle, Truck, User } from 'lucide-react'
import api from '../lib/api'
import { type Order, type OrderStatus } from '../types'
import { statusLabel, formatDate, formatCurrency } from '../lib/utils'
import Logo from '../components/ui/Logo'
import StatusBadge from '../components/ui/StatusBadge'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getErrorMessage } from '../lib/utils'

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

export default function TrackPage() {
  const { trackingId: urlTrackingId } = useParams()
  const navigate = useNavigate()
  const [input, setInput] = useState(urlTrackingId ?? '')
  const [order, setOrder] = useState<Order | null>(null)
  const [timeline, setTimeline] = useState<TrackingEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (urlTrackingId) fetchOrder(urlTrackingId)
  }, [urlTrackingId])

  async function fetchOrder(id: string) {
    setLoading(true)
    setError('')
    setOrder(null)
    setTimeline([])
    try {
      const orderRes = await api.get(`/orders/track/${id}`)
      const orderData: Order = orderRes.data.data
      setOrder(orderData)
      const trackRes = await api.get(`/orders/${orderData.id}/tracking`)
      setTimeline(trackRes.data.data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (input.trim()) navigate(`/track/${input.trim()}`)
  }

  const currentStatusIndex = order ? STATUS_ORDER.indexOf(order.status as OrderStatus) : -1

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f8f5f2' }}>
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <button onClick={() => navigate('/login')} className="btn-secondary text-sm">Sign in</button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-6 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Track your package</h1>
            <p className="text-sm text-gray-500 mt-0.5">Enter your ParcelGo tracking ID below</p>
          </div>
          <img src="/location-pin.png" alt="track" className="ml-auto hidden md:block h-16 w-auto object-contain"
            style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }} />
        </div>

        <form onSubmit={handleSearch} className="flex gap-3 mb-8">
          <input className="input flex-1 text-base" placeholder="e.g. PG2608221044"
            value={input} onChange={(e) => setInput(e.target.value)} />
          <button type="submit" className="btn-primary px-6" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : <><Search size={16} /> Track</>}
          </button>
        </form>

        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 mb-6">{error}</div>
        )}

        {order && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-2 space-y-4">
              <div className="card">
                <div className="card-body">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <p className="text-xs text-gray-400 mb-0.5">Tracking ID</p>
                      <p className="text-xl font-bold text-gray-900">{order.trackingId}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-xl mb-5">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500 mb-1">From</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{order.pickupZoneName}</p>
                      <p className="text-xs text-gray-400 truncate">{order.pickupAddress}</p>
                    </div>
                    <div className="flex flex-col items-center flex-shrink-0">
                      <img src="/location-pin.png" alt="pin" className="h-12 w-auto object-contain"
                        style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
                    </div>
                    <div className="flex-1 min-w-0 text-right">
                      <p className="text-xs text-gray-500 mb-1">To</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{order.dropZoneName}</p>
                      <p className="text-xs text-gray-400 truncate">{order.dropAddress}</p>
                    </div>
                  </div>

                  {order.status !== 'FAILED' && (
                    <div className="flex items-center gap-1 mb-5">
                      {STATUS_ORDER.map((s, i) => (
                        <div key={s} className="flex items-center flex-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0 ${
                            i <= currentStatusIndex ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {i < currentStatusIndex ? '✓' : i + 1}
                          </div>
                          {i < STATUS_ORDER.length - 1 && (
                            <div className={`flex-1 h-1 mx-1 rounded-full ${i < currentStatusIndex ? 'bg-orange-400' : 'bg-gray-200'}`} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-100 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Order type</p>
                      <p className="font-semibold mt-0.5">{order.orderType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Amount</p>
                      <p className="font-bold text-orange-500 mt-0.5">{formatCurrency(order.totalCharge)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Payment</p>
                      <p className="font-semibold mt-0.5">{order.paymentType}</p>
                    </div>
                  </div>
                </div>
              </div>

              {order.agentName && (
                <div className="card p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-bold text-orange-600">{order.agentName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Your Delivery Agent</p>
                    <p className="text-sm font-semibold text-gray-800">{order.agentName}</p>
                    {order.agentPhone && <p className="text-xs text-gray-400">{order.agentPhone}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="card">
              <div className="card-header">
                <h2 className="text-sm font-semibold text-gray-800">Tracking Timeline</h2>
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
                        {i < timeline.length - 1 && (
                          <div className="w-0.5 min-h-[24px] bg-gray-200 my-1 flex-1" />
                        )}
                      </div>
                      <div className={`flex-1 min-w-0 ${i < timeline.length - 1 ? 'pb-5' : ''}`}>
                        <p className="text-sm font-semibold text-gray-800">{statusLabel(event.status)}</p>
                        {event.actorName && <p className="text-xs text-gray-500">by {event.actorName}</p>}
                        {event.notes && <p className="text-xs text-gray-400">{event.notes}</p>}
                        <p className="text-xs text-gray-400 mt-0.5">{formatDate(event.createdAt)}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {!order && !loading && !error && (
          <div className="text-center py-16">
            <img src="/house.png" alt="track" className="w-56 h-auto mx-auto mb-4 object-contain"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.1))' }} />
            <p className="text-base font-medium text-gray-600">Enter a tracking ID to get started</p>
            <p className="text-sm text-gray-400 mt-1">Find your tracking ID in the confirmation email or your orders page</p>
          </div>
        )}
      </div>
    </div>
  )
}
