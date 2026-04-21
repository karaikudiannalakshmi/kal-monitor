// src/components/UI.jsx
import { COLORS as C } from '../utils/constants'

export function Card({ children, style }) {
  return (
    <div style={{
      background: C.card, borderRadius: 14, border: `1px solid ${C.border}`,
      boxShadow: '0 2px 10px #0000000a', padding: 16, ...style,
    }}>{children}</div>
  )
}

export function Btn({ onClick, children, variant = 'primary', small, full, style, disabled, type = 'button' }) {
  const base = {
    border: 'none', borderRadius: 10, cursor: disabled ? 'not-allowed' : 'pointer',
    fontWeight: 700, fontSize: small ? 12 : 14,
    padding: small ? '6px 14px' : '11px 20px',
    width: full ? '100%' : 'auto',
    transition: 'all .15s', opacity: disabled ? 0.5 : 1,
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    ...style,
  }
  const v = {
    primary: { background: C.primary,  color: '#fff' },
    accent:  { background: C.accent,   color: '#fff' },
    ghost:   { background: 'transparent', color: C.primary, border: `1.5px solid ${C.primary}` },
    danger:  { background: '#fff0f0',   color: C.primary, border: `1px solid ${C.primary}44` },
    green:   { background: C.green,    color: '#fff' },
    orange:  { background: C.absent,   color: '#fff' },
    blue:    { background: C.voice,    color: '#fff' },
    red:     { background: C.lateRed,  color: '#fff' },
    dark:    { background: C.text,     color: '#fff' },
  }
  return (
    <button type={type} style={{ ...base, ...(v[variant] || v.primary) }}
      onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export function Inp({ value, onChange, placeholder, style, type = 'text', inputMode, maxLength }) {
  return (
    <input
      type={type} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} inputMode={inputMode} maxLength={maxLength}
      style={{
        border: `1.5px solid ${C.border}`, borderRadius: 10, padding: '12px 14px',
        fontSize: 15, color: C.text, background: C.bg, outline: 'none',
        width: '100%', boxSizing: 'border-box', ...style,
      }}
    />
  )
}

export function Badge({ color, children, small }) {
  return (
    <span style={{
      background: color + '22', color, border: `1px solid ${color}55`,
      borderRadius: 20, padding: small ? '1px 8px' : '2px 10px',
      fontSize: small ? 10 : 11, fontWeight: 700, whiteSpace: 'nowrap', letterSpacing: 0.4,
    }}>{children}</span>
  )
}

export function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        border: `4px solid ${C.border}`, borderTopColor: C.primary,
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}

export function Avatar({ name = '?', color = C.primary, size = 38 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', background: color,
      color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.42, flexShrink: 0,
    }}>{name[0]?.toUpperCase()}</div>
  )
}

export function SectionHead({ children }) {
  return (
    <div style={{ fontWeight: 700, fontSize: 13, color: C.muted, letterSpacing: 1,
      textTransform: 'uppercase', margin: '20px 0 10px' }}>
      {children}
    </div>
  )
}

export function ProgressBar({ value, max, color }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: C.muted }}>{value}/{max}</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: pct === 100 ? C.green : color || C.primary }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 4, background: C.border, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 4,
          background: pct === 100 ? C.green : color || C.primary,
          transition: 'width .4s',
        }} />
      </div>
    </div>
  )
}
