import { useEffect, useState } from 'react'
import { Plus, ChevronDown, ChevronRight, Trash2, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { type Zone } from '../../types'
import { getErrorMessage } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import EmptyState from '../../components/ui/EmptyState'

export default function AdminZones() {
  const [zones, setZones] = useState<Zone[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [zoneForm, setZoneForm] = useState({ name: '', description: '' })
  const [areaForm, setAreaForm] = useState({ pincode: '', areaName: '' })
  const [addingAreaTo, setAddingAreaTo] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function fetchZones() {
    const res = await api.get('/zones')
    setZones(res.data.data)
  }

  useEffect(() => {
    fetchZones().finally(() => setLoading(false))
  }, [])

  async function handleCreateZone(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await api.post('/zones', zoneForm)
      toast.success('Zone created')
      setShowForm(false)
      setZoneForm({ name: '', description: '' })
      await fetchZones()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteZone(id: number) {
    if (!confirm('Delete this zone? This will also remove all assigned pincodes.')) return
    try {
      await api.delete(`/zones/${id}`)
      toast.success('Zone deleted')
      await fetchZones()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleAddArea(zoneId: number) {
    if (!areaForm.pincode || !areaForm.areaName) return
    setSubmitting(true)
    try {
      await api.post(`/zones/${zoneId}/areas`, areaForm)
      toast.success('Area added')
      setAreaForm({ pincode: '', areaName: '' })
      setAddingAreaTo(null)
      await fetchZones()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteArea(areaId: number) {
    try {
      await api.delete(`/zones/areas/${areaId}`)
      toast.success('Area removed')
      await fetchZones()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Zones</h1>
        <button className="btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Add Zone
        </button>
      </div>

      {showForm && (
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="text-sm font-semibold">New Zone</h2>
            <button onClick={() => setShowForm(false)}><X size={18} className="text-gray-400" /></button>
          </div>
          <form onSubmit={handleCreateZone} className="card-body flex gap-3 flex-wrap">
            <div className="flex-1 min-w-40">
              <label className="label">Zone Name</label>
              <input className="input" required value={zoneForm.name}
                onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })} />
            </div>
            <div className="flex-1 min-w-40">
              <label className="label">Description</label>
              <input className="input" value={zoneForm.description}
                onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })} />
            </div>
            <div className="flex items-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting ? <LoadingSpinner size="sm" /> : 'Create'}
              </button>
            </div>
          </form>
        </div>
      )}

      {zones.length === 0 ? (
        <EmptyState title="No zones configured" description="Add zones to enable delivery charge calculation" />
      ) : (
        <div className="space-y-2">
          {zones.map((zone) => (
            <div key={zone.id} className="card">
              <div
                className="card-header flex items-center justify-between cursor-pointer"
                onClick={() => setExpanded(expanded === zone.id ? null : zone.id)}
              >
                <div className="flex items-center gap-3">
                  {expanded === zone.id ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  <div>
                    <p className="text-sm font-semibold">{zone.name}</p>
                    {zone.description && <p className="text-xs text-gray-400">{zone.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-400">{zone.areas?.length ?? 0} areas</span>
                  <button
                    className="text-red-400 hover:text-red-600 p-1"
                    onClick={(e) => { e.stopPropagation(); handleDeleteZone(zone.id) }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>

              {expanded === zone.id && (
                <div className="card-body">
                  <div className="space-y-2 mb-4">
                    {zone.areas?.map((area) => (
                      <div key={area.id} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                        <div>
                          <span className="text-sm font-medium">{area.areaName}</span>
                          <span className="text-xs text-gray-400 ml-2">{area.pincode}</span>
                        </div>
                        <button className="text-red-400 hover:text-red-600 p-1" onClick={() => handleDeleteArea(area.id)}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {!zone.areas?.length && <p className="text-sm text-gray-400">No areas configured</p>}
                  </div>

                  {addingAreaTo === zone.id ? (
                    <div className="flex gap-2 items-end flex-wrap">
                      <div>
                        <label className="label">Pincode</label>
                        <input className="input w-32" placeholder="462001" value={areaForm.pincode}
                          onChange={(e) => setAreaForm({ ...areaForm, pincode: e.target.value })} />
                      </div>
                      <div>
                        <label className="label">Area Name</label>
                        <input className="input w-48" placeholder="Bhopal HO" value={areaForm.areaName}
                          onChange={(e) => setAreaForm({ ...areaForm, areaName: e.target.value })} />
                      </div>
                      <button className="btn-primary" onClick={() => handleAddArea(zone.id)} disabled={submitting}>
                        {submitting ? <LoadingSpinner size="sm" /> : 'Add'}
                      </button>
                      <button className="btn-secondary" onClick={() => setAddingAreaTo(null)}>Cancel</button>
                    </div>
                  ) : (
                    <button className="btn-secondary text-sm" onClick={() => setAddingAreaTo(zone.id)}>
                      <Plus size={14} /> Add Pincode/Area
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
