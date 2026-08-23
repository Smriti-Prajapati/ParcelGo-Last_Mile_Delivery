import { Package } from 'lucide-react'

interface Props {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dark' | 'light'
}

export default function Logo({ size = 'md', variant = 'dark' }: Props) {
  const textClass = variant === 'light' ? 'text-white' : 'text-gray-900'
  const iconSize = size === 'sm' ? 18 : size === 'lg' ? 28 : 22

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-500">
        <Package size={iconSize - 4} className="text-white" />
      </div>
      <div>
        <span className={`font-bold tracking-tight ${size === 'lg' ? 'text-xl' : 'text-base'} ${textClass}`}>
          ParcelGo
        </span>
        {size === 'lg' && (
          <p className="text-xs text-gray-400 -mt-0.5">Last-Mile Delivery</p>
        )}
      </div>
    </div>
  )
}
