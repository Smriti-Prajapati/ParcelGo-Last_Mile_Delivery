interface SvgProps {
  size?: number
  className?: string
}

export function DeliveryManSvg({ size = 120, className = '' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="60" cy="32" r="18" fill="#FFDBB5"/>
      <ellipse cx="60" cy="31" rx="19" ry="10" fill="#C2410C"/>
      <rect x="41" y="24" width="38" height="8" rx="4" fill="#EA580C"/>
      <circle cx="53" cy="34" r="3" fill="#1C1917"/>
      <circle cx="67" cy="34" r="3" fill="#1C1917"/>
      <circle cx="54" cy="33" r="1" fill="white"/>
      <circle cx="68" cy="33" r="1" fill="white"/>
      <path d="M54 42 Q60 47 66 42" stroke="#C2410C" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
      <ellipse cx="47" cy="40" rx="4" ry="2.5" fill="#FBB0A0" opacity="0.5"/>
      <ellipse cx="73" cy="40" rx="4" ry="2.5" fill="#FBB0A0" opacity="0.5"/>
      <rect x="38" y="48" width="44" height="46" rx="10" fill="#F97316"/>
      <rect x="20" y="55" width="20" height="10" rx="5" fill="#F97316" transform="rotate(-15 20 55)"/>
      <rect x="82" y="52" width="20" height="10" rx="5" fill="#F97316" transform="rotate(15 82 52)"/>
      <rect x="86" y="44" width="22" height="20" rx="4" fill="#F5C07A"/>
      <rect x="88" y="46" width="18" height="16" rx="3" fill="#FCD34D"/>
      <rect x="96" y="46" width="2" height="16" fill="#F5C07A"/>
      <rect x="88" y="53" width="18" height="2" fill="#F5C07A"/>
      <rect x="46" y="90" width="14" height="20" rx="7" fill="#1C1917"/>
      <rect x="62" y="90" width="14" height="20" rx="7" fill="#1C1917"/>
      <ellipse cx="53" cy="110" rx="11" ry="5" fill="#111"/>
      <ellipse cx="69" cy="110" rx="11" ry="5" fill="#111"/>
    </svg>
  )
}

export function BoxStackSvg({ size = 80, className = '' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="20" y="42" width="40" height="30" rx="3" fill="#D97706"/>
      <rect x="22" y="44" width="36" height="26" rx="2" fill="#FCD34D"/>
      <rect x="38" y="44" width="4" height="26" fill="#D97706"/>
      <rect x="22" y="56" width="36" height="3" fill="#D97706"/>
      <rect x="12" y="18" width="36" height="28" rx="3" fill="#EA580C"/>
      <rect x="14" y="20" width="32" height="24" rx="2" fill="#FB923C"/>
      <rect x="29" y="20" width="3" height="24" fill="#EA580C"/>
      <rect x="14" y="31" width="32" height="3" fill="#EA580C"/>
      <rect x="42" y="10" width="24" height="20" rx="3" fill="#F97316"/>
      <rect x="44" y="12" width="20" height="16" rx="2" fill="#FED7AA"/>
      <rect x="53" y="12" width="2" height="16" fill="#F97316"/>
      <rect x="44" y="19" width="20" height="2" fill="#F97316"/>
    </svg>
  )
}

export function ScooterSvg({ size = 80, className = '' }: SvgProps) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="35" y="35" width="55" height="22" rx="8" fill="#F97316"/>
      <rect x="48" y="22" width="35" height="18" rx="7" fill="#EA580C"/>
      <circle cx="38" cy="56" r="12" fill="#292524"/>
      <circle cx="38" cy="56" r="7" fill="#44403C"/>
      <circle cx="38" cy="56" r="3" fill="#A8A29E"/>
      <circle cx="88" cy="56" r="12" fill="#292524"/>
      <circle cx="88" cy="56" r="7" fill="#44403C"/>
      <circle cx="88" cy="56" r="3" fill="#A8A29E"/>
      <circle cx="68" cy="18" r="10" fill="#FFDBB5"/>
      <path d="M58 14 Q68 5 78 14" fill="#C2410C"/>
      <rect x="56" y="10" width="24" height="6" rx="3" fill="#C2410C"/>
      <circle cx="63" cy="19" r="2" fill="#1C1917"/>
      <circle cx="73" cy="19" r="2" fill="#1C1917"/>
      <rect x="56" y="26" width="28" height="18" rx="7" fill="#F97316"/>
      <rect x="82" y="14" width="20" height="16" rx="3" fill="#F5C07A"/>
      <rect x="84" y="16" width="16" height="12" rx="2" fill="#FCD34D"/>
      <rect x="91" y="16" width="2" height="12" fill="#F5C07A"/>
      <rect x="84" y="21" width="16" height="2" fill="#F5C07A"/>
      <line x1="5" y1="42" x2="28" y2="42" stroke="#FED7AA" strokeWidth="2" strokeLinecap="round"/>
      <line x1="8" y1="50" x2="28" y2="50" stroke="#FED7AA" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

export function TruckSvg({ size = 80, className = '' }: SvgProps) {
  return (
    <svg width={size} height={size * 0.6} viewBox="0 0 120 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="5" y="20" width="75" height="40" rx="4" fill="#F97316"/>
      <rect x="80" y="30" width="30" height="30" rx="4" fill="#EA580C"/>
      <rect x="82" y="32" width="26" height="20" rx="3" fill="#BAE6FD"/>
      <circle cx="22" cy="62" r="8" fill="#292524"/>
      <circle cx="22" cy="62" r="4" fill="#78716C"/>
      <circle cx="92" cy="62" r="8" fill="#292524"/>
      <circle cx="92" cy="62" r="4" fill="#78716C"/>
      <rect x="8" y="23" width="40" height="25" rx="2" fill="#FED7AA" opacity="0.4"/>
      <rect x="8" y="52" width="105" height="4" rx="2" fill="#C2410C"/>
    </svg>
  )
}

export function MapPinSvg({ size = 80, className = '' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="5" y="5" width="70" height="70" rx="12" fill="#DCFCE7"/>
      <path d="M20 30 L60 30 L60 55 L40 65 L20 55 Z" fill="#BBF7D0"/>
      <path d="M20 30 L40 40 L60 30" stroke="#86EFAC" strokeWidth="1.5" fill="none"/>
      <path d="M40 30 L40 55" stroke="#86EFAC" strokeWidth="1" strokeDasharray="3 2"/>
      <circle cx="53" cy="22" r="10" fill="#F97316"/>
      <path d="M53 30 L53 34" stroke="#F97316" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="53" cy="20" r="4" fill="white"/>
      <circle cx="53" cy="20" r="2" fill="#F97316"/>
    </svg>
  )
}

export function CheckBadgeSvg({ size = 48, className = '' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="22" fill="#DCFCE7"/>
      <circle cx="24" cy="24" r="16" fill="#22C55E"/>
      <path d="M16 24 L21 29 L32 18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function FailBadgeSvg({ size = 48, className = '' }: SvgProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <circle cx="24" cy="24" r="22" fill="#FEE2E2"/>
      <circle cx="24" cy="24" r="16" fill="#EF4444"/>
      <path d="M18 18 L30 30 M30 18 L18 30" stroke="white" strokeWidth="3" strokeLinecap="round"/>
    </svg>
  )
}
