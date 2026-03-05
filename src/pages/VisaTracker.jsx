import { useState } from 'react'
import { avatarColor, initials, daysUntil, getDaysPillClass, getDaysPillLabel, getVisaBadgeClass, getVisaBadgeLabel, getVisaTypeClass, countryFlag } from '../data/store.js'

function VisaSection({ title, visas, cls, onView, onRemind, onRenew }) {
  const [open, setOpen] = useState(true)
  if (!visas.length) return null
  return (
    <div className={`visa-alert-banner ${cls}`} style={{ marginBottom: 16 }}>
      <div className="visa-alert-header" onClick={() => setOpen(o => !o)} style={{ cursor: 'pointer' }}>
        <div className="visa-alert-title">{title}<span className="visa-alert-count">{visas.length}</span></div>
        <span className="alert-chevron">{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="visa-alert-body open">
          {visas.map(v => {
            const days = daysUntil(v.expiry)
            const empId = v.emp_id || v.empId
            return (
              <div key={v.id} className="visa-row">
                <div className="visa-row-left">
                  <div className="avatar" style={{ background: avatarColor(empId), width: 36, height: 36, fontSize: 13 }}>{initials(v.emp || '')}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{v.emp}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>{v.type} · {v.country} · Visa #{v.visa_num || v.visaNum}</div>
                    <div style={{ fontSize: 12, color: 'var(--text3)' }}>Passport: {v.passport_num || v.passportNum}</div>
                    {v.notes && <div style={{ fontSize: 11, color: 'var(--orange)', marginTop: 3 }}>📌 {v.notes}</div>}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span className={`visa-days-pill ${getDaysPillClass(days)}`} style={days > 60 ? { background: 'rgba(62,207,142,.15)', color: 'var(--green)' } : {}}>{getDaysPillLabel(days)}</span>
                  <div style={{ fontSize: 12, color: 'var(--text3)', textAlign: 'right' }}>
                    <div>Expires: <strong>{v.expiry}</strong></div>
                    <div>Passport exp: {v.passport_exp || v.passportExp}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-secondary btn-sm" onClick={() => onView(v.id)}>Details</button>
                    <button className="btn btn-primary btn-sm" onClick={() => onRemind(v.id)}>📧 Remind</button>
                    <button className="btn btn-success btn-sm" onClick={() => onRenew(v.id)}>↻ Renew</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function VisaTracker({ db, updateDb, showToast, openModal }) {
  const [tab, setTab] = useState('all')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [saving, setSaving] = useState(false)
  const [vaForm, setVaForm] = useState({ empId: '', type: 'Work Visa', num: '', nationality: '', country: 'UAE', passport: '', issue: '', expiry: '', passportExp: '', sponsor: '', notes: '' })
  const sf = v => setVaForm(p => ({ ...p, ...v }))

  const getVisaNum = v => v.visa_num || v.visaNum || ''
  const getPassportNum = v => v.passport_num || v.passportNum || ''
  const getPassportExp = v => v.passport_exp || v.passportExp || ''
  const getEmpId = v => v.emp_id || v.empId

  const filtered = db.visas.filter(v => {
    if (typeFilter && v.type !== typeFilter) return false
    if (statusFilter) {
      const d = daysUntil(v.expiry)
      if (statusFilter === 'active' && d <= 60) return false
      if (statusFilter === 'expiring' && !(d >= 0 && d <= 60)) return false
      if (statusFilter === 'expired' && d >= 0) return false
    }
    if (searchFilter) return (v.emp || '').toLowerCase().includes(searchFilter.toLowerCase()) || getVisaNum(v).toLowerCase().includes(searchFilter.toLowerCase())
    return true
  })

  const critical = db.visas.filter(v => daysUntil(v.expiry) <= 15)
  const warning  = db.visas.filter(v => { const d = daysUntil(v.expiry); return d > 15 && d <= 30 })
  const notice   = db.visas.filter(v => { const d = daysUntil(v.expiry); return d > 30 && d <= 60 })
  const safe     = db.visas.filter(v => daysUntil(v.expiry) > 60)

  const renewVisa = async id => {
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

    showToast('Visa renewed!', 'success')
  }

  const addVisaRecord = async () => {
    if (!vaForm.empId || !vaForm.expiry || !vaForm.issue) { showToast('Please fill required fields', 'error'); return }
    const emp = db.employees.find(e => e.id === vaForm.empId)
    if (!emp) { showToast('Employee not found', 'error'); return }
    setSaving(true)
    try {
      await updateDb('visas', 'insert', {
        emp_id: vaForm.empId,
        emp: emp.name,
        nationality: vaForm.nationality || null,
        type: vaForm.type,
        visa_num: vaForm.num || 'PENDING',
        country: vaForm.country,
        issue: vaForm.issue,
        expiry: vaForm.expiry,
        passport_num: vaForm.passport || null,
        passport_exp: vaForm.passportExp || null,
        sponsor: vaForm.sponsor || null,
        notes: vaForm.notes || null,
        renewed: false,
      })
      showToast(`Visa record added for ${emp.name}!`, 'success')
      setTab('all')
      setVaForm({ empId: '', type: 'Work Visa', num: '', nationality: '', country: 'UAE', passport: '', issue: '', expiry: '', passportExp: '', sponsor: '', notes: '' })
    } catch (err) {
      showToast('Failed to add visa', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="tabs">
        {[['all','All Visas'],['expiring','Expiring Soon'],['add','Add Visa Record'],['history','Renewal History']].map(([t,l]) => (
          <button key={t} className={`tab${tab===t?' active':''}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {tab === 'all' && (
        <div>
          <div className="section-header">
            <div><div className="section-title">Visa & Immigration Records</div><div className="section-sub">{filtered.length} visa records</div></div>
            <div style={{ display:'flex',gap:10,flexWrap:'wrap' }}>
              <select className="form-select" style={{ width:160 }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                <option value="">All Types</option>
                {['Work Visa','Residence Permit','Business Visa','Dependent Visa','Student Visa'].map(t => <option key={t}>{t}</option>)}
              </select>
              <select className="form-select" style={{ width:160 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
              </select>
              <input className="form-input" style={{ width:200 }} placeholder="Search employee…" value={searchFilter} onChange={e => setSearchFilter(e.target.value)} />
            </div>
          </div>
          <div className="card" style={{ padding:0,overflow:'hidden' }}>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Employee</th><th>Nationality</th><th>Visa Type</th><th>Visa Number</th><th>Country</th><th>Issue Date</th><th>Expiry Date</th><th>Days Left</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.length === 0 ? <tr><td colSpan="10" style={{ textAlign:'center',color:'var(--text3)',padding:24 }}>No records found</td></tr>
                    : filtered.map(v => {
                      const days = daysUntil(v.expiry)
                      const empId = getEmpId(v)
                      return (
                        <tr key={v.id}>
                          <td>
                            <div style={{ display:'flex',alignItems:'center',gap:9 }}>
                              <div className="avatar" style={{ background:avatarColor(empId) }}>{initials(v.emp || '')}</div>
                              <div><div style={{ fontWeight:600,fontSize:14 }}>{v.emp}</div><div style={{ fontSize:11,color:'var(--text3)' }}>{v.nationality}</div></div>
                            </div>
                          </td>
                          <td className="td-muted">{v.nationality}</td>
                          <td><span className={`visa-type-badge ${getVisaTypeClass(v.type)}`}>{v.type}</span></td>
                          <td className="font-mono" style={{ fontSize:12 }}>{getVisaNum(v)}</td>
                          <td><div style={{ display:'flex',alignItems:'center',gap:6 }}><span style={{ fontSize:18 }}>{countryFlag(v.country)}</span><span className="td-muted">{v.country}</span></div></td>
                          <td className="td-muted">{v.issue}</td>
                          <td style={{ fontWeight:600 }}>{v.expiry}</td>
                          <td><span className={`visa-days-pill ${getDaysPillClass(days)}`} style={days>60?{background:'rgba(62,207,142,.15)',color:'var(--green)'}:{}}>{getDaysPillLabel(days)}</span></td>
                          <td><span className={`badge ${getVisaBadgeClass(days)}`}>{getVisaBadgeLabel(days)}</span></td>
                          <td>
                            <div style={{ display:'flex',gap:5 }}>
                              <button className="btn btn-secondary btn-sm" onClick={() => openModal('visa-detail-modal',{visaId:v.id})}>👁</button>
                              <button className="btn btn-primary btn-sm" onClick={() => openModal('visa-notif-modal',{visaId:v.id})}>📧</button>
                              <button className="btn btn-success btn-sm" onClick={() => renewVisa(v.id)}>↻</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'expiring' && (
        <div>
          <div style={{ marginBottom:16,display:'flex',gap:10,flexWrap:'wrap' }}>
            {[['Critical (≤15 days)',critical.length,'red'],['Warning (≤30 days)',warning.length,'yellow'],['Notice (≤60 days)',notice.length,'blue'],['Active & Safe',safe.length,'green']].map(([l,v,c]) => (
              <div key={l} className={`stat-card ${c}`} style={{ padding:16,flex:1,minWidth:140 }}>
                <div className="stat-label">{l}</div>
                <div className="stat-value" style={{ fontSize:28 }}>{v}</div>
              </div>
            ))}
          </div>
          {!critical.length && !warning.length && !notice.length ? (
            <div className="card" style={{ textAlign:'center',padding:40,color:'var(--green)' }}>
              <div style={{ fontSize:48,marginBottom:12 }}>✅</div>
              <div style={{ fontSize:18,fontWeight:700 }}>All visas are current!</div>
              <div style={{ fontSize:14,color:'var(--text3)',marginTop:6 }}>No visas expiring in the next 60 days.</div>
            </div>
          ) : (
            <>
              <VisaSection title="🚨 Critical — Expiring in ≤15 days" visas={critical} cls="red" onView={id => openModal('visa-detail-modal',{visaId:id})} onRemind={id => openModal('visa-notif-modal',{visaId:id})} onRenew={renewVisa} />
              <VisaSection title="⚠️ Warning — Expiring in ≤30 days" visas={warning} cls="warn" onView={id => openModal('visa-detail-modal',{visaId:id})} onRemind={id => openModal('visa-notif-modal',{visaId:id})} onRenew={renewVisa} />
              <VisaSection title="📋 Notice — Expiring in ≤60 days" visas={notice} cls="notice" onView={id => openModal('visa-detail-modal',{visaId:id})} onRemind={id => openModal('visa-notif-modal',{visaId:id})} onRenew={renewVisa} />
            </>
          )}
        </div>
      )}

      {tab === 'add' && (
        <div className="card" style={{ maxWidth:720 }}>
          <div className="section-title mb-4">Add / Update Visa Record</div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Employee *</label>
              <select className="form-select" value={vaForm.empId} onChange={e => sf({ empId: e.target.value })}>
                <option value="">Select…</option>
                {db.employees.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Visa / Permit Type *</label>
              <select className="form-select" value={vaForm.type} onChange={e => sf({ type: e.target.value })}>
                {['Work Visa','Residence Permit','Business Visa','Dependent Visa','Student Visa'].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Visa Number</label><input className="form-input" placeholder="e.g. A1234567" value={vaForm.num} onChange={e => sf({ num: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Nationality</label><input className="form-input" placeholder="e.g. Pakistani" value={vaForm.nationality} onChange={e => sf({ nationality: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Host Country *</label>
              <select className="form-select" value={vaForm.country} onChange={e => sf({ country: e.target.value })}>
                {['UAE','Saudi Arabia','Qatar','Kuwait','Bahrain','Oman','UK','USA','Canada','Germany','Other'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Passport Number</label><input className="form-input" placeholder="e.g. AB1234567" value={vaForm.passport} onChange={e => sf({ passport: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Issue Date *</label><input type="date" className="form-input" value={vaForm.issue} onChange={e => sf({ issue: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Expiry Date *</label><input type="date" className="form-input" value={vaForm.expiry} onChange={e => sf({ expiry: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Passport Expiry</label><input type="date" className="form-input" value={vaForm.passportExp} onChange={e => sf({ passportExp: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">Sponsor / Company</label><input className="form-input" placeholder="Sponsoring organization" value={vaForm.sponsor} onChange={e => sf({ sponsor: e.target.value })} /></div>
            <div className="form-group" style={{ gridColumn:'1/-1' }}><label className="form-label">Notes</label><textarea className="form-textarea" placeholder="Renewal status, special conditions…" value={vaForm.notes} onChange={e => sf({ notes: e.target.value })} /></div>
          </div>
          {vaForm.expiry && (
            <div style={{ marginTop:16,background:'var(--bg3)',borderRadius:'var(--radius2)',padding:14,fontSize:14 }}>
              Days until expiry: {(() => { const d = daysUntil(vaForm.expiry); return <><span className={`visa-days-pill ${getDaysPillClass(d)}`} style={d>60?{background:'rgba(62,207,142,.15)',color:'var(--green)'}:{}}>{getDaysPillLabel(d)}</span> &nbsp; <span className={`badge ${getVisaBadgeClass(d)}`}>{getVisaBadgeLabel(d)}</span></> })()}
            </div>
          )}
          <div style={{ display:'flex',gap:10,marginTop:20 }}>
            <button className="btn btn-primary" onClick={addVisaRecord} disabled={saving}>{saving ? '⏳ Saving…' : 'Save Visa Record'}</button>
            <button className="btn btn-secondary" onClick={() => setTab('all')}>Cancel</button>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="card" style={{ padding:0,overflow:'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Employee</th><th>Visa Type</th><th>Old Expiry</th><th>New Expiry</th><th>Renewed On</th><th>Renewed By</th><th>Notes</th></tr></thead>
              <tbody>
                {db.visaHistory.map(h => (
                  <tr key={h.id}>
                    <td style={{ fontWeight:600 }}>{h.emp_name || h.emp}</td>
                    <td><span className={`visa-type-badge ${getVisaTypeClass(h.type)}`}>{h.type}</span></td>
                    <td className="td-muted">{h.old_expiry || h.oldExpiry}</td>
                    <td style={{ color:'var(--green)',fontWeight:600 }}>{h.new_expiry || h.newExpiry}</td>
                    <td className="td-muted">{h.renewed_on || h.renewedOn}</td>
                    <td className="td-muted">{h.renewed_by || h.renewedBy}</td>
                    <td className="td-muted" style={{ fontSize:12 }}>{h.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
