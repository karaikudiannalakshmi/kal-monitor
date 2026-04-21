// src/hooks/useAuth.js
import { createContext, useContext, useEffect, useState } from 'react'
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signOut,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../firebase/config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [role, setRole]       = useState(null) // 'admin' | 'staff' | null
  const [staffDoc, setStaffDoc] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) { setUser(null); setRole(null); setStaffDoc(null); setLoading(false); return }
      setUser(u)
      // Check admin
      const adminSnap = await getDoc(doc(db, 'admins', u.uid))
      if (adminSnap.exists()) { setRole('admin'); setLoading(false); return }
      // Check staff
      const staffSnap = await getDoc(doc(db, 'staff', u.uid))
      if (staffSnap.exists()) {
        setRole('staff'); setStaffDoc({ id: u.uid, ...staffSnap.data() })
      } else {
        // New phone user — create minimal staff doc
        const newStaff = { name: u.displayName || u.phoneNumber, phone: u.phoneNumber, active: true, createdAt: new Date().toISOString() }
        await setDoc(doc(db, 'staff', u.uid), newStaff)
        setRole('staff'); setStaffDoc({ id: u.uid, ...newStaff })
      }
      setLoading(false)
    })
    return unsub
  }, [])

  // Google sign-in (admin)
  const loginGoogle = async () => {
    const provider = new GoogleAuthProvider()
    await signInWithPopup(auth, provider)
  }

  // Phone OTP — step 1: send OTP
  const sendOtp = async (phoneNumber, recaptchaContainerId) => {
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainerId, {
        size: 'invisible',
        callback: () => {},
      })
    }
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier)
    window.confirmationResult = confirmationResult
    return confirmationResult
  }

  // Phone OTP — step 2: verify
  const verifyOtp = async otp => {
    if (!window.confirmationResult) throw new Error('No OTP sent')
    return window.confirmationResult.confirm(otp)
  }

  const logout = () => {
    window.recaptchaVerifier = null
    window.confirmationResult = null
    return signOut(auth)
  }

  return (
    <AuthContext.Provider value={{ user, role, staffDoc, loading, loginGoogle, sendOtp, verifyOtp, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
