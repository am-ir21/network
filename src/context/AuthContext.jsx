import React, { createContext, useContext, useState } from 'react'
import { supabase } from '../supabaseClient'

const AuthContext = createContext(null)
const SESSION_KEY = 'subtrack_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState('')

  const login = async (username, password) => {
    setAuthLoading(true)
    setAuthError('')
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, username, password, role')
        .eq('username', username.trim())
        .maybeSingle()

      if (error) throw error

      if (!data || data.password !== password) {
        setAuthError('invalid')
        return false
      }

      const sessionUser = { id: data.id, username: data.username, role: data.role }
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
      setUser(sessionUser)
      return true
    } catch (err) {
      console.error('Login error:', err)
      setAuthError('invalid')
      return false
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, authLoading, authError, isAdmin: user?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
