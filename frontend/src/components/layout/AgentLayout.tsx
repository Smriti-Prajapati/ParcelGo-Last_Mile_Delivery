import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, Package, LogOut } from 'lucide-react'
import { useAuthContext } from '../../App'
import Logo from '../ui/Logo'

export default function AgentLayout() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-transparent">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-1">
            <NavLink
              to="/agent"
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600'}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/agent/orders"
              className={({ isActive }) =>
                `px-3 py-2 rounded-lg text-sm font-medium ${isActive ? 'bg-brand-50 text-brand-600' : 'text-gray-600'}`
              }
            >
              My Orders
            </NavLink>
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800">{user?.name}</p>
              <p className="text-xs text-gray-400">Delivery Agent</p>
            </div>
            <button onClick={handleLogout} className="btn-ghost text-gray-500" title="Sign out">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
