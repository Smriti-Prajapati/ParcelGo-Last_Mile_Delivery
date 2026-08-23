import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { LayoutDashboard, Package, PlusCircle, Search, LogOut, Menu, X } from 'lucide-react'
import { useAuthContext } from '../../App'
import Logo from '../ui/Logo'

export default function CustomerLayout() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  function handleLogout() { logout(); navigate('/login') }

  return (
    <div className="min-h-screen bg-transparent">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden md:flex items-center gap-1">
              {[
                { to: '/dashboard', label: 'Dashboard', end: true },
                { to: '/dashboard/orders', label: 'My Orders' },
                { to: '/track', label: 'Track Package' },
              ].map((item) => (
                <NavLink key={item.to} to={item.to} end={item.end}
                  className={({ isActive }) =>
                    `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive ? 'bg-orange-50 text-orange-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <NavLink to="/dashboard/orders/new" className="btn-primary hidden md:inline-flex">
              <PlusCircle size={16} /> New Order
            </NavLink>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-100">
              <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                <span className="text-xs font-bold text-orange-600">{user?.name?.charAt(0)}</span>
              </div>
              <span className="hidden md:block text-sm font-medium text-gray-700">{user?.name}</span>
            </div>
            <button onClick={handleLogout} className="btn-ghost p-2 text-gray-500" title="Sign out">
              <LogOut size={17} />
            </button>
            <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-1 border-t border-gray-100 pt-2">
            <NavLink to="/dashboard" end onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-700">Dashboard</NavLink>
            <NavLink to="/dashboard/orders" onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-gray-700">My Orders</NavLink>
            <NavLink to="/dashboard/orders/new" onClick={() => setMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm text-orange-600 font-semibold">+ New Order</NavLink>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-6 py-6">
        <Outlet />
      </main>
    </div>
  )
}
