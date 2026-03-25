import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { onAuthStateChanged, signOut as firebaseSignOut, type User } from 'firebase/auth'
import { auth, signInWithGoogle, signOutUser, getGoogleRedirectResult } from '../lib/firebase/auth'

interface AuthContextValue {
  user:    User | null
  loading: boolean
  signIn:  () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const SKIP_AUTH = import.meta.env.VITE_SKIP_AUTH === 'true'

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
    // Handle redirect result from signInWithRedirect
    getGoogleRedirectResult().catch(() => {})
    return onAuthStateChanged(auth, u => {
      setUser(u)
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
