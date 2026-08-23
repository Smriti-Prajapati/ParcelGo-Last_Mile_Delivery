import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, User, Truck, MapPin, Package, CheckCircle, XCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { type Order, type DeliveryAgent, type OrderStatus } from '../../types'
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

const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  CONFIRMED: ['PICKED_UP'],
  PICKED_UP: ['IN_TRANSIT'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  FAILED: ['CONFIRMED'],
}

export default function OrderDetail() {
  const { id } = useParams()
  const [order, setOrder] = useState<Order | null>(null)
  const [timeline, setTimeline] = useState<TrackingEvent[]>([])
  const [agents, setAgents] = useState<DeliveryAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [selectedAgent, setSelectedAgent] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)

  async function fetchData() {
    const [orderRes, trackRes, agentsRes] = await Promise.all([
      api.get(`/orders/${id}`),
      api.get(`/orders/${id}/tracking`),
      api.get('/agents'),
    ])
    setOrder(orderRes.data.data)
    setTimeline(trackRes.data.data)
    setAgents(agentsRes.data.data)
  }

  useEffect(() => {
    fetchData().finally(() => setLoading(false))
  }, [id])

  async function handleAssign() {
    if (!selectedAgent) return
    setAssigning(true)
    try {
      await api.post(`/orders/${id}/assign`, { agentId: Number(selectedAgent) })
      toast.success('Agent assigned')
      await fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setAssigning(false)
    }
  }

  async function handleAutoAssign() {
    setAssigning(true)
    try {
      await api.post(`/orders/${id}/auto-assign`)
      toast.success('Agent auto-assigned')
      await fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setAssigning(false)
    }
  }

  async function handleStatusUpdate(newStatus: OrderStatus) {
    setUpdatingStatus(true)
    try {
      await api.post(`/orders/${id}/status`, { status: newStatus })
      toast.success(`Status updated to ${statusLabel(newStatus)}`)
      await fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading || !order) {
    return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>
  }

  const nextStatuses = NEXT_STATUSES[order.status] ?? []
  const availableAgents = agents.filter((a) => a.availability === 'AVAILABLE')

  return (
    <div className="space-y-5 max-w-4xl">
      <div className="flex items-center gap-3">
        <Link to="/admin/orders" className="btn-ghost p-2">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{order.trackingId}</h1>
          <p className="text-sm text-gray-500">Order #{order.id}</p>
        </div>
        <div className="ml-auto">
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <MapPin size={15} /> Route
            </h2>
          </div>
          <div className="card-body space-y-3">
            <div>
              <p className="text-xs text-gray-400">Pickup</p>
              <p className="text-sm font-medium">{order.pickupAddress}</p>
              <p className="text-xs text-gray-400">{order.pickupPincode} — {order.pickupZoneName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400">Drop</p>
              <p className="text-sm font-medium">{order.dropAddress}</p>
              <p className="text-xs text-gray-400">{order.dropPincode} — {order.dropZoneName}</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Package size={15} /> Charge Summary
            </h2>
          </div>
          <div className="card-body space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Actual Weight</span>
              <span>{order.actualWeight} kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Volumetric Weight</span>
              <span>{order.volumetricWeight} kg</span>
            </div>
            <div className="flex justify-between font-medium">
              <span className="text-gray-500">Billable Weight</span>
              <span className="text-brand-600">{order.billableWeight} kg</span>
            </div>
            <div className="pt-2 border-t border-gray-100 flex justify-between">
              <span className="text-gray-500">Base Charge</span>
              <span>{formatCurrency(order.baseCharge)}</span>
            </div>
            {order.codSurcharge > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500">COD Surcharge</span>
                <span>{formatCurrency(order.codSurcharge)}</span>
              </div>
            )}
            <div className="pt-2 border-t border-gray-100 flex justify-between font-semibold">
              <span>Total</span>
              <span className="text-brand-600">{formatCurrency(order.totalCharge)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <User size={15} /> Customer
            </h2>
          </div>
          <div className="card-body text-sm">
            <p className="font-medium">{order.customerName}</p>
            <p className="text-gray-500">{order.customerEmail}</p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
              <Truck size={15} /> Agent Assignment
            </h2>
          </div>
          <div className="card-body">
            {order.agentName ? (
              <div className="text-sm mb-3">
                <p className="font-medium">{order.agentName}</p>
                {order.agentPhone && <p className="text-gray-500">{order.agentPhone}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-400 mb-3">No agent assigned</p>
            )}
            <div className="flex gap-2">
              <select
                className="input flex-1"
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
              >
                <option value="">Select agent</option>
                {availableAgents.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} — {a.zoneName ?? 'No zone'}
                  </option>
                ))}
              </select>
              <button onClick={handleAssign} className="btn-primary" disabled={assigning || !selectedAgent}>
                {assigning ? <LoadingSpinner size="sm" /> : 'Assign'}
              </button>
            </div>
            <button
              onClick={handleAutoAssign}
              className="btn-secondary w-full mt-2"
              disabled={assigning}
            >
              Auto-assign nearest agent
            </button>
          </div>
        </div>
      </div>

      {nextStatuses.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2 className="text-sm font-semibold text-gray-800">Update Status</h2>
          </div>
          <div className="card-body flex flex-wrap gap-2">
            {nextStatuses.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusUpdate(s)}
                disabled={updatingStatus}
                className={`btn ${s === 'FAILED' ? 'btn-danger' : 'btn-primary'}`}
              >
                {updatingStatus ? <LoadingSpinner size="sm" /> : `Mark as ${statusLabel(s)}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-800">Tracking Timeline</h2>
        </div>
        <div className="p-5">
          {timeline.map((event, i) => (
            <div key={event.id} className="flex gap-4">
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
              <div className="pb-6 flex-1">
                <div className="flex justify-between">
                  <div>
                    <p className="text-sm font-semibold">{statusLabel(event.status)}</p>
                    {event.actorName && <p className="text-xs text-gray-500">by {event.actorName}</p>}
                    {event.notes && <p className="text-xs text-gray-400">{event.notes}</p>}
                  </div>
                  <p className="text-xs text-gray-400">{formatDate(event.createdAt)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
