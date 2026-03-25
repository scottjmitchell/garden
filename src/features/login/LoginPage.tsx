import { useEffect } from 'react'
import { useAuth } from '../../app/AuthProvider'
import { useNavigate } from 'react-router-dom'

export function LoginPage() {
  const { signIn, user, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) navigate('/', { replace: true })
  }, [user, loading])

  async function handleSignIn() {
    await signIn()
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-garden-bg px-4">
      <h1 className="mb-2 font-display text-4xl text-amber">The Mitchell Garden</h1>
      <p className="mb-10 text-sm text-garden-text/50">Summer 2026</p>
      <button
        onClick={handleSignIn}
        className="flex items-center gap-3 rounded border border-white/20 bg-white/5 px-5 py-3 text-sm text-garden-text transition hover:bg-white/10"
      >
        <GoogleIcon />
        Sign in with Google
      </button>
    </div>
  )
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
    </svg>
  )
}
