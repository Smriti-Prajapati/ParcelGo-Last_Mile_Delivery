export interface User {
  userId: number
  name: string
  email: string
  role: 'ADMIN' | 'CUSTOMER' | 'AGENT'
  token: string
}

export interface Order {
  id: number
  trackingId: string
  customerId: number
  customerName: string
  customerEmail: string
  agentId: number | null
  agentName: string | null
  agentPhone: string | null
  pickupAddress: string
  pickupPincode: string
  dropAddress: string
  dropPincode: string
  pickupZoneName: string
  dropZoneName: string
  length: number
  breadth: number
  height: number
  actualWeight: number
  volumetricWeight: number
  billableWeight: number
  orderType: 'B2B' | 'B2C'
  paymentType: 'PREPAID' | 'COD'
  baseCharge: number
  codSurcharge: number
  totalCharge: number
  status: OrderStatus
  scheduledDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
}

export type OrderStatus =
  | 'CONFIRMED'
  | 'PICKED_UP'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'FAILED'

export interface OrderTracking {
  id: number
  orderId: number
  status: OrderStatus
  actorId: number
  actorName: string
  notes: string | null
  createdAt: string
}

export interface ChargeCalculation {
  actualWeight: number
  volumetricWeight: number
  billableWeight: number
  pickupZoneName: string
  dropZoneName: string
  zoneType: string
  baseCharge: number
  codSurcharge: number
  totalCharge: number
  orderType: string
  paymentType: string
}

export interface Zone {
  id: number
  name: string
  description: string | null
  areas: ZoneArea[]
  createdAt: string
}

export interface ZoneArea {
  id: number
  pincode: string
  areaName: string
}

export interface RateCard {
  id: number
  name: string
  orderType: 'B2B' | 'B2C'
  zoneType: 'INTRA' | 'INTER'
  minWeight: number
  maxWeight: number
  ratePerKg: number
  baseCharge: number
  active: boolean
}

export interface CodSurcharge {
  id: number
  orderType: 'B2B' | 'B2C'
  surchargeAmount: number
}

export interface DeliveryAgent {
  id: number
  userId: number
  name: string
  email: string
  phone: string | null
  zoneId: number | null
  zoneName: string | null
  latitude: number | null
  longitude: number | null
  availability: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  vehicleNumber: string | null
}

export interface DashboardStats {
  totalOrders: number
  confirmed: number
  pickedUp: number
  inTransit: number
  outForDelivery: number
  delivered: number
  failed: number
  codOrders: number
  revenue: number
  availableAgents: number
}

export interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T
}
