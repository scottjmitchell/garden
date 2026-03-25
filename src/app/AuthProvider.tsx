import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth, signInWithGoogle, signOutUser } from '../lib/firebase/auth'

interface AuthContextValue {
  user:    User | null
  loading: boolean
  signIn:  () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SKIP_AUTH      = import.meta.env.VITE_SKIP_AUTH === 'true'
const ALLOWED_EMAILS = new Set(
  (import.meta.env.VITE_ALLOWED_EMAILS ?? '').split(',').map((e: string) => e.trim()).filter(Boolean)
)

// Fake user used in dev/test when VITE_SKIP_AUTH=true
const DEV_USER = { displayName: 'Dev User', email: 'dev@local', uid: 'dev' } as User

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]       = useState<User | null>(SKIP_AUTH ? DEV_USER : null)
  const [loading, setLoading] = useState(!SKIP_AUTH)

  useEffect(() => {
    if (SKIP_AUTH) {
      // Explicitly settle Firebase Auth state to null so the RTDB SDK
      // doesn't buffer write operations waiting for auth to resolve.
      firebaseSignOut(auth)
      return
    }
    return onAuthStateChanged(auth, u => {
      if (u && ALLOWED_EMAILS.size > 0 && !ALLOWED_EMAILS.has(u.email ?? '')) {
        firebaseSignOut(auth)
        setUser(null)
      } else {
        setUser(u)
      }
      setLoading(false)
    })
  }, [])

  async function signIn() {
    await signInWithGoogle()
  }

  async function signOut() {
    await signOutUser()
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
