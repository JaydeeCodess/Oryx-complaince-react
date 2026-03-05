import { useState } from 'react'
import { avatarColor, daysUntil, getDaysPillClass, getDaysPillLabel } from '../data/store.js'

function VisaAlertBanner({ title, visas, cls, expanded: initExpanded, onView, onRemind }) {
  const [open, setOpen] = useState(initExpanded)
  return (
    <div className={`visa-alert-banner ${cls}`} style={{ marginBottom: 20 }}>
      <div className="visa-alert-header" onClick={() => setOpen(o => !o)}>
        <div className="visa-alert-title">{title}<span className="visa-alert-count">{visas.length}</span></div>
        <span style={{ color: 'var(--text3)', fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="visa-alert-body open">
          {visas.map(v => {
            const days = daysUntil(v.expiry)
            const empId = v.emp_id || v.empId
            const ini = (v.emp || '').split(' ').map(n => n[0]).join('').slice(0, 2)
            return (
              <div key={v.id} className="visa-row">
                <div className="visa-row-left">
                  <div className="avatar" style={{ background: avatarColor(empId), width: 32, height: 32, fontSize: 12 }}>{ini}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{v.emp}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{v.type} · {v.country} · #{v.visa_num || v.visaNum}</div>
                    {v.notes && <div style={{ fontSize: 11, color: 'var(--orange)', marginTop: 2 }}>📌 {v.notes}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className={`visa-days-pill ${getDaysPillClass(days)}`} style={days > 60 ? { background: 'rgba(62,207,142,.15)', color: 'var(--green)' } : {}}>{getDaysPillLabel(days)}</span>
                  <span style={{ fontSize: 12, color: 'var(--text3)' }}>Expires: {v.expiry}</span>
                  <button className="btn btn-secondary btn-sm" onClick={() => onRemind(v.id)}>📧 Remind</button>
                  <button className="btn btn-primary btn-sm" onClick={() => onView(v.id)}>View</button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function Dashboard({ db, updateDb, showToast, openModal, nav }) {
  const [mySignIn, setMySignIn] = useState(null)
  const [mySignOut, setMySignOut] = useState(null)
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  // Use real attendance data if available, otherwise fallback
  const chartData = db.attendance.slice(0, 7).map(a => a.attended).reverse()
  const chartDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

  const pending  = db.leaves.filter(l => l.status === 'pending')
  const critical = db.visas.filter(v => { const d = daysUntil(v.expiry); return d >= 0 && d <= 15 })
  const warning  = db.visas.filter(v => { const d = daysUntil(v.expiry); return d > 15 && d <= 30 })
  const notice   = db.visas.filter(v => { const d = daysUntil(v.expiry); return d > 30 && d <= 60 })
  const expired  = db.visas.filter(v => daysUntil(v.expiry) < 0)
  const typeColors = { holiday: 'red', meeting: 'blue', event: 'green', other: 'gray' }

  const getStart = e => e.start_date || e.start

  const approveLeave = async id => {
    await updateDb('leaves', 'update', { status: 'approved', approved_by: 'Admin', reviewed_at: new Date().toISOString() }, id)
    showToast('Leave approved', 'success')
  }
  const rejectLeave = async id => {
    await updateDb('leaves', 'update', { status: 'rejected', approved_by: 'Admin', reviewed_at: new Date().toISOString() }, id)
    showToast('Leave rejected', 'error')
  }

  const selfSignIn  = () => { if (mySignIn) return; const t = new Date(); setMySignIn(t); showToast('Signed in at ' + t.toTimeString().slice(0, 5), 'success') }
  const selfSignOut = () => {
    if (!mySignIn || mySignOut) return
    const t = new Date(); setMySignOut(t)
    const diff = Math.round((t - mySignIn) / 60000)
    showToast(`Signed out. Duration: ${Math.floor(diff / 60)}h ${diff % 60}m`, 'info')
  }
  const duration = mySignIn && mySignOut ? (() => { const d = Math.round((mySignOut - mySignIn) / 60000); return `${Math.floor(d / 60)}h ${d % 60}m` })() : '--:--'

  // Payroll total from real data
  const totalGross = db.payroll.reduce((sum, p) => sum + (p.gross || p.basic || 0), 0)

  return (
    <div>
      <div className="stat-grid">
        {[
          { label: 'Total Employees', value: db.employees.length, sub: 'Across all branches', icon: '👥', cls: 'blue' },
          { label: 'Present Today', value: db.attendance[0]?.on_time || 118, sub: `${db.attendance[0] ? Math.round(db.attendance[0].attended / 142 * 100) : 83}% attendance rate`, icon: '✅', cls: 'green' },
          { label: 'On Leave', value: db.leaves.filter(l => l.status === 'approved').length, sub: `${pending.length} pending approval`, icon: '🏖️', cls: 'yellow' },
          { label: 'Absent', value: db.attendance[0]?.missed || 12, sub: 'Unexcused today', icon: '⚠️', cls: 'red' },
          { label: 'Departments', value: db.departments.length, sub: `Across ${db.branches.length} branches`, icon: '🏢', cls: 'purple' },
          { label: 'Payroll (Month)', value: '$' + Math.round(totalGross / 1000) + 'K', sub: 'This month gross', icon: '💰', cls: 'orange' },
        ].map(s => (
          <div key={s.label} className={`stat-card ${s.cls}`}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-sub">{s.sub}</div>
            <div className="stat-icon">{s.icon}</div>
          </div>
        ))}
      </div>

      {expired.length > 0 && <VisaAlertBanner title="🚫 EXPIRED VISAS" visas={expired} cls="red" expanded={true} onView={id => { nav('visas'); openModal('visa-detail-modal', { visaId: id }) }} onRemind={id => openModal('visa-notif-modal', { visaId: id })} />}
      {critical.length > 0 && <VisaAlertBanner title="🚨 Critical — Expiring Within 15 Days" visas={critical} cls="red" expanded={true} onView={id => { nav('visas'); openModal('visa-detail-modal', { visaId: id }) }} onRemind={id => openModal('visa-notif-modal', { visaId: id })} />}
      {warning.length > 0 && <VisaAlertBanner title="⚠️ Warning — Expiring Within 30 Days" visas={warning} cls="warn" expanded={false} onView={id => { nav('visas'); openModal('visa-detail-modal', { visaId: id }) }} onRemind={id => openModal('visa-notif-modal', { visaId: id })} />}
      {notice.length > 0 && <VisaAlertBanner title="📋 Notice — Expiring Within 60 Days" visas={notice} cls="notice" expanded={false} onView={id => { nav('visas'); openModal('visa-detail-modal', { visaId: id }) }} onRemind={id => openModal('visa-notif-modal', { visaId: id })} />}

      <div className="grid-2">
        <div className="card">
          <div className="section-header"><div><div className="section-title">Weekly Attendance</div><div className="section-sub">Last 7 days overview</div></div></div>
          <div className="bar-chart">
            {(chartData.length > 0 ? chartData : [130,135,128,138,126,0,0]).map((d, i) => (
              <div key={i} className="bar-col">
                <div className="bar" style={{ height: d ? (d / 142 * 100) + '%' : '4px', background: d > 0 ? 'var(--accent)' : 'var(--bg4)' }} />
                <div className="bar-label">{chartDays[i]}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 12 }}>
            <span style={{ color: 'var(--accent3)' }}>■ Present</span>
            <span style={{ color: 'var(--yellow)' }}>■ Late</span>
            <span style={{ color: 'var(--red)' }}>■ Absent</span>
          </div>
        </div>
        <div className="card">
          <div className="section-header">
            <div><div className="section-title">Leave Requests</div><div className="section-sub">Pending approval</div></div>
            <button className="btn btn-secondary btn-sm" onClick={() => nav('leaves')}>View All</button>
          </div>
          {pending.length === 0 ? <div style={{ color: 'var(--text3)', fontSize: 14, padding: '10px 0' }}>No pending requests</div>
            : pending.map(l => (
              <div key={l.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{l.emp}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{l.type} · {l.days} day{l.days > 1 ? 's' : ''} · {l.from_date || l.from}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-success btn-sm" onClick={() => approveLeave(l.id)}>✓</button>
                  <button className="btn btn-danger btn-sm" onClick={() => rejectLeave(l.id)}>✕</button>
                </div>
              </div>
            ))}
        </div>
      </div>

      <div className="grid-2 mt-6">
        <div className="card">
          <div className="section-header"><div className="section-title">Upcoming Events</div></div>
          {db.events.length === 0
            ? <div style={{ color: 'var(--text3)', fontSize: 13 }}>No events</div>
            : db.events.slice(0, 5).map(e => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <span className={`badge badge-${typeColors[e.type] || 'gray'}`}>{e.type}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)' }}>{getStart(e)}</div>
                </div>
              </div>
            ))}
        </div>
        <div className="card">
          <div className="section-header"><div className="section-title">Department Headcount</div></div>
          {db.departments.map((d, i) => (
            <div key={d.id} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                <span>{d.name}</span><span style={{ color: 'var(--text3)' }}>{d.emp_count ?? d.count} emp</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: ((d.emp_count ?? d.count ?? 0) / 142 * 100) + '%', background: avatarColor(i) }} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="card mt-6">
        <div className="section-header">
          <div><div className="section-title">My Attendance Today</div><div className="section-sub">{todayStr}</div></div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn btn-success" disabled={!!mySignIn} onClick={selfSignIn}>⏱ Sign In</button>
            <button className="btn btn-danger" disabled={!mySignIn || !!mySignOut} onClick={selfSignOut}>🚪 Sign Out</button>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <div><div className="form-label">Sign In Time</div><div className="font-mono" style={{ color: 'var(--green)', fontSize: 20 }}>{mySignIn ? mySignIn.toTimeString().slice(0, 5) : '--:--'}</div></div>
          <div><div className="form-label">Sign Out Time</div><div className="font-mono" style={{ color: 'var(--red)', fontSize: 20 }}>{mySignOut ? mySignOut.toTimeString().slice(0, 5) : '--:--'}</div></div>
          <div><div className="form-label">Status</div><div>{mySignIn ? <span className="badge badge-green">Present</span> : <span className="badge badge-gray">Not Recorded</span>}</div></div>
          <div><div className="form-label">Duration</div><div className="font-mono" style={{ fontSize: 20, color: 'var(--text2)' }}>{duration}</div></div>
        </div>
      </div>
    </div>
  )
}
