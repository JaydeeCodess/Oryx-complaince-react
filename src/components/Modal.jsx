import { useState } from 'react'
import { avatarColor, initials, daysUntil, getDaysPillClass, getDaysPillLabel, getVisaBadgeClass, getVisaBadgeLabel, getVisaTypeClass, countryFlag } from '../data/store.js'

export default function Modal({ activeModal, modalData, closeModal, db, updateDb, showToast, nav }) {
  const [deptForm, setDeptForm] = useState({ name: '', manager: '', desc: '' })
  const [branchForm, setBranchForm] = useState({ name: '', phone: '', email: '', address: '', manager: '' })
  const [eventForm, setEventForm] = useState({ title: '', type: 'holiday', start: '', end: '', notes: '' })
  const [notifToEmp, setNotifToEmp] = useState(true)
  const [notifToHr, setNotifToHr] = useState(true)
  const [notifToMgr, setNotifToMgr] = useState(false)
  const [notifExtra, setNotifExtra] = useState('')
  const [saving, setSaving] = useState(false)

  const isOpen = (id) => activeModal === id

  const addDept = async () => {
    if (!deptForm.name.trim()) { showToast('Department name required', 'error'); return }
    setSaving(true)
    try {
      await updateDb('departments', 'insert', {
        name: deptForm.name,
        manager: deptForm.manager || 'Unassigned',
        emp_count: 0,
        description: deptForm.desc || null,
      })
      closeModal()
      showToast(deptForm.name + ' department created!', 'success')
      setDeptForm({ name: '', manager: '', desc: '' })
    } finally { setSaving(false) }
  }

  const addBranch = async () => {
    if (!branchForm.name.trim()) { showToast('Branch name required', 'error'); return }
    setSaving(true)
    try {
      await updateDb('branches', 'insert', {
        name: branchForm.name,
        phone: branchForm.phone || null,
        email: branchForm.email || null,
        address: branchForm.address || null,
        manager: branchForm.manager || 'Unassigned',
        emp_count: 0,
      })
      closeModal()
      showToast(branchForm.name + ' created!', 'success')
      setBranchForm({ name: '', phone: '', email: '', address: '', manager: '' })
    } finally { setSaving(false) }
  }

  const addEvent = async () => {
    if (!eventForm.title.trim()) { showToast('Event title required', 'error'); return }
    setSaving(true)
    try {
      await updateDb('events', 'insert', {
        title: eventForm.title,
        type: eventForm.type,
        start_date: eventForm.start,
        end_date: eventForm.end || eventForm.start || null,
        notes: eventForm.notes || null,
      })
      closeModal()
      showToast(eventForm.title + ' added!', 'success')
      setEventForm({ title: '', type: 'holiday', start: '', end: '', notes: '' })
    } finally { setSaving(false) }
  }

  const visa = modalData?.visaId ? db.visas.find(v => v.id === modalData.visaId) : null

  const sendVisaNotif = () => {
    if (!visa) return
    const targets = [notifToEmp ? visa.emp : '', notifToHr ? 'HR Dept' : '', notifToMgr ? 'Manager' : ''].filter(Boolean).join(', ')
    closeModal()
    showToast(`✅ Reminder sent to: ${targets}`, 'success')
  }

  const renewVisa = async (id) => {
    const v = db.visas.find(x => x.id === id)
    if (!v) return
    const oldExpiry = v.expiry
    const newExp = new Date(v.expiry)
    newExp.setFullYear(newExp.getFullYear() + 2)
    const newExpStr = newExp.toISOString().split('T')[0]

    await updateDb('visas', 'update', {
      expiry: newExpStr,
      issue: new Date().toISOString().split('T')[0],
      renewed: true,
    }, id)

    await updateDb('visaHistory', 'insert', {
      visa_id: id,
      emp_name: v.emp,
      type: v.type,
      old_expiry: oldExpiry,
      new_expiry: newExpStr,
      renewed_on: new Date().toISOString().split('T')[0],
      renewed_by: 'Admin',
      notes: 'Manually marked as renewed',
    })
  }

  const overlay = (id, maxWidth, title, body, footer) => (
    <div className={`modal-overlay${isOpen(id) ? ' open' : ''}`} onClick={e => e.target === e.currentTarget && closeModal()}>
      <div className="modal" style={maxWidth ? { maxWidth } : {}}>
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" onClick={closeModal}>✕</button>
        </div>
        <div className="modal-body">{body}</div>
        <div className="modal-footer">{footer}</div>
      </div>
    </div>
  )

  return (
    <>
      {/* Department Modal */}
      {overlay('dept-modal', null, 'New Department',
        <>
          <div className="form-group mb-4"><label className="form-label">Department Name *</label><input className="form-input" value={deptForm.name} onChange={e => setDeptForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Engineering" /></div>
          <div className="form-group mb-4"><label className="form-label">Manager</label>
            <select className="form-select" value={deptForm.manager} onChange={e => setDeptForm(p => ({ ...p, manager: e.target.value }))}>
              <option value="">None</option>
              {db.employees.map(e => <option key={e.id}>{e.name}</option>)}
            </select>
          </div>
          <div className="form-group mb-4"><label className="form-label">Description</label><textarea className="form-textarea" value={deptForm.desc} onChange={e => setDeptForm(p => ({ ...p, desc: e.target.value }))} placeholder="Department description…" /></div>
        </>,
        <>
          <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
          <button className="btn btn-primary" onClick={addDept} disabled={saving}>{saving ? '⏳ Saving…' : 'Create Department'}</button>
        </>
      )}

      {/* Branch Modal */}
      {overlay('branch-modal', null, 'New Branch',
        <>
          <div className="form-group mb-4"><label className="form-label">Branch Name *</label><input className="form-input" value={branchForm.name} onChange={e => setBranchForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. North Branch" /></div>
          <div className="form-group mb-4"><label className="form-label">Phone</label><input className="form-input" value={branchForm.phone} onChange={e => setBranchForm(p => ({ ...p, phone: e.target.value }))} placeholder="+1 555 0000" /></div>
          <div className="form-group mb-4"><label className="form-label">Email</label><input className="form-input" type="email" value={branchForm.email} onChange={e => setBranchForm(p => ({ ...p, email: e.target.value }))} placeholder="north@company.com" /></div>
          <div className="form-group mb-4"><label className="form-label">Address</label><textarea className="form-textarea" value={branchForm.address} onChange={e => setBranchForm(p => ({ ...p, address: e.target.value }))} placeholder="Full branch address…" /></div>
          <div className="form-group"><label className="form-label">Branch Manager</label>
            <select className="form-select" value={branchForm.manager} onChange={e => setBranchForm(p => ({ ...p, manager: e.target.value }))}>
              <option value="">None</option>
              {db.employees.map(e => <option key={e.id}>{e.name}</option>)}
            </select>
          </div>
        </>,
        <>
          <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
          <button className="btn btn-primary" onClick={addBranch} disabled={saving}>{saving ? '⏳ Saving…' : 'Create Branch'}</button>
        </>
      )}

      {/* Event Modal */}
      {overlay('event-modal', null, 'Add Calendar Event',
        <>
          <div className="form-group mb-4"><label className="form-label">Title *</label><input className="form-input" value={eventForm.title} onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))} placeholder="Event title…" /></div>
          <div className="form-group mb-4"><label className="form-label">Type</label>
            <select className="form-select" value={eventForm.type} onChange={e => setEventForm(p => ({ ...p, type: e.target.value }))}>
              <option value="holiday">holiday</option>
              <option value="meeting">meeting</option>
              <option value="event">event</option>
              <option value="other">other</option>
            </select>
          </div>
          <div className="form-group mb-4"><label className="form-label">Start Date *</label><input type="date" className="form-input" value={eventForm.start} onChange={e => setEventForm(p => ({ ...p, start: e.target.value }))} /></div>
          <div className="form-group mb-4"><label className="form-label">End Date</label><input type="date" className="form-input" value={eventForm.end} onChange={e => setEventForm(p => ({ ...p, end: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={eventForm.notes} onChange={e => setEventForm(p => ({ ...p, notes: e.target.value }))} placeholder="Additional details…" /></div>
        </>,
        <>
          <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
          <button className="btn btn-primary" onClick={addEvent} disabled={saving}>{saving ? '⏳ Saving…' : 'Add Event'}</button>
        </>
      )}

      {/* Employee Detail Modal */}
      {(() => {
        const emp = modalData?.empId ? db.employees.find(e => e.id === modalData.empId) : null
        return overlay('emp-detail-modal', '640px', 'Employee Details',
          emp ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
                <div className="avatar" style={{ background: avatarColor(emp.employee_number?.replace('EMP-','') || 1), width: 72, height: 72, fontSize: 26, flexShrink: 0 }}>{initials(emp.name)}</div>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 700, fontFamily: "'DM Serif Display', serif" }}>{emp.name}</div>
                  <div style={{ color: 'var(--text3)', fontSize: 14 }}>{emp.title} · {emp.dept}</div>
                  <div style={{ marginTop: 6 }}><span className="badge badge-green">Active</span></div>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
                {[['Employee ID', emp.nid || emp.employee_number], ['Email', emp.email], ['Phone', emp.phone], ['Department', emp.dept], ['Branch', emp.branch], ['Hire Date', emp.hire], ['Salary', '$' + (emp.salary || 0).toLocaleString() + '/mo'], ['Gender', emp.gender]].map(([l, v]) => (
                  <div key={l} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius2)', padding: 12 }}>
                    <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                    <div style={{ fontWeight: 500 }}>{v || '—'}</div>
                  </div>
                ))}
              </div>
            </>
          ) : <div>Not found</div>,
          <button className="btn btn-danger btn-sm" onClick={closeModal}>Close</button>
        )
      })()}

      {/* Visa Detail Modal */}
      {(() => {
        const v = visa
        if (!v) return overlay('visa-detail-modal', '600px', 'Visa Record Details', <div>Not found</div>, <button className="btn btn-secondary" onClick={closeModal}>Close</button>)
        const days = daysUntil(v.expiry)
        const empId = v.emp_id || v.empId
        const emp = db.employees.find(e => e.id === empId)
        const visaNum = v.visa_num || v.visaNum
        const passportNum = v.passport_num || v.passportNum
        const passportExp = v.passport_exp || v.passportExp
        return overlay('visa-detail-modal', '600px', 'Visa Record Details',
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <div className="avatar" style={{ background: avatarColor(empId), width: 60, height: 60, fontSize: 22, flexShrink: 0 }}>{initials(v.emp || '')}</div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 700, fontFamily: "'DM Serif Display', serif" }}>{v.emp}</div>
                <div style={{ color: 'var(--text3)', fontSize: 13 }}>{v.nationality} · {emp ? emp.dept + ' · ' + emp.title : ''}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6 }}>
                  <span className={`badge ${getVisaBadgeClass(days)}`}>{getVisaBadgeLabel(days)}</span>
                  <span className={`visa-days-pill ${getDaysPillClass(days)}`} style={days > 60 ? { background: 'rgba(62,207,142,.15)', color: 'var(--green)' } : {}}>{getDaysPillLabel(days)}</span>
                </div>
              </div>
              <div style={{ marginLeft: 'auto', fontSize: 32 }}>{countryFlag(v.country)}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13 }}>
              {[
                ['Visa Type', <span className={`visa-type-badge ${getVisaTypeClass(v.type)}`}>{v.type}</span>],
                ['Host Country', v.country],
                ['Visa Number', <span className="font-mono">{visaNum}</span>],
                ['Passport Number', <span className="font-mono">{passportNum}</span>],
                ['Issue Date', v.issue],
                ['Expiry Date', <strong style={{ color: days <= 15 ? 'var(--red)' : days <= 30 ? 'var(--yellow)' : 'var(--text)' }}>{v.expiry}</strong>],
                ['Passport Expiry', passportExp],
                ['Sponsor / Company', v.sponsor],
                ['Days Remaining', <strong style={{ color: days <= 15 ? 'var(--red)' : days <= 30 ? 'var(--yellow)' : 'var(--green)' }}>{days >= 0 ? days + ' days' : 'EXPIRED'}</strong>],
                ['Email', emp ? emp.email : '—'],
              ].map(([l, val]) => (
                <div key={l} style={{ background: 'var(--bg3)', borderRadius: 'var(--radius2)', padding: 12 }}>
                  <div style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{l}</div>
                  <div>{val}</div>
                </div>
              ))}
            </div>
            {v.notes && <div style={{ marginTop: 14, background: 'rgba(240,128,96,.08)', border: '1px solid rgba(240,128,96,.2)', borderRadius: 'var(--radius2)', padding: 12, fontSize: 13 }}><span style={{ color: 'var(--orange)', fontWeight: 600 }}>📌 Notes: </span>{v.notes}</div>}
          </>,
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Close</button>
            <button className="btn btn-primary" onClick={() => { renewVisa(v.id); closeModal(); showToast(`${v.emp}'s visa renewed!`, 'success') }}>↻ Mark as Renewed</button>
          </>
        )
      })()}

      {/* Visa Notification Modal */}
      {(() => {
        const v = visa
        if (!v) return overlay('visa-notif-modal', '520px', 'Send Visa Expiry Reminder', <div />, <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>)
        const days = daysUntil(v.expiry)
        const visaNum = v.visa_num || v.visaNum
        const passportNum = v.passport_num || v.passportNum
        const urgencyLine = days < 0
          ? `⚠️ URGENT: Your visa has already EXPIRED ${Math.abs(days)} days ago.`
          : days <= 15 ? `🚨 CRITICAL: Your visa expires in only ${days} days.`
          : days <= 30 ? `⚠️ WARNING: Your visa will expire in ${days} days.`
          : `📋 NOTICE: Your visa will expire in ${days} days.`
        const preview = `Dear ${v.emp},\n\n${urgencyLine}\n\nVisa Details:\n• Type: ${v.type}\n• Country: ${v.country}\n• Visa Number: ${visaNum}\n• Expiry Date: ${v.expiry}\n• Passport Number: ${passportNum}\n\nPlease contact HR immediately to initiate the renewal process.\n\nBest regards,\nHR Department — Acme Corporation`
        return overlay('visa-notif-modal', '520px', 'Send Visa Expiry Reminder',
          <>
            <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius2)', padding: 16, marginBottom: 16, fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap', fontFamily: "'DM Sans', sans-serif" }}>{preview}</div>
            <div className="form-group mb-4">
              <label className="form-label">Send To</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}><input type="checkbox" checked={notifToEmp} onChange={e => setNotifToEmp(e.target.checked)} /> Employee</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}><input type="checkbox" checked={notifToHr} onChange={e => setNotifToHr(e.target.checked)} /> HR Department</label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, cursor: 'pointer' }}><input type="checkbox" checked={notifToMgr} onChange={e => setNotifToMgr(e.target.checked)} /> Direct Manager</label>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Additional Message (optional)</label>
              <textarea className="form-textarea" value={notifExtra} onChange={e => setNotifExtra(e.target.value)} placeholder="Add any extra instructions…" />
            </div>
          </>,
          <>
            <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
            <button className="btn btn-primary" onClick={sendVisaNotif}>📧 Send Reminder</button>
          </>
        )
      })()}
    </>
  )
}
