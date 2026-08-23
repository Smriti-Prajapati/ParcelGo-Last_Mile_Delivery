import { useState } from 'react'

interface Props {
  src: string
  alt?: string
  size?: number
  className?: string
  fallbackIcon?: React.ReactNode
}

export default function Img3D({ src, alt = '', size = 120, className = '', fallbackIcon }: Props) {
  const [failed, setFailed] = useState(false)

  if (failed && fallbackIcon) {
    return <div style={{ width: size, height: size }} className={`flex items-center justify-center ${className}`}>{fallbackIcon}</div>
  }

  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain select-none pointer-events-none drop-shadow-sm ${className}`}
      style={{ width: size, height: size }}
      onError={() => setFailed(true)}
    />
  )
}
