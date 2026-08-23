import { type OrderStatus } from '../types'

export function formatCurrency(amount: number): string {
  return '₹' + Number(amount).toFixed(2)
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatDateOnly(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function statusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    CONFIRMED: 'Confirmed',
    PICKED_UP: 'Picked Up',
    IN_TRANSIT: 'In Transit',
    OUT_FOR_DELIVERY: 'Out for Delivery',
    DELIVERED: 'Delivered',
    FAILED: 'Failed',
  }
  return labels[status] ?? status
}

export function statusBadgeClass(status: OrderStatus): string {
  const classes: Record<OrderStatus, string> = {
    CONFIRMED: 'badge-confirmed',
    PICKED_UP: 'badge-picked_up',
    IN_TRANSIT: 'badge-in_transit',
    OUT_FOR_DELIVERY: 'badge-out_for_delivery',
    DELIVERED: 'badge-delivered',
    FAILED: 'badge-failed',
  }
  return classes[status] ?? 'badge'
}

export function availabilityBadgeClass(a: string): string {
  if (a === 'AVAILABLE') return 'badge bg-green-50 text-green-700'
  if (a === 'BUSY') return 'badge bg-amber-50 text-amber-700'
  return 'badge bg-gray-100 text-gray-500'
}

export function getErrorMessage(err: unknown): string {
  if (axios_isAxiosError(err)) {
    return err.response?.data?.message ?? err.message ?? 'Something went wrong'
  }
  if (err instanceof Error) return err.message
  return 'Something went wrong'
}

function axios_isAxiosError(err: unknown): err is { response?: { data?: { message?: string } }; message?: string } {
  return typeof err === 'object' && err !== null && 'response' in err
}
