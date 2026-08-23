import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Package, MapPin, CreditCard, Truck, Users,
  LogOut, Menu, X, ChevronRight,
} from 'lucide-react'
import { useAuthContext } from '../../App'
import Logo from '../ui/Logo'

const navItems = [
  { to: '/admin',            label: 'Dashboard',        icon: LayoutDashboard, exact: true },
  { to: '/admin/orders',     label: 'Orders',            icon: Package },
  { to: '/admin/agents',     label: 'Delivery Agents',   icon: Truck },
  { to: '/admin/zones',      label: 'Zones',             icon: MapPin },
  { to: '/admin/rates',      label: 'Rate Cards',        icon: CreditCard },
  { to: '/admin/customers',  label: 'Customers',         icon: Users },
]

export default function AdminLayout() {
  const { user, logout } = useAuthContext()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  function handleLogout() { logout(); navigate('/login') }

  return (
    <div className="flex h-screen bg-transparent">
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-30 w-60 bg-white/90 backdrop-blur-sm border-r border-gray-100 flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="flex items-center justify-between px-5 h-16 border-b border-gray-100">
          <Logo />
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-orange-50 text-orange-600'
                    : 'text-gray-600 hover:bg-orange-50/50 hover:text-gray-900'
                }`
              }>
              <item.icon size={17} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Delivery man — fills the bottom space */}
        <div className="flex-1 flex items-end justify-center overflow-hidden px-2">
          <img
            src="/delivery-man.png"
            alt="delivery agent"
            className="object-contain w-full"
            style={{ 
              height: '260px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))'
            }}
          />
        </div>

        <div className="px-3 pb-3 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-orange-600">{user?.name?.charAt(0).toUpperCase()}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
            <LogOut size={17} /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex items-center gap-4 px-6">
          <button className="lg:hidden text-gray-500 hover:text-gray-700" onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-1 text-sm text-gray-400">
            <span>Admin</span>
            <ChevronRight size={14} />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
