import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Info } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../lib/api'
import { type ChargeCalculation } from '../../types'
import { formatCurrency, getErrorMessage } from '../../lib/utils'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

interface FormData {
  pickupAddress: string; pickupPincode: string
  dropAddress: string;   dropPincode: string
  length: string; breadth: string; height: string
  actualWeight: string
  orderType: 'B2B' | 'B2C'
  paymentType: 'PREPAID' | 'COD'
  notes: string
}

const initial: FormData = {
  pickupAddress:'', pickupPincode:'', dropAddress:'', dropPincode:'',
  length:'', breadth:'', height:'', actualWeight:'',
  orderType:'B2C', paymentType:'PREPAID', notes:''
}

export default function CustomerCreateOrder() {
  const navigate = useNavigate()
  const [form, setForm] = useState<FormData>(initial)
  const [charge, setCharge] = useState<ChargeCalculation | null>(null)
  const [calculating, setCalculating] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function set(field: keyof FormData, value: string) {
    setForm(p => ({ ...p, [field]: value }))
    setCharge(null)
  }

  async function handleCalculate(e: React.FormEvent) {
    e.preventDefault()
    setCalculating(true)
    try {
      const payload = { ...form, length: Number(form.length), breadth: Number(form.breadth), height: Number(form.height), actualWeight: Number(form.actualWeight) }
      const res = await api.post('/orders/calculate', payload)
      setCharge(res.data.data)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setCalculating(false)
    }
  }

  async function handleConfirm() {
    setConfirming(true)
    try {
      const payload = { ...form, length: Number(form.length), breadth: Number(form.breadth), height: Number(form.height), actualWeight: Number(form.actualWeight) }
      const res = await api.post('/orders', payload)
      toast.success('Order placed successfully!')
      navigate(`/dashboard/orders/${res.data.data.id}`)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setConfirming(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-ghost p-2"><ArrowLeft size={18} /></button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Create Shipment</h1>
          <p className="text-sm text-gray-500">Fill in the details below to place your order</p>
        </div>
      </div>

      <form onSubmit={handleCalculate}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column — form */}
          <div className="lg:col-span-2 space-y-4">
            {/* Route */}
            <div className="card">
              <div className="card-header flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">1</div>
                <h2 className="text-sm font-semibold text-gray-800">Route Details</h2>
              </div>
              <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Pickup Address</label>
                  <div className="relative">
                    <input className="input pr-9" placeholder="Full pickup address"
                      value={form.pickupAddress} onChange={(e) => set('pickupAddress', e.target.value)} required />
                    <MapPin size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400" />
                  </div>
                </div>
                <div>
                  <label className="label">Pickup Pincode</label>
                  <input className="input" placeholder="e.g. 462001"
                    value={form.pickupPincode} onChange={(e) => set('pickupPincode', e.target.value)}
                    required pattern="\d{6}" maxLength={6} />
                </div>
                <div>
                  <label className="label">Drop Address</label>
                  <div className="relative">
                    <input className="input pr-9" placeholder="Full delivery address"
                      value={form.dropAddress} onChange={(e) => set('dropAddress', e.target.value)} required />
                    <MapPin size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="label">Drop Pincode</label>
                  <input className="input" placeholder="e.g. 452001"
                    value={form.dropPincode} onChange={(e) => set('dropPincode', e.target.value)}
                    required pattern="\d{6}" maxLength={6} />
                </div>
              </div>
            </div>

            {/* Package */}
            <div className="card">
              <div className="card-header flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">2</div>
                <h2 className="text-sm font-semibold text-gray-800">Package Details</h2>
              </div>
              <div className="card-body space-y-4">
                <div>
                  <label className="label">Dimensions (cm)</label>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <input className="input" type="number" step="0.1" min="0.1" placeholder="Length"
                        value={form.length} onChange={(e) => set('length', e.target.value)} required />
                      <p className="text-xs text-gray-400 mt-1 text-center">Length</p>
                    </div>
                    <div>
                      <input className="input" type="number" step="0.1" min="0.1" placeholder="Breadth"
                        value={form.breadth} onChange={(e) => set('breadth', e.target.value)} required />
                      <p className="text-xs text-gray-400 mt-1 text-center">Breadth</p>
                    </div>
                    <div>
                      <input className="input" type="number" step="0.1" min="0.1" placeholder="Height"
                        value={form.height} onChange={(e) => set('height', e.target.value)} required />
                      <p className="text-xs text-gray-400 mt-1 text-center">Height</p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Actual Weight (kg)</label>
                    <input className="input" type="number" step="0.01" min="0.01" placeholder="e.g. 2.4"
                      value={form.actualWeight} onChange={(e) => set('actualWeight', e.target.value)} required />
                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                      <Info size={11} /> Volumetric = L×B×H÷5000
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipment details */}
            <div className="card">
              <div className="card-header flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">3</div>
                <h2 className="text-sm font-semibold text-gray-800">Shipment Details</h2>
              </div>
              <div className="card-body grid grid-cols-2 gap-6">
                <div>
                  <label className="label">Order Type</label>
                  <div className="flex gap-2">
                    {(['B2B', 'B2C'] as const).map((t) => (
                      <button key={t} type="button" onClick={() => set('orderType', t)}
                        className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                          form.orderType === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'
                        }`}>{t}</button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">B2C: consumer · B2B: business</p>
                </div>
                <div>
                  <label className="label">Payment Type</label>
                  <div className="flex gap-2">
                    {(['PREPAID', 'COD'] as const).map((t) => (
                      <button key={t} type="button" onClick={() => set('paymentType', t)}
                        className={`flex-1 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${
                          form.paymentType === t ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-gray-500 border-gray-200 hover:border-orange-300'
                        }`}>{t === 'COD' ? 'Cash on Delivery' : 'Prepaid'}</button>
                    ))}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="label">Notes (optional)</label>
                  <input className="input" placeholder="Special delivery instructions..."
                    value={form.notes} onChange={(e) => set('notes', e.target.value)} />
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-sm" disabled={calculating}>
              {calculating ? <LoadingSpinner size="sm" /> : 'Calculate Delivery Charge →'}
            </button>
          </div>

          {/* Right column — charge summary */}
          <div className="lg:col-span-1">
            {charge ? (
              <div className="card sticky top-6">
                <div className="card-header">
                  <h2 className="text-sm font-semibold text-gray-800">Charge Summary</h2>
                </div>
                <div className="card-body space-y-3 text-sm">
                  <div className="flex justify-between text-gray-500">
                    <span>Actual Weight</span><span>{charge.actualWeight} kg</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Volumetric Weight</span><span>{charge.volumetricWeight} kg</span>
                  </div>
                  <div className="flex justify-between font-semibold text-gray-800">
                    <span>Billable Weight</span>
                    <span className="text-orange-500">{charge.billableWeight} kg</span>
                  </div>
                  <hr className="border-dashed border-gray-200" />
                  <div className="flex justify-between text-gray-500">
                    <span>Pickup Zone</span><span className="font-medium text-gray-700">{charge.pickupZoneName}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Drop Zone</span><span className="font-medium text-gray-700">{charge.dropZoneName}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>Zone Type</span>
                    <span className={`font-semibold ${charge.zoneType === 'INTRA' ? 'text-green-600' : 'text-blue-600'}`}>
                      {charge.zoneType === 'INTRA' ? 'Intra-Zone' : 'Inter-Zone'}
                    </span>
                  </div>
                  <hr className="border-dashed border-gray-200" />
                  <div className="flex justify-between text-gray-500">
                    <span>Base Delivery Charge</span><span>{formatCurrency(charge.baseCharge)}</span>
                  </div>
                  {charge.codSurcharge > 0 && (
                    <div className="flex justify-between text-gray-500">
                      <span>COD Surcharge</span><span>{formatCurrency(charge.codSurcharge)}</span>
                    </div>
                  )}
                  <hr className="border-gray-200" />
                  <div className="flex justify-between font-bold text-base">
                    <span>Total Amount</span>
                    <span className="text-orange-500">{formatCurrency(charge.totalCharge)}</span>
                  </div>

                  <button type="button" onClick={handleConfirm}
                    className="w-full mt-2 py-3 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                    disabled={confirming}>
                    {confirming ? <LoadingSpinner size="sm" /> : `Confirm & Create Order`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="card p-8 text-center border-dashed border-gray-200">
                <img src="/calculator.png" alt="calculator" className="h-20 w-auto mx-auto mb-3 object-contain"
                  style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))' }} />
                <p className="text-sm font-medium text-gray-500">Charge breakdown</p>
                <p className="text-xs text-gray-400 mt-1">Fill in the form and click Calculate to see the delivery charge here.</p>
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
