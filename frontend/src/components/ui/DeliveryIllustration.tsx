interface Props {
  variant?: 'standing' | 'carrying' | 'scooter' | 'box'
  size?: number
  className?: string
}

const IMAGES = {
  carrying: 'https://img.icons8.com/3d-fluency/200/delivery.png',
  standing: 'https://img.icons8.com/3d-fluency/200/courier.png',
  scooter:  'https://img.icons8.com/3d-fluency/200/moped.png',
  box:      'https://img.icons8.com/3d-fluency/200/box.png',
}

export default function DeliveryIllustration({ variant = 'carrying', size = 160, className = '' }: Props) {
  const src = IMAGES[variant]
  return (
    <img
      src={src}
      alt="delivery illustration"
      width={size}
      height={size}
      className={`object-contain select-none pointer-events-none ${className}`}
      style={{ width: size, height: size }}
      onError={(e) => {
        // fallback to a different icons8 path if first fails
        const t = e.currentTarget
        if (!t.dataset.fallback) {
          t.dataset.fallback = '1'
          t.src = 'https://img.icons8.com/3d-fluency/160/delivery.png'
        }
      }}
    />
  )
}
