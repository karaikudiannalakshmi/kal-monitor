// src/utils/excelImport.js
import * as XLSX from 'xlsx'
import { TA } from './constants'

const COL = TA.excelCols
const norm = s => (s || '').toString().trim().toLowerCase()

// Browser-safe stable ID
const makeId = (staffId, date, taskText) => {
  const safe = taskText.replace(/[^a-zA-Z0-9]/g, '').slice(0, 14) || Math.random().toString(36).slice(2, 10)
  return `${staffId}_${date}_${safe}`
}

const MATCHERS = {
  staffName:  [norm(COL.staffName), 'staff name', 'name', 'பெயர்'],
  task:       [norm(COL.task), 'task', 'பணி', 'விவரம்'],
  startTime:  [norm(COL.startTime), 'start time', 'start', 'தொடக்கம்', 'தொடக்க நேரம்'],
  type:       [norm(COL.type), 'type', 'வகை', 'critical', 'normal'],
  substitute: [norm(COL.substitute), 'substitute', 'பதிலாள்', 'sub task', 'yes', 'no'],
  remarks:    ['குறிப்பு', 'remarks', 'notes', 'note'],
}

function findCol(headers, key) {
  const matchers = MATCHERS[key]
  for (let i = 0; i < headers.length; i++) {
    const h = norm(headers[i])
    if (matchers.some(m => h.includes(m) || m.includes(h))) return i
  }
  return -1
}

function normaliseType(val) {
  const v = norm(val)
  if (v.includes('critical') || v.includes('முக்கிய') || v === 'c') return 'critical'
  return 'normal'
}

function normaliseSubstitute(val) {
  if (!val) return false
  const v = norm(val)
  return v === 'yes' || v === 'y' || v === 'true' || v === '1'
}

function parseTime(val) {
  if (!val) return ''
  if (typeof val === 'number') {
    const totalMins = Math.round(val * 24 * 60)
    const h = Math.floor(totalMins / 60)
    const m = totalMins % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
  }
  const s = val.toString().trim()
  if (/^\d{1,2}:\d{2}/.test(s)) return s.slice(0,5).padStart(5,'0')
  return s
}

export async function parseExcel(file, date, staffList) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const wb   = XLSX.read(e.target.result, { type: 'array' })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

        // Skip title/instruction rows — find the actual header row
        let headerRowIdx = 0
        for (let i = 0; i < Math.min(5, rows.length); i++) {
          const joined = rows[i].join(' ').toLowerCase()
          if (joined.includes('பணியாளர்') || joined.includes('staff') || joined.includes('task') || joined.includes('பணி')) {
            headerRowIdx = i
            break
          }
        }

        const headers = rows[headerRowIdx]
        const colIdx  = {}
        for (const key of Object.keys(MATCHERS)) {
          colIdx[key] = findCol(headers, key)
        }

        const nameMap = {}
        staffList.forEach(s => {
          nameMap[norm(s.name)] = s.id
          if (s.phone) nameMap[norm(s.phone)] = s.id
        })

        const tasks  = []
        const errors = []

        rows.slice(headerRowIdx + 1).forEach((row, idx) => {
          const lineNo = idx + headerRowIdx + 2
          if (row.every(c => !c)) return

          const staffName = (row[colIdx.staffName] || '').toString().trim()
          const staffId   = nameMap[norm(staffName)]

          if (!staffId) {
            if (staffName) errors.push(`வரி ${lineNo}: பணியாளர் "${staffName}" கிடைக்கவில்லை`)
            return
          }

          const taskText = (row[colIdx.task] || '').toString().trim()
          if (!taskText) {
            errors.push(`வரி ${lineNo}: பணி விவரம் இல்லை`)
            return
          }

          const startTime = colIdx.startTime >= 0 ? parseTime(row[colIdx.startTime]) : ''
          const typeRaw   = colIdx.type      >= 0 ? row[colIdx.type]                : 'normal'
          const subRaw    = colIdx.substitute>= 0 ? row[colIdx.substitute]          : ''
          const remarkRaw = colIdx.remarks   >= 0 ? row[colIdx.remarks]             : ''

          tasks.push({
            id:         makeId(staffId, date, taskText),
            staffId,
            staffName,
            date,
            task:       taskText,
            startTime,
            type:       normaliseType(typeRaw),
            substitute: normaliseSubstitute(subRaw),
            remarks:    remarkRaw ? remarkRaw.toString().trim() : '',
            createdAt:  new Date().toISOString(),
          })
        })

        resolve({ tasks, errors })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('கோப்பை படிக்க முடியவில்லை'))
    reader.readAsArrayBuffer(file)
  })
}

// downloadTemplate() now just points to the rich Excel — 
// admin should use the KAL_Task_Template.xlsx downloaded separately.
// This function generates a minimal fallback if needed.
export function downloadTemplate() {
  const wb = XLSX.utils.book_new()
  const headers = ['பணியாளர் பெயர்', 'பணி விவரம்', 'தொடக்க நேரம்', 'வகை', 'பதிலாள் பணி', 'குறிப்பு']
  const examples = [
    ['Viji',    'Online parcel & supervision',         '08:30', 'normal',   '',    ''],
    ['Anandhi', 'Taste rasam, check vessels',           '09:00', 'critical', '',    ''],
    ['Viji',    'Cover Ravi – cutting veg',             '11:00', 'normal',   'Yes', 'Ravi absent'],
  ]
  const ws = XLSX.utils.aoa_to_sheet([headers, ...examples])
  ws['!cols'] = [{ wch:18 },{ wch:40 },{ wch:14 },{ wch:12 },{ wch:14 },{ wch:26 }]
  XLSX.utils.book_append_sheet(wb, ws, 'Daily Upload')
  XLSX.writeFile(wb, `KAL_Tasks_${new Date().toISOString().slice(0,10)}.xlsx`)
}
