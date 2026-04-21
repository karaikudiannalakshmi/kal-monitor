// src/components/VoiceNote.jsx
import { useState, useRef, useEffect } from 'react'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { doc, setDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { storage, db } from '../firebase/config'
import { COLORS as C, TA } from '../utils/constants'
import { Btn } from './UI'

const fmtSecs = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

// ── Recording wave animation ──────────────────────────────────────────────────
function Wave() {
  return (
    <div style={{ display: 'flex', gap: 3, alignItems: 'center', height: 24 }}>
      {[0,1,2,3,4].map(i => (
        <div key={i} style={{
          width: 4, background: C.lateRed, borderRadius: 2,
          animation: `wave 0.7s ease-in-out ${i * 0.12}s infinite alternate`,
        }} />
      ))}
      <style>{`@keyframes wave{from{height:4px}to{height:22px}}`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// VoiceNote: handles record (staff) or playback (admin sees download URL)
// Props:
//   staffId, date, taskId  — used to build storage path & Firestore doc id
//   readOnly               — admin view: playback only
// ─────────────────────────────────────────────────────────────────────────────
export default function VoiceNote({ staffId, date, taskId, readOnly = false }) {
  const [state, setState]   = useState('idle') // idle|recording|uploading|playing|error
  const [secs, setSecs]     = useState(0)
  const [url, setUrl]       = useState(null)
  const [hasNote, setHasNote] = useState(false)

  const mediaRef  = useRef(null)
  const chunksRef = useRef([])
  const timerRef  = useRef(null)
  const audioRef  = useRef(null)

  const noteId   = `${staffId}_${date}_${taskId}`
  const storagePath = `voice/${staffId}/${date}/${taskId}`

  // Load existing note URL from Firestore
  useEffect(() => {
    let cancelled = false
    getDoc(doc(db, 'voiceNotes', noteId)).then(snap => {
      if (!cancelled && snap.exists()) {
        setUrl(snap.data().url)
        setHasNote(true)
      }
    }).catch(() => {})
    return () => { cancelled = true }
  }, [noteId])

  // ── Record ─────────────────────────────────────────────────────────────────
  const startRec = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      mr.ondataavailable = e => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      mr.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        setState('uploading')
        try {
          const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' })
          const storageRef = ref(storage, storagePath)
          await uploadBytes(storageRef, blob)
          const downloadUrl = await getDownloadURL(storageRef)
          await setDoc(doc(db, 'voiceNotes', noteId), {
            staffId, date, taskId, url: downloadUrl,
            savedAt: new Date().toISOString(),
          })
          setUrl(downloadUrl)
          setHasNote(true)
          setState('idle')
        } catch (err) {
          console.error(err)
          setState('error')
        }
      }
      mr.start()
      setState('recording')
      setSecs(0)
      timerRef.current = setInterval(() => setSecs(s => s + 1), 1000)
    } catch {
      setState('error')
    }
  }

  const stopRec = () => {
    clearInterval(timerRef.current)
    if (mediaRef.current?.state === 'recording') mediaRef.current.stop()
  }

  // ── Playback ───────────────────────────────────────────────────────────────
  const play = () => {
    if (!url) return
    audioRef.current?.pause()
    const audio = new Audio(url)
    audioRef.current = audio
    setState('playing')
    audio.onended = () => setState('idle')
    audio.onerror = () => setState('idle')
    audio.play()
  }
  const stopPlay = () => { audioRef.current?.pause(); setState('idle') }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const del = async () => {
    if (!confirm('இந்த குரல் பதிவை நீக்கவா?')) return
    stopPlay()
    try {
      await deleteObject(ref(storage, storagePath))
      await deleteDoc(doc(db, 'voiceNotes', noteId))
      setUrl(null); setHasNote(false); setState('idle')
    } catch {}
  }

  useEffect(() => () => { clearInterval(timerRef.current); audioRef.current?.pause() }, [])

  // Admin read-only: just show playback button if URL exists
  if (readOnly) {
    if (!hasNote) return null
    return (
      <button onClick={state === 'playing' ? stopPlay : play} style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        background: state === 'playing' ? '#FFF0F0' : '#EEF6FF',
        border: `1px solid ${state === 'playing' ? C.lateRed : C.voice}44`,
        borderRadius: 20, padding: '4px 12px', cursor: 'pointer', marginTop: 6,
      }}>
        <span style={{ fontSize: 15 }}>{state === 'playing' ? '⏹' : '▶'}</span>
        <span style={{ fontSize: 11, fontWeight: 700, color: state === 'playing' ? C.lateRed : C.voice }}>
          {state === 'playing' ? 'நிறுத்து' : '🎙 குரல் காரணம்'}
        </span>
      </button>
    )
  }

  // Staff recording UI
  if (state === 'error') return (
    <div style={{ fontSize: 12, color: C.lateRed, marginTop: 6 }}>{TA.micDenied}</div>
  )

  return (
    <div style={{
      marginTop: 10, background: '#EEF6FF', borderRadius: 12, padding: '12px 14px',
      border: `1px solid #BDD6F8`,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.voice, marginBottom: 8, letterSpacing: 0.5 }}>
        🎙 {TA.voiceReason}
        {hasNote && <span style={{ marginLeft: 8, color: C.green, fontWeight: 600 }}>{TA.voiceSaved}</span>}
      </div>

      {state === 'recording' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <Wave />
          <span style={{ fontSize: 13, color: C.lateRed, fontWeight: 700 }}>{fmtSecs(secs)}</span>
        </div>
      )}

      {state === 'uploading' && (
        <div style={{ fontSize: 12, color: C.voice, marginBottom: 8 }}>பதிவேற்றுகிறது…</div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {state === 'idle' && !hasNote && (
          <Btn small variant="blue" onClick={startRec}>🎙 பதிவு செய்யுங்கள்</Btn>
        )}
        {state === 'recording' && (
          <Btn small variant="red" onClick={stopRec}>⏹ நிறுத்து</Btn>
        )}
        {state === 'idle' && hasNote && (
          <>
            <Btn small variant="blue" onClick={play}>▶ கேளுங்கள்</Btn>
            <Btn small variant="red" onClick={startRec}>🔁 மீண்டும் பதிவு</Btn>
            <Btn small variant="danger" onClick={del}>🗑</Btn>
          </>
        )}
        {state === 'playing' && (
          <Btn small variant="danger" onClick={stopPlay}>⏹ நிறுத்து</Btn>
        )}
      </div>

      {!hasNote && state === 'idle' && (
        <div style={{ fontSize: 11, color: C.muted, marginTop: 6 }}>
          தாமதத்தின் காரணத்தை தமிழிலோ ஆங்கிலத்திலோ சொல்லுங்கள்
        </div>
      )}
    </div>
  )
}
