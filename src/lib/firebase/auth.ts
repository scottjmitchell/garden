import { getAuth, GoogleAuthProvider, signInWithRedirect, getRedirectResult, signOut } from 'firebase/auth'
import { app } from './config'

export const auth = getAuth(app)
const provider = new GoogleAuthProvider()

export function signInWithGoogle() {
  return signInWithRedirect(auth, provider)
}

export function getGoogleRedirectResult() {
  return getRedirectResult(auth)
}

export function signOutUser() {
  return signOut(auth)
}
