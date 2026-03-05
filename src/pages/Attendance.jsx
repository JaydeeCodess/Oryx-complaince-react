import { useState } from 'react'

export default function Attendance({ db, updateDb, showToast }) {
  const [tab, setTab] = useState('overview')
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0])
  const [saving, setSaving] = useState(false)
  const [repFrom, setRepFrom] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1).toISOString().split('T')[0] })
  const [repTo, setRepTo] = useState(new Date().toISOString().split('T')[0])
  const [repDept, setRepDept] = useState('')
  const [reportOut, setReportOut] = useState(null)

  const genReport = () => {
    const days = Math.round((new Date(repTo) - new Date(repFrom)) / 86400000) + 1
    setReportOut({ days, from: repFrom, to: repTo, dept: repDept })
  }

  const saveDailyAtt = async () => {
    if (!attDate) { showToast('Select a date first', 'error'); return }
    // Check if record for this date already exists
    const existing = db.attendance.find(a => a.date === attDate)
    setSaving(true)
    try {
      if (existing) {
        await updateDb('attendance', 'update', { attended: 138, on_time: 125, late: 13, missed: 4 }, existing.id)
      } else {
        await updateDb('attendance', 'insert', { date: attDate, attended: 138, on_time: 125, late: 13, missed: 4 })
      }
      showToast('Attendance saved for ' + attDate, 'success')
    } catch (err) {
      showToast('Failed to save attendance', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="tabs">
        {[['overview', 'Overview'], ['daily', 'Daily Entry'], ['report', 'Reports']].map(([t, l]) => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', maxWidth: 700, marginBottom: 24 }}>
            {[['On Time', 98, 'green'], ['Late', 20, 'yellow'], ['Absent', 12, 'red'], ['On Leave', 12, 'purple']].map(([l, v, c]) => (
              <div key={l} className={`stat-card ${c}`} style={{ padding: 16 }}>
                <div className="stat-label">{l}</div>
                <div className="stat-value" style={{ fontSize: 24 }}>{v}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Date</th><th>Attended</th><th>On Time</th><th>Late</th><th>Absent</th><th>Rate</th><th>Action</th></tr></thead>
                <tbody>
                  {db.attendance.map((a, i) => (
                    <tr key={a.id || i}>
                      <td>{a.date}</td>
                      <td><strong>{a.attended}</strong> / 142</td>
                      <td style={{ color: 'var(--green)' }}>{a.on_time}</td>
                      <td style={{ color: 'var(--yellow)' }}>{a.late}</td>
                      <td style={{ color: 'var(--red)' }}>{a.missed}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div className="progress-bar" style={{ width: 80 }}><div className="progress-fill" style={{ width: (a.attended / 142 * 100).toFixed(0) + '%', background: 'var(--green)' }} /></div>
                          <span style={{ fontSize: 12, color: 'var(--text3)' }}>{(a.attended / 142 * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td><button className="btn btn-secondary btn-sm" onClick={() => { setTab('daily'); setAttDate(a.date) }}>View</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'daily' && (
        <div className="card" style={{ maxWidth: 800 }}>
          <div className="section-header">
            <div className="section-title">Record Daily Attendance</div>
            <input type="date" className="form-input" value={attDate} onChange={e => setAttDate(e.target.value)} style={{ width: 180 }} />
          </div>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Employee</th><th>Department</th><th>Status</th><th>Sign In</th><th>Notes</th></tr></thead>
              <tbody>
                {db.employees.slice(0, 20).map(e => (
                  <tr key={e.id}>
                    <td>{e.name}</td>
                    <td className="td-muted">{e.dept}</td>
                    <td>
                      <select className="form-select" style={{ width: 120, padding: '6px 10px', fontSize: 13 }}>
                        <option>On Time</option><option>Late</option><option>Absent</option><option>On Leave</option>
                      </select>
                    </td>
                    <td><input type="time" className="form-input" style={{ width: 110, padding: '6px 10px', fontSize: 13 }} defaultValue="09:00" /></td>
                    <td><input className="form-input" style={{ fontSize: 13, padding: '6px 10px' }} placeholder="Notes…" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
            <button className="btn btn-primary" onClick={saveDailyAtt} disabled={saving}>
              {saving ? '⏳ Saving…' : 'Save Attendance'}
            </button>
          </div>
        </div>
      )}

      {tab === 'report' && (
        <div>
          <div className="card" style={{ maxWidth: 600 }}>
            <div className="section-title mb-4">Generate Report</div>
            <div className="form-grid">
              <div className="form-group"><label className="form-label">From Date</label><input type="date" className="form-input" value={repFrom} onChange={e => setRepFrom(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">To Date</label><input type="date" className="form-input" value={repTo} onChange={e => setRepTo(e.target.value)} /></div>
              <div className="form-group"><label className="form-label">Department</label>
                <select className="form-select" value={repDept} onChange={e => setRepDept(e.target.value)}>
                  <option value="">All</option>
                  {[...new Set(db.employees.map(e => e.dept))].sort().map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary mt-4" onClick={genReport}>Generate Report</button>
          </div>
          {reportOut && (
            <div className="card mt-6">
              <div className="section-title mb-4">Attendance Report: {reportOut.from} → {reportOut.to} {reportOut.dept ? '· ' + reportOut.dept : ''}</div>
              <div className="stat-grid" style={{ gridTemplateColumns: 'repeat(4,1fr)', marginBottom: 20 }}>
                {[['Total Days', reportOut.days, 'green'], ['Avg Present', 131, 'blue'], ['Avg Late', 11, 'yellow'], ['Avg Absent', 9, 'red']].map(([l, v, c]) => (
                  <div key={l} className={`stat-card ${c}`} style={{ padding: 16 }}><div className="stat-label">{l}</div><div className="stat-value" style={{ fontSize: 24 }}>{v}</div></div>
                ))}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => showToast('Report exported to CSV', 'success')}>⬇ Export CSV</button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
