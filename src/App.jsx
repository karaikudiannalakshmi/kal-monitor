// src/App.jsx
import { AuthProvider, useAuth } from './hooks/useAuth.jsx'
import Login    from './pages/Login'
import StaffApp from './pages/StaffApp'
import AdminApp from './pages/AdminApp'
import { Spinner } from './components/UI'

function Router() {
  const { user, role, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user)   return <Login />
  if (role === 'admin') return <AdminApp />
  if (role === 'staff') return <StaffApp />
  // Fallback: unknown role
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh',
      flexDirection: 'column', gap: 12, fontFamily: 'sans-serif' }}>
      <div style={{ fontSize: 32 }}>⏳</div>
      <div style={{ color: '#7F8C8D' }}>Setting up your account…</div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
