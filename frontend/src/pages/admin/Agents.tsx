import { useEffect, useState } from 'react'
import { Plus, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { type DeliveryAgent, type Zone } from '../../types'
import { availabilityBadgeClass, getErrorMessage } from '../../lib/utils'
import EmptyState from '../../components/ui/EmptyState'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AdminAgents() {
  const [agents, setAgents] = useState<DeliveryAgent[]>([])
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', vehicleNumber: '', zoneId: '' })

  async function fetchData() {
    const [agentsRes, zonesRes] = await Promise.all([api.get('/agents'), api.get('/zones')])
    setAgents(agentsRes.data.data)
    setZones(zonesRes.data.data)
  }

  useEffect(() => {
    fetchData().finally(() => setLoading(false))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/agents', { ...form, zoneId: form.zoneId ? Number(form.zoneId) : null })
      toast.success('Agent created')
      setShowForm(false)
      setForm({ name: '', email: '', password: '', phone: '', vehicleNumber: '', zoneId: '' })
      await fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleAvailabilityChange(agentId: number, availability: string) {
    try {
      await api.patch(`/agents/${agentId}/availability`, { availability })
      setAgents((prev) => prev.map((a) =>
        a.id === agentId ? { ...a, availability: availability as DeliveryAgent['availability'] } : a
      ))
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Delivery Agents</h1>
          <p className="text-sm text-gray-500 mt-0.5">{agents.length} agent{agents.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Agent
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-semibold">New Delivery Agent</h2>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400 hover:text-gray-600" /></button>
          </div>
          <form onSubmit={handleSubmit} className="card-body grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Full Name</label>
              <input className="input" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rahul Sharma" />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input" type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="agent@parcelgo.in" />
            </div>
            <div>
              <label className="label">Password</label>
              <input className="input" type="password" required minLength={6} value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="label">Phone</label>
              <input className="input" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9XXXXXXXXX" />
            </div>
            <div>
              <label className="label">Vehicle Number</label>
              <input className="input" value={form.vehicleNumber}
                onChange={(e) => setForm({ ...form, vehicleNumber: e.target.value })} placeholder="MP04AB1234" />
            </div>
            <div>
              <label className="label">Home Zone</label>
              <select className="input" value={form.zoneId}
                onChange={(e) => setForm({ ...form, zoneId: e.target.value })}>
                <option value="">Select zone</option>
                {zones.map((z) => <option key={z.id} value={z.id}>{z.name}</option>)}
              </select>
            </div>
            <div className="md:col-span-3 flex gap-2 justify-end">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? <LoadingSpinner size="sm" /> : 'Create Agent'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Zone</th>
                <th>Vehicle</th>
                <th>Availability</th>
                <th>Change Status</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id}>
                  <td className="font-medium text-gray-900">{agent.name}</td>
                  <td className="text-gray-500">{agent.email}</td>
                  <td className="text-gray-500">{agent.phone ?? '—'}</td>
                  <td>{agent.zoneName ?? <span className="text-gray-400">—</span>}</td>
                  <td className="font-mono text-xs">{agent.vehicleNumber ?? '—'}</td>
                  <td>
                    <span className={availabilityBadgeClass(agent.availability)}>
                      {agent.availability}
                    </span>
                  </td>
                  <td>
                    <select
                      className="text-xs border border-gray-200 rounded-lg px-2.5 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-orange-400"
                      value={agent.availability}
                      onChange={(e) => handleAvailabilityChange(agent.id, e.target.value)}
                    >
                      <option value="AVAILABLE">Available</option>
                      <option value="BUSY">Busy</option>
                      <option value="OFFLINE">Offline</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {agents.length === 0 && (
            <EmptyState title="No agents yet" description="Add your first delivery agent to get started" />
          )}
        </div>
      </div>
    </div>
  )
}
