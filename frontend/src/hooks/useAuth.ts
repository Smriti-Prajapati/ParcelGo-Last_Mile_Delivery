import { useState, useCallback } from 'react'
import { type User } from '../types'

function getStoredUser(): User | null {
  try {
    const stored = localStorage.getItem('parcelgo_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(getStoredUser)

  const login = useCallback((userData: User) => {
    localStorage.setItem('parcelgo_user', JSON.stringify(userData))
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('parcelgo_user')
    setUser(null)
  }, [])

  return { user, login, logout }
}
