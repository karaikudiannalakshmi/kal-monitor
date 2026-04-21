// src/pages/Login.jsx
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { COLORS as C, TA } from '../utils/constants'
import { Btn, Inp, Card } from '../components/UI'

export default function Login() {
  const { sendOtp, verifyOtp, loginGoogle } = useAuth()
  const [step, setStep]     = useState('phone') // phone | otp
  const [phone, setPhone]   = useState('+91')
  const [otp, setOtp]       = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]   = useState('')

  const handleSendOtp = async () => {
    setError('')
    if (phone.length < 10) { setError('சரியான தொலைபேசி எண் உள்ளிடுக'); return }
    setLoading(true)
    try {
      await sendOtp(phone, 'recaptcha-container')
      setStep('otp')
    } catch (e) {
      setError('OTP அனுப்ப முடியவில்லை. மீண்டும் முயலவும்.')
    }
    setLoading(false)
  }

  const handleVerify = async () => {
    setError('')
    setLoading(true)
    try {
      await verifyOtp(otp)
    } catch {
      setError('OTP தவறானது. மீண்டும் முயலவும்.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      {/* Logo area */}
      <div style={{ textAlign: 'center', marginBottom: 32 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🍽️</div>
        <div className="ta" style={{ fontWeight: 800, fontSize: 22, color: C.primary }}>{TA.appName}</div>
        <div className="ta" style={{ fontSize: 13, color: C.muted, marginTop: 4 }}>{TA.appSub}</div>
      </div>

      <Card style={{ width: '100%', maxWidth: 380, padding: 28 }}>
        {step === 'phone' ? (
          <>
            <div className="ta" style={{ fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 6 }}>
              {TA.loginTitle}
            </div>
            <div className="ta" style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
              உங்கள் தொலைபேசி எண்ணை உள்ளிடுக
            </div>
            <Inp
              value={phone}
              onChange={setPhone}
              placeholder="+91 98765 43210"
              type="tel"
              inputMode="tel"
              style={{ fontSize: 18, letterSpacing: 1, marginBottom: 14 }}
            />
            {error && <div className="ta" style={{ color: C.lateRed, fontSize: 13, marginBottom: 10 }}>{error}</div>}
            <Btn full onClick={handleSendOtp} disabled={loading}>
              {loading ? 'அனுப்புகிறது…' : TA.sendOtp}
            </Btn>

            <div style={{ textAlign: 'center', margin: '20px 0', color: C.muted, fontSize: 12 }}>— அல்லது —</div>

            <Btn full variant="ghost" onClick={loginGoogle}>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {TA.adminLogin}
            </Btn>
          </>
        ) : (
          <>
            <div className="ta" style={{ fontWeight: 700, fontSize: 18, color: C.text, marginBottom: 6 }}>
              {TA.enterOtp}
            </div>
            <div className="ta" style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>
              {TA.otpSent}
            </div>
            <div style={{ fontSize: 13, color: C.text, fontWeight: 600, marginBottom: 20 }}>{phone}</div>
            <Inp
              value={otp}
              onChange={setOtp}
              placeholder="• • • • • •"
              type="tel"
              inputMode="numeric"
              maxLength={6}
              style={{ fontSize: 28, letterSpacing: 8, textAlign: 'center', marginBottom: 14 }}
            />
            {error && <div className="ta" style={{ color: C.lateRed, fontSize: 13, marginBottom: 10 }}>{error}</div>}
            <Btn full onClick={handleVerify} disabled={loading || otp.length < 4}>
              {loading ? 'சரிபார்க்கிறது…' : TA.verify}
            </Btn>
            <Btn full variant="ghost" style={{ marginTop: 10 }} onClick={() => { setStep('phone'); setOtp(''); setError('') }}>
              {TA.back}
            </Btn>
          </>
        )}
      </Card>

      {/* Invisible recaptcha container */}
      <div id="recaptcha-container" />
    </div>
  )
}
