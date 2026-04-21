// src/utils/constants.js

export const TA = {
  // App
  appName:        'KAL பணி கண்காணிப்பு',
  appSub:         'கரைக்குடி அண்ணாலட்சுமி சமையலறை',

  // Auth
  loginTitle:     'உள்நுழைவு',
  phone:          'தொலைபேசி எண்',
  sendOtp:        'OTP அனுப்பு',
  enterOtp:       'OTP உள்ளிடுக',
  verify:         'சரிபார்',
  otpSent:        'OTP அனுப்பப்பட்டது',
  back:           'திரும்பு',
  adminLogin:     'நிர்வாகி உள்நுழைவு (Gmail)',

  // Nav - Staff
  myTasks:        'என் பணிகள்',
  myRecord:       'என் பதிவு',
  logout:         'வெளியேறு',

  // Nav - Admin
  dashboard:      'கண்காணிப்பு',
  staffMgmt:      'பணியாளர்கள்',
  uploadTasks:    'பணி பதிவேற்றம்',
  schedule:       'அட்டவணை',

  // Tasks
  noTasks:        'இன்று பணிகள் இல்லை',
  taskDone:       'முடிந்தது',
  taskPending:    'நிலுவையில்',
  critical:       '⚡ முக்கியம்',
  normal:         '● சாதாரணம்',
  substitute:     '🔄 பதிலாள் பணி',
  scheduledTime:  'திட்டமிட்ட நேரம்',
  actualStart:    'தொடங்கிய நேரம்',
  actualEnd:      'முடிந்த நேரம்',
  variation:      'வித்தியாசம்',
  lateAlert:      '⚠️ தாமதம் 30 நிமிடத்திற்கும் மேல்',
  voiceReason:    '🎙 காரணம் சொல்லுங்கள்',
  recording:      '⏹ நிறுத்து',
  playVoice:      '▶ கேளுங்கள்',
  voiceSaved:     '✓ குரல் பதிவு சேமிக்கப்பட்டது',
  micDenied:      '⚠️ மைக் அணுகல் மறுக்கப்பட்டது. அமைப்புகளில் அனுமதிக்கவும்.',
  addNote:        'குறிப்பு சேர்க்கவும்',
  saveNote:       'சேமி',

  // Compliance
  compliance:     'இணக்கம்',
  done:           'முடிந்தவை',
  pending:        'நிலுவை',
  total:          'மொத்தம்',
  date:           'தேதி',
  selectDate:     'தேதி தேர்வு',

  // Excel
  excelCols: {
    staffName:  'பணியாளர் பெயர்',
    task:       'பணி விவரம்',
    startTime:  'தொடக்க நேரம்',
    endTime:    'முடிவு நேரம்',
    type:       'வகை',
    substitute: 'பதிலாள் பணி',
  },
  uploadSuccess: 'பணிகள் வெற்றிகரமாக பதிவேற்றப்பட்டன',
  uploadError:   'பதிவேற்றத்தில் பிழை. மீண்டும் முயலவும்.',
}

export const COLORS = {
  bg:       '#FDF8F2',
  card:     '#FFFFFF',
  primary:  '#C0392B',
  accent:   '#F39C12',
  text:     '#2C3E50',
  muted:    '#95A5A6',
  border:   '#E8DDD0',
  green:    '#27AE60',
  row:      '#FEF9F4',
  critical: '#C0392B',
  normal:   '#2980B9',
  absent:   '#D35400',
  lateRed:  '#E00000',
  voice:    '#1A73E8',
}

export const toMins = t => {
  if (!t) return null
  const [h, m] = t.split(':').map(Number)
  return h * 60 + m
}
export const timeDiff = (sched, actual) => {
  const s = toMins(sched), a = toMins(actual)
  return (s == null || a == null) ? null : a - s
}
export const fmtDiff = d => {
  if (d == null) return ''
  return (d >= 0 ? '+' : '') + d + 'm'
}
export const today = () => new Date().toISOString().slice(0, 10)
export const fmtDate = d =>
  new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
export const uid = () => Math.random().toString(36).slice(2, 9)
