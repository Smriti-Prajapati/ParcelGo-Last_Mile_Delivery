import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, createContext, useContext } from 'react'
import { type User } from './types'
import { useAuth } from './hooks/useAuth'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import TrackPage from './pages/TrackPage'

import AdminLayout from './components/layout/AdminLayout'
import AdminDashboard from './pages/admin/Dashboard'
import AdminOrders from './pages/admin/Orders'
import AdminZones from './pages/admin/Zones'
import AdminRates from './pages/admin/Rates'
import AdminAgents from './pages/admin/Agents'
import AdminCustomers from './pages/admin/Customers'
import OrderDetail from './pages/admin/OrderDetail'

import CustomerLayout from './components/layout/CustomerLayout'
import CustomerDashboard from './pages/customer/Dashboard'
import CustomerOrders from './pages/customer/Orders'
import CustomerCreateOrder from './pages/customer/CreateOrder'
import CustomerOrderDetail from './pages/customer/OrderDetail'

import AgentLayout from './components/layout/AgentLayout'
import AgentDashboard from './pages/agent/Dashboard'
import AgentOrders from './pages/agent/Orders'
import AgentOrderDetail from './pages/agent/OrderDetail'

interface AuthContextType {
  user: User | null
  login: (u: User) => void
  logout: () => void
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
})

export function useAuthContext() {
  return useContext(AuthContext)
}

function RequireAuth({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user } = useAuthContext()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/track/:trackingId?" element={<TrackPage />} />

        <Route path="/admin" element={<RequireAuth role="ADMIN"><AdminLayout /></RequireAuth>}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="zones" element={<AdminZones />} />
          <Route path="rates" element={<AdminRates />} />
          <Route path="agents" element={<AdminAgents />} />
          <Route path="customers" element={<AdminCustomers />} />
        </Route>

        <Route path="/dashboard" element={<RequireAuth role="CUSTOMER"><CustomerLayout /></RequireAuth>}>
          <Route index element={<CustomerDashboard />} />
          <Route path="orders" element={<CustomerOrders />} />
          <Route path="orders/new" element={<CustomerCreateOrder />} />
          <Route path="orders/:id" element={<CustomerOrderDetail />} />
        </Route>

        <Route path="/agent" element={<RequireAuth role="AGENT"><AgentLayout /></RequireAuth>}>
          <Route index element={<AgentDashboard />} />
          <Route path="orders" element={<AgentOrders />} />
          <Route path="orders/:id" element={<AgentOrderDetail />} />
        </Route>

        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthContext.Provider>
  )
}

function RootRedirect() {
  const { user } = useAuthContext()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'ADMIN') return <Navigate to="/admin" replace />
  if (user.role === 'AGENT') return <Navigate to="/agent" replace />
  return <Navigate to="/dashboard" replace />
}
