import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { PassportProfile } from '../lib/passportTypes'
import {
  getSessionProfile,
  signInLocalOrRemote,
  signOutLocalOrRemote,
  signUpLocalOrRemote,
} from '../lib/passportApi'
import { supabase } from '../lib/supabase'

type AuthContextValue = {
  profile: PassportProfile | null
  loading: boolean
  refresh: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<PassportProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    const p = await getSessionProfile()
    setProfile(p)
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const p = await getSessionProfile()
        if (alive) setProfile(p)
      } finally {
        if (alive) setLoading(false)
      }
    })()

    if (!supabase) return () => {
      alive = false
    }

    const { data: sub } = supabase.auth.onAuthStateChange(async () => {
      const p = await getSessionProfile()
      if (alive) setProfile(p)
    })
    return () => {
      alive = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      loading,
      refresh,
      async signIn(email, password) {
        await signInLocalOrRemote(email, password)
        await refresh()
      },
      async signUp(email, password, fullName) {
        await signUpLocalOrRemote(email, password, fullName)
        await refresh()
      },
      async signOut() {
        await signOutLocalOrRemote()
        setProfile(null)
      },
    }),
    [profile, loading, refresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
