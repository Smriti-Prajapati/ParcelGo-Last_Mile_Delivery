import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ChevronRight } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../lib/api'
import { useAuthContext } from '../App'
import Logo from '../components/ui/Logo'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { getErrorMessage } from '../lib/utils'
export default function LoginPage() {
  const { login } = useAuthContext()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showDemo, setShowDemo] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', form)
      const user = res.data.data
      login(user)
      if (user.role === 'ADMIN') navigate('/admin')
      else if (user.role === 'AGENT') navigate('/agent')
      else navigate('/dashboard')
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f8f5f2' }}>

      {/* Left panel — truck background image with text overlay */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-no-repeat"
          style={{ 
            backgroundImage: "url('/delivery-truck.png')", 
            backgroundSize: 'cover',
            backgroundPosition: 'center bottom'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/85 via-white/50 to-transparent" />

        <div className="relative z-10 flex flex-col justify-between p-10 w-full">
          <Logo size="lg" />

          <div className="max-w-xs">
            <h2 className="text-4xl font-black text-gray-900 leading-tight mb-1">Delivering trust,</h2>
            <h2 className="text-4xl font-black text-orange-500 leading-tight mb-4">every mile.</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Manage orders, track deliveries, and streamline your last-mile operations from one powerful platform.
            </p>
          </div>

          <div />
        </div>
      </div>

      {/* Right panel — login form */}
      <div className="flex-1 lg:max-w-[440px] flex flex-col justify-center px-8 py-12 bg-white">
        <div className="max-w-sm mx-auto w-full">

          {/* Mobile only logo */}
          <div className="lg:hidden mb-8">
            <Logo size="lg" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome</h1>
          <p className="text-sm text-gray-500 mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                className="input"
                placeholder="you@company.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  className="input pr-10"
                  placeholder="••••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors shadow-sm flex items-center justify-center gap-2"
              disabled={loading}
            >
              {loading ? <LoadingSpinner size="sm" /> : 'Sign in'}
            </button>
          </form>

          <p className="text-sm text-center text-gray-500 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-orange-500 font-semibold hover:underline">Sign up</Link>
          </p>

          {/* Demo access */}
          <div className="mt-6 rounded-xl border border-gray-100 overflow-hidden">
            <button
              onClick={() => setShowDemo(!showDemo)}
              className="w-full flex items-center justify-between px-4 py-3 bg-orange-50 hover:bg-orange-100 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">D</span>
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-gray-800">Demo Access</p>
                  <p className="text-xs text-gray-500">Try ParcelGo with demo accounts</p>
                </div>
              </div>
              <ChevronRight size={14} className={`text-orange-500 transition-transform ${showDemo ? 'rotate-90' : ''}`} />
            </button>

            {showDemo && (
              <div className="px-4 pb-4 pt-3 space-y-2 bg-white">
                {[
                  { label: 'Admin',    email: 'admin@parcelgo.in',    desc: 'Full platform access' },
                  { label: 'Agent',    email: 'agent@parcelgo.in',    desc: 'Delivery agent view' },
                  { label: 'Customer', email: 'customer@example.com', desc: 'Customer portal' },
                ].map((d) => (
                  <button
                    key={d.label}
                    type="button"
                    onClick={() => setForm({ email: d.email, password: 'password' })}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-colors text-left"
                  >
                    <div>
                      <p className="text-xs font-semibold text-gray-700">{d.label}</p>
                      <p className="text-xs text-gray-400">{d.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">{d.desc}</span>
                  </button>
                ))}
                <p className="text-xs text-gray-400 text-center pt-1">
                  Password: <span className="font-mono font-semibold text-gray-600">password</span>
                </p>
              </div>
            )}
          </div>

          <p className="text-xs text-center text-gray-400 mt-4">
            <Link to="/track" className="hover:text-orange-500 hover:underline">
              Track a package without login →
            </Link>
          </p>
        </div>
      </div>

    </div>
  )
}
