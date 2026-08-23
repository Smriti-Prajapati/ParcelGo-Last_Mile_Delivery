// All 3D illustration URLs from Icons8 3D Fluency pack
// Free to use with attribution: https://icons8.com/license

export const IMG = {
  // Main characters
  deliveryMan:    'https://img.icons8.com/3d-fluency/200/delivery.png',
  courier:        'https://img.icons8.com/3d-fluency/200/courier.png',

  // Vehicles
  scooter:        'https://img.icons8.com/3d-fluency/200/scooter.png',
  deliveryTruck:  'https://img.icons8.com/3d-fluency/200/delivery-truck.png',

  // Packages
  box:            'https://img.icons8.com/3d-fluency/200/box.png',
  openBox:        'https://img.icons8.com/3d-fluency/200/opened-box.png',
  parcel:         'https://img.icons8.com/3d-fluency/200/parcel.png',

  // Location & tracking
  locationPin:    'https://img.icons8.com/3d-fluency/200/marker.png',
  trackingMap:    'https://img.icons8.com/3d-fluency/200/map.png',

  // Status icons
  delivered:      'https://img.icons8.com/3d-fluency/96/ok.png',
  inTransit:      'https://img.icons8.com/3d-fluency/96/in-transit.png',
  failed:         'https://img.icons8.com/3d-fluency/96/cancel.png',

  // Misc
  bell:           'https://img.icons8.com/3d-fluency/96/appointment-reminders.png',
  clock:          'https://img.icons8.com/3d-fluency/96/clock.png',
  wallet:         'https://img.icons8.com/3d-fluency/96/wallet.png',
  checklist:      'https://img.icons8.com/3d-fluency/96/checklist.png',
}

// Fallback to lucide icon if image fails — handled per component
export function imgWithFallback(src: string, fallback: string) {
  return src
}
