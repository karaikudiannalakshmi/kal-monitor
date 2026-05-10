// src/utils/masterSchedule.js
import * as XLSX from 'xlsx'

const norm = s => (s || '').toString().trim().toLowerCase()

function parseTime(val) {
  if (!val) return ''
  if (typeof val === 'number') {
    const totalMins = Math.round(val * 24 * 60)
    const h = Math.floor(totalMins / 60), m = totalMins % 60
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`
  }
  const s = val.toString().trim()
  if (/^\d{1,2}:\d{2}/.test(s)) return s.slice(0,5).padStart(5,'0')
  return s
}

// Completely unique ID using staffId + date + sequential number
function makeUniqueId(staffId, date, seqNum) {
  return `${staffId}_${date}_seq${String(seqNum).padStart(3,'0')}`
}

export async function parseMasterSchedule(file, staffList) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      try {
        const wb   = XLSX.read(e.target.result, { type: 'array' })
        const ws   = wb.Sheets[wb.SheetNames[0]]
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' })

        const nameMap = {}
        staffList.forEach(s => { nameMap[norm(s.name)] = s })

        const tasks = [], errors = []

        rows.forEach((row) => {
          const staffName = (row[0] || '').toString().trim()
          if (!staffName) return

          const staffObj = nameMap[norm(staffName)]
          if (!staffObj) return // silently skip title/header rows

          // Columns: A=staff, B=task, C=time, D=type, E=active
          const taskText  = (row[1] || '').toString().trim()
          const timeVal   = row[2]
          const typeRaw   = norm(row[3] || 'normal')
          const activeRaw = norm(row[4] || 'yes')

          if (!taskText) return
          if (taskText === staffName) return // skip if task = staff name (bad parse)
          if (activeRaw === 'no') return

          tasks.push({
            staffId:   staffObj.id,
            staffName: staffObj.name,
            task:      taskText,
            startTime: parseTime(timeVal),
            type:      typeRaw.includes('critical') ? 'critical' : 'normal',
            substitute: false,
            remarks:   '',
          })
        })

        if (tasks.length === 0) {
          errors.push(
            `No tasks found. Staff names in column A must exactly match: ` +
            staffList.map(s => `"${s.name}"`).join(', ')
          )
        }

        resolve({ tasks, errors })
      } catch (err) { reject(err) }
    }
    reader.onerror = () => reject(new Error('File read error'))
    reader.readAsArrayBuffer(file)
  })
}

export function generateDailyTasks(masterTasks, date) {
  // Use sequential IDs — completely avoids Tamil character stripping issue
  const counters = {}
  return masterTasks.map(t => {
    counters[t.staffId] = (counters[t.staffId] || 0) + 1
    return {
      ...t,
      id:        makeUniqueId(t.staffId, date, counters[t.staffId]),
      date,
      createdAt: new Date().toISOString(),
    }
  })
}
