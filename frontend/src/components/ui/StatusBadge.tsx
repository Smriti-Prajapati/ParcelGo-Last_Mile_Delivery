import { type OrderStatus } from '../../types'
import { statusBadgeClass, statusLabel } from '../../lib/utils'

interface Props {
  status: OrderStatus
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={statusBadgeClass(status)}>
      {statusLabel(status)}
    </span>
  )
}
