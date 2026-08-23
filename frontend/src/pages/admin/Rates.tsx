import { useEffect, useState } from 'react'
import { Pencil, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { type RateCard, type CodSurcharge } from '../../types'
import { formatCurrency, getErrorMessage } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function AdminRates() {
  const [rates, setRates] = useState<RateCard[]>([])
  const [codSurcharges, setCodSurcharges] = useState<CodSurcharge[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRate, setEditingRate] = useState<number | null>(null)
  const [editValues, setEditValues] = useState<Partial<RateCard>>({})
  const [editingCod, setEditingCod] = useState<number | null>(null)
  const [codEdit, setCodEdit] = useState('')

  async function fetchData() {
    const [ratesRes, codRes] = await Promise.all([api.get('/rates'), api.get('/rates/cod')])
    setRates(ratesRes.data.data)
    setCodSurcharges(codRes.data.data)
  }

  useEffect(() => {
    fetchData().finally(() => setLoading(false))
  }, [])

  async function handleSaveRate(id: number) {
    try {
      await api.put(`/rates/${id}`, editValues)
      toast.success('Rate card updated')
      setEditingRate(null)
      await fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  async function handleSaveCod(id: number) {
    try {
      await api.put(`/rates/cod/${id}`, { surchargeAmount: Number(codEdit) })
      toast.success('COD surcharge updated')
      setEditingCod(null)
      await fetchData()
    } catch (err) {
      toast.error(getErrorMessage(err))
    }
  }

  if (loading) return <div className="flex justify-center py-16"><LoadingSpinner size="lg" /></div>

  const b2cIntra = rates.filter((r) => r.orderType === 'B2C' && r.zoneType === 'INTRA')
  const b2cInter = rates.filter((r) => r.orderType === 'B2C' && r.zoneType === 'INTER')
  const b2bIntra = rates.filter((r) => r.orderType === 'B2B' && r.zoneType === 'INTRA')
  const b2bInter = rates.filter((r) => r.orderType === 'B2B' && r.zoneType === 'INTER')

  function RateTable({ title, cards }: { title: string; cards: RateCard[] }) {
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-800">{title}</h2>
        </div>
        <div className="table-container rounded-t-none border-t-0">
          <table className="table">
            <thead>
              <tr>
                <th>Weight Range</th>
                <th>Base Charge</th>
                <th>Rate / kg</th>
                <th>Active</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.id}>
                  <td>{card.minWeight} — {card.maxWeight} kg</td>
                  <td>
                    {editingRate === card.id ? (
                      <input
                        className="input w-24 text-sm"
                        type="number"
                        value={editValues.baseCharge ?? card.baseCharge}
                        onChange={(e) => setEditValues({ ...editValues, baseCharge: Number(e.target.value) })}
                      />
                    ) : formatCurrency(card.baseCharge)}
                  </td>
                  <td>
                    {editingRate === card.id ? (
                      <input
                        className="input w-24 text-sm"
                        type="number"
                        value={editValues.ratePerKg ?? card.ratePerKg}
                        onChange={(e) => setEditValues({ ...editValues, ratePerKg: Number(e.target.value) })}
                      />
                    ) : formatCurrency(card.ratePerKg)}
                  </td>
                  <td>
                    <span className={`badge ${card.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {card.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    {editingRate === card.id ? (
                      <div className="flex gap-1">
                        <button className="p-1 text-green-600 hover:text-green-700" onClick={() => handleSaveRate(card.id)}>
                          <Check size={16} />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-600" onClick={() => setEditingRate(null)}>
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        className="p-1 text-gray-400 hover:text-brand-500"
                        onClick={() => { setEditingRate(card.id); setEditValues({}) }}
                      >
                        <Pencil size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <h1 className="text-xl font-semibold text-gray-900">Rate Cards</h1>

      <div className="card">
        <div className="card-header">
          <h2 className="text-sm font-semibold text-gray-800">COD Surcharges</h2>
        </div>
        <div className="card-body">
          <div className="flex gap-6">
            {codSurcharges.map((cs) => (
              <div key={cs.id} className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">{cs.orderType} COD:</span>
                {editingCod === cs.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      className="input w-24 text-sm"
                      type="number"
                      value={codEdit}
                      onChange={(e) => setCodEdit(e.target.value)}
                    />
                    <button className="p-1 text-green-600" onClick={() => handleSaveCod(cs.id)}><Check size={16} /></button>
                    <button className="p-1 text-gray-400" onClick={() => setEditingCod(null)}><X size={16} /></button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-brand-600">{formatCurrency(cs.surchargeAmount)}</span>
                    <button className="p-1 text-gray-400 hover:text-brand-500"
                      onClick={() => { setEditingCod(cs.id); setCodEdit(String(cs.surchargeAmount)) }}>
                      <Pencil size={14} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RateTable title="B2C — Intra Zone" cards={b2cIntra} />
        <RateTable title="B2C — Inter Zone" cards={b2cInter} />
        <RateTable title="B2B — Intra Zone" cards={b2bIntra} />
        <RateTable title="B2B — Inter Zone" cards={b2bInter} />
      </div>
    </div>
  )
}
