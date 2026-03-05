import { useState } from 'react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function CalendarPage({ db, updateDb, showToast, openModal }) {
  const [year, setYear] = useState(2025)
  const [monthIdx, setMonthIdx] = useState(6)

  const changeMonth = dir => {
    let m = monthIdx + dir, y = year
    if (m > 11) { m = 0; y++ }
    if (m < 0) { m = 11; y-- }
    setMonthIdx(m); setYear(y)
  }

  const firstDay = new Date(year, monthIdx, 1).getDay()
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate()
  const daysInPrev = new Date(year, monthIdx, 0).getDate()
  const today = new Date()
  const isToday = d => year === today.getFullYear() && monthIdx === today.getMonth() && d === today.getDate()

  // Support both start_date and start field names
  const getStart = e => e.start_date || e.start
  const getEnd = e => e.end_date || e.end

  const eventDays = db.events
    .filter(e => { const d = new Date(getStart(e)); return d.getFullYear() === year && d.getMonth() === monthIdx })
    .map(e => new Date(getStart(e)).getDate())

  const cells = []
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, other: true })
  for (let d = 1; d <= daysInMonth; d++) {
    const dow = (firstDay + d - 1) % 7
    cells.push({ day: d, isWeekend: dow === 0 || dow === 6, hasEvent: eventDays.includes(d), isToday: isToday(d) })
  }
  const remaining = cells.length % 7 === 0 ? 0 : 7 - (cells.length % 7)
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, other: true })

  const monthEvents = db.events.filter(e => { const d = new Date(getStart(e)); return d.getFullYear() === year && d.getMonth() === monthIdx })
  const approvedLeaves = db.leaves.filter(l => {
    if (l.status !== 'approved') return false
    const d = new Date(l.from_date || l.from)
    return d.getFullYear() === year && d.getMonth() === monthIdx
  })
  const typeColors = { holiday: 'red', meeting: 'blue', event: 'green', other: 'gray' }

  const handleDayClick = d => {
    const ds = `${year}-${String(monthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const ev = db.events.filter(e => getStart(e) === ds)
    if (ev.length > 0) { showToast(ev.map(e => e.title).join(', '), 'info') }
    else { openModal('event-modal') }
  }

  return (
    <div className="grid-2">
      <div className="card">
        <div className="section-header">
          <button className="btn btn-secondary btn-sm" onClick={() => changeMonth(-1)}>← Prev</button>
          <div className="section-title">{MONTHS[monthIdx]} {year}</div>
          <button className="btn btn-secondary btn-sm" onClick={() => changeMonth(1)}>Next →</button>
        </div>
        <div className="cal-grid">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => <div key={d} className="cal-header">{d}</div>)}
        </div>
        <div className="cal-grid">
          {cells.map((c, i) => {
            const cls = ['cal-day', c.other ? 'other-month' : '', c.isWeekend && !c.other ? 'weekend' : '', c.hasEvent ? 'has-event' : '', c.isToday ? 'today' : ''].filter(Boolean).join(' ')
            return <div key={i} className={cls} onClick={() => !c.other && handleDayClick(c.day)}>{c.day}</div>
          })}
        </div>
      </div>
      <div>
        <div className="card mb-4">
          <div className="section-header">
            <div className="section-title">Events & Holidays</div>
            <button className="btn btn-primary btn-sm" onClick={() => openModal('event-modal')}>＋ Add</button>
          </div>
          {monthEvents.length === 0
            ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>No events this month</div>
            : monthEvents.map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`badge badge-${typeColors[e.type] || 'gray'}`}>{e.type}</span>
                  <span style={{ fontSize: 14 }}>{e.title}</span>
                </div>
                <span style={{ fontSize: 12, color: 'var(--text3)' }}>{getStart(e)?.split('-')[2]}</span>
              </div>
            ))}
        </div>
        <div className="card">
          <div className="section-title" style={{ marginBottom: 14 }}>Approved Leave This Month</div>
          {approvedLeaves.length === 0
            ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>No approved leaves this month</div>
            : approvedLeaves.map((l, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: 13 }}>
                <span style={{ fontWeight: 500 }}>{l.emp}</span>
                <span style={{ color: 'var(--text3)' }}>{l.from_date || l.from} → {l.to_date || l.to}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
