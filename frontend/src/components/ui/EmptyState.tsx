import { PackageOpen } from 'lucide-react'

interface Props {
  title: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({ title, description, action }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center mb-4">
        <PackageOpen className="w-7 h-7 text-brand-400" />
      </div>
      <p className="text-base font-medium text-gray-800 mb-1">{title}</p>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {action}
    </div>
  )
}
