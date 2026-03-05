import { useState } from 'react'
import { avatarColor, initials } from '../data/store.js'

const EMP_PER_PAGE = 15

export default function Employees({ db, updateDb, showToast, openModal, globalSearch }) {
  const [tab, setTab] = useState('list')
  const [page, setPage] = useState(1)
  const [deptFilter, setDeptFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [addStep, setAddStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [needsVisa, setNeedsVisa] = useState(false)
  const [passportWarning, setPassportWarning] = useState(false)
  const [visaPreview, setVisaPreview] = useState(null)
  const [form, setForm] = useState({
    name:'', email:'', phone:'', gender:'Male', dob:'', nationality:'', nid:'', emergency:'', addr:'',
    title:'', hire:'', dept:'Engineering', branch:'HQ - Downtown', emptype:'Full-Time',
    salary:'', housing:'', transport:'', contractStart:'', contractEnd:'',
    passportNum:'', passportIssue:'', passportExp:'', passportCountry:'',
    visaType:'Work Visa', visaCountry:'UAE', visaNum:'', sponsor:'', visaIssue:'', visaExpiry:'',
    labour:'', labourExp:'', insurance:'', insuranceExp:'', visaNotes:''
  })

  const allFiltered = db.employees.filter(e => {
    const q = (globalSearch || searchFilter).toLowerCase()
    if (deptFilter && e.dept !== deptFilter) return false
    if (q) return e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q) || e.dept.toLowerCase().includes(q)
    return true
  })
  const start = (page - 1) * EMP_PER_PAGE
  const pageEmps = allFiltered.slice(start, start + EMP_PER_PAGE)

  const sf = v => setForm(p => ({ ...p, ...v }))

  const addEmployee = async () => {
    if (!form.name || !form.email) { setAddStep(1); showToast('Name and email are required', 'error'); return }
    setSaving(true)
    try {
      // Generate employee number
      const empNum = 'EMP-' + String(db.employees.length + 1).padStart(3, '0')

      const newEmp = {
        employee_number: form.nid || empNum,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        gender: form.gender,
        dob: form.dob || null,
        nationality: form.nationality || null,
        nid: form.nid || empNum,
        emergency: form.emergency || null,
        addr: form.addr || null,
        title: form.title || null,
        hire: form.hire || new Date().toISOString().split('T')[0],
        dept: form.dept,
        branch: form.branch,
        emp_type: form.emptype,
        salary: parseFloat(form.salary) || 0,
        housing: parseFloat(form.housing) || 0,
        transport: parseFloat(form.transport) || 0,
        contract_start: form.contractStart || null,
        contract_end: form.contractEnd || null,
        status: 'Active',
      }

      const inserted = await updateDb('employees', 'insert', newEmp)

      // Add visa if needed
      if (needsVisa && form.visaExpiry && form.visaIssue && inserted) {
        await updateDb('visas', 'insert', {
          emp_id: inserted.id,
          nationality: form.nationality || null,
          type: form.visaType,
          visa_num: form.visaNum || 'PENDING',
          country: form.visaCountry,
          issue: form.visaIssue,
          expiry: form.visaExpiry,
          passport_num: form.passportNum || null,
          passport_exp: form.passportExp || null,
          passport_country: form.passportCountry || null,
          sponsor: form.sponsor || 'Acme Corporation',
          labour: form.labour || null,
          labour_exp: form.labourExp || null,
          insurance: form.insurance || null,
          insurance_exp: form.insuranceExp || null,
          notes: form.visaNotes || null,
          renewed: false,
        })
      }

      showToast(`${form.name} added!`, 'success')
      setTab('list')
      setAddStep(1)
      setNeedsVisa(false)
      setForm(p => Object.fromEntries(Object.keys(p).map(k => [k, k === 'gender' ? 'Male' : k === 'dept' ? 'Engineering' : k === 'branch' ? 'HQ - Downtown' : k === 'emptype' ? 'Full-Time' : k === 'visaType' ? 'Work Visa' : k === 'visaCountry' ? 'UAE' : ''])))
    } catch (err) {
      showToast('Failed to add employee', 'error')
    } finally {
      setSaving(false)
    }
  }

  const deleteEmployee = async (id, name) => {
    if (!confirm(`Remove ${name}?`)) return
    await updateDb('employees', 'delete', null, id)
    showToast('Employee removed', 'error')
  }

  return (
    <div>
      <div className="tabs">
        {[['list', 'All Employees'], ['grid', 'Card View'], ['add', 'Add New']].map(([t, lbl]) => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{lbl}</button>
        ))}
      </div>

      {tab === 'list' && (
        <div>
          <div className="section-header">
            <div><div className="section-title">Employees</div><div className="section-sub">{allFiltered.length} employees</div></div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <select className="form-select" style={{ width: 160 }} value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1) }}>
                <option value="">All Departments</option>
                {[...new Set(db.employees.map(e => e.dept))].sort().map(d => <option key={d}>{d}</option>)}
              </select>
              <input className="form-input" style={{ width: 200 }} placeholder="Search employees…" value={searchFilter} onChange={e => { setSearchFilter(e.target.value); setPage(1) }} />
            </div>
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Employee</th><th>Department</th><th>Branch</th><th>Phone</th><th>Hired</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {pageEmps.map(e => (
                    <tr key={e.id} style={{ cursor: 'pointer' }} onClick={() => openModal('emp-detail-modal', { empId: e.id })}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="avatar" style={{ background: avatarColor(e.employee_number?.replace('EMP-','') || 1) }}>{initials(e.name)}</div>
                          <div><div style={{ fontWeight: 600, fontSize: 14 }}>{e.name}</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>{e.email}</div></div>
                        </div>
                      </td>
                      <td><span className="badge badge-blue">{e.dept}</span></td>
                      <td className="td-muted">{e.branch}</td>
                      <td className="td-muted">{e.phone}</td>
                      <td className="td-muted">{e.hire}</td>
                      <td><span className="badge badge-green">{e.status}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={ev => { ev.stopPropagation(); openModal('emp-detail-modal', { empId: e.id }) }}>👁</button>
                          <button className="btn btn-danger btn-sm" onClick={ev => { ev.stopPropagation(); deleteEmployee(e.id, e.name) }}>🗑</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, fontSize: 13, color: 'var(--text3)' }}>
            <span>Showing {start + 1}–{Math.min(start + EMP_PER_PAGE, allFiltered.length)} of {allFiltered.length}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))}>← Prev</button>
              <button className="btn btn-secondary btn-sm" onClick={() => setPage(p => Math.min(Math.ceil(allFiltered.length / EMP_PER_PAGE), p + 1))}>Next →</button>
            </div>
          </div>
        </div>
      )}

      {tab === 'grid' && (
        <div className="grid-auto">
          {db.employees.map((e, i) => (
            <div key={e.id} className="emp-card" onClick={() => openModal('emp-detail-modal', { empId: e.id })}>
              <div className="avatar" style={{ background: avatarColor(i), width: 48, height: 48, fontSize: 16 }}>{initials(e.name)}</div>
              <div className="emp-card-info">
                <div className="emp-card-name">{e.name}</div>
                <div className="emp-card-role">{e.title} · {e.dept}</div>
                <div className="emp-card-meta">
                  <span className="badge badge-blue" style={{ fontSize: 11 }}>{e.dept}</span>
                  <span className="badge badge-gray" style={{ fontSize: 11 }}>{e.branch?.split('-')[0]?.trim()}</span>
                  <span className="badge badge-green" style={{ fontSize: 11 }}>Active</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'add' && (
        <div style={{ maxWidth: 780 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 24 }}>
            {[['1', 'Personal Info'], ['2', 'Employment'], ['3', '🛂 Visa & Documents']].map(([num, lbl], i) => (
              <>
                {i > 0 && <div className="add-step-line" key={'line' + i} />}
                <div key={num} className={`add-step${addStep === i + 1 ? ' active' : addStep > i + 1 ? ' done' : ''}`} onClick={() => setAddStep(i + 1)}>
                  <div className="add-step-num">{num}</div>
                  <div className="add-step-label">{lbl}</div>
                </div>
              </>
            ))}
          </div>

          {addStep === 1 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>1</div>
                <div><div className="section-title" style={{ fontSize: 17 }}>Personal Information</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>Basic details about the employee</div></div>
              </div>
              <div className="form-grid">
                {[['Full Name *', 'name', 'text', 'John Doe'], ['Email *', 'email', 'email', 'john@company.com'], ['Phone', 'phone', 'text', '+1 555 0000'], ['Date of Birth', 'dob', 'date', ''], ['Nationality', 'nationality', 'text', 'e.g. Pakistani'], ['National ID / Iqama No.', 'nid', 'text', 'ID number'], ['Emergency Contact', 'emergency', 'text', 'Name · Phone']].map(([lbl, key, type, ph]) => (
                  <div key={key} className="form-group"><label className="form-label">{lbl}</label><input className="form-input" type={type} placeholder={ph} value={form[key]} onChange={e => sf({ [key]: e.target.value })} /></div>
                ))}
                <div className="form-group"><label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={e => sf({ gender: e.target.value })}>
                    <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
                <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Home Address</label><textarea className="form-textarea" placeholder="Full address…" value={form.addr} onChange={e => sf({ addr: e.target.value })} style={{ minHeight: 70 }} /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 20 }}>
                <button className="btn btn-primary" onClick={() => setAddStep(2)}>Next: Employment →</button>
              </div>
            </div>
          )}

          {addStep === 2 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>2</div>
                <div><div className="section-title" style={{ fontSize: 17 }}>Employment Details</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>Job role, department and compensation</div></div>
              </div>
              <div className="form-grid">
                <div className="form-group"><label className="form-label">Position / Title</label><input className="form-input" placeholder="e.g. Software Engineer" value={form.title} onChange={e => sf({ title: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Hire Date *</label><input className="form-input" type="date" value={form.hire} onChange={e => sf({ hire: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Department *</label>
                  <select className="form-select" value={form.dept} onChange={e => sf({ dept: e.target.value })}>
                    {db.departments.map(d => <option key={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Branch *</label>
                  <select className="form-select" value={form.branch} onChange={e => sf({ branch: e.target.value })}>
                    {db.branches.map(b => <option key={b.id}>{b.name}</option>)}
                  </select>
                </div>
                <div className="form-group"><label className="form-label">Employment Type</label>
                  <select className="form-select" value={form.emptype} onChange={e => sf({ emptype: e.target.value })}>
                    <option>Full-Time</option><option>Part-Time</option><option>Contract</option><option>Intern</option>
                  </select>
                </div>
                {[['Basic Salary (Monthly)', 'salary', '5000'], ['Housing Allowance', 'housing', '500'], ['Transport Allowance', 'transport', '200']].map(([lbl, key, ph]) => (
                  <div key={key} className="form-group"><label className="form-label">{lbl}</label><input className="form-input" type="number" placeholder={ph} value={form[key]} onChange={e => sf({ [key]: e.target.value })} /></div>
                ))}
                <div className="form-group"><label className="form-label">Contract Start</label><input className="form-input" type="date" value={form.contractStart} onChange={e => sf({ contractStart: e.target.value })} /></div>
                <div className="form-group"><label className="form-label">Contract End</label><input className="form-input" type="date" value={form.contractEnd} onChange={e => sf({ contractEnd: e.target.value })} /></div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
                <button className="btn btn-secondary" onClick={() => setAddStep(1)}>← Back</button>
                <button className="btn btn-primary" onClick={() => setAddStep(3)}>Next: Visa & Documents →</button>
              </div>
            </div>
          )}

          {addStep === 3 && (
            <div className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#fff' }}>🛂</div>
                <div><div className="section-title" style={{ fontSize: 17 }}>Visa & Immigration Documents</div><div style={{ fontSize: 12, color: 'var(--text3)' }}>Passport, visa and work permit details</div></div>
              </div>
              <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius2)', padding: '14px 16px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>This employee requires a work visa</div>
                  <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>Enable to fill in visa and immigration details</div>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={needsVisa} onChange={e => setNeedsVisa(e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </div>

              {needsVisa && (
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>📘 Passport Details</div>
                  <div className="form-grid" style={{ marginBottom: 20 }}>
                    <div className="form-group"><label className="form-label">Passport Number *</label><input className="form-input" placeholder="e.g. AB1234567" value={form.passportNum} onChange={e => sf({ passportNum: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Passport Issue Date</label><input type="date" className="form-input" value={form.passportIssue} onChange={e => sf({ passportIssue: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Passport Expiry Date *</label><input type="date" className="form-input" value={form.passportExp} onChange={e => { sf({ passportExp: e.target.value }); setPassportWarning(e.target.value && Math.round((new Date(e.target.value) - new Date()) / 86400000) < 180) }} /></div>
                    <div className="form-group"><label className="form-label">Issuing Country</label><input className="form-input" placeholder="e.g. Pakistan" value={form.passportCountry} onChange={e => sf({ passportCountry: e.target.value })} /></div>
                  </div>
                  {passportWarning && <div style={{ background: 'rgba(240,192,96,.1)', border: '1px solid rgba(240,192,96,.3)', borderRadius: 'var(--radius2)', padding: '10px 14px', fontSize: 13, color: 'var(--yellow)', marginBottom: 16 }}>⚠️ Passport expires soon — make sure it's valid for at least 6 months beyond the visa period.</div>}

                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>🛂 Visa / Work Permit</div>
                  <div className="form-grid" style={{ marginBottom: 20 }}>
                    <div className="form-group"><label className="form-label">Visa / Permit Type *</label>
                      <select className="form-select" value={form.visaType} onChange={e => sf({ visaType: e.target.value })}>
                        <option>Work Visa</option><option>Residence Permit</option><option>Business Visa</option><option>Dependent Visa</option><option>Student Visa</option>
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Host Country *</label>
                      <select className="form-select" value={form.visaCountry} onChange={e => sf({ visaCountry: e.target.value })}>
                        {['UAE','Saudi Arabia','Qatar','Kuwait','Bahrain','Oman','UK','USA','Canada','Germany','Other'].map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label className="form-label">Visa Number</label><input className="form-input" placeholder="e.g. UV-2024-0012" value={form.visaNum} onChange={e => sf({ visaNum: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Sponsor / Employer</label><input className="form-input" placeholder="Sponsoring company" value={form.sponsor} onChange={e => sf({ sponsor: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Visa Issue Date</label><input type="date" className="form-input" value={form.visaIssue} onChange={e => sf({ visaIssue: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Visa Expiry Date *</label><input type="date" className="form-input" value={form.visaExpiry} onChange={e => { sf({ visaExpiry: e.target.value }); setVisaPreview(e.target.value) }} /></div>
                  </div>
                  {visaPreview && (
                    <div style={{ background: 'var(--bg3)', borderRadius: 'var(--radius2)', padding: '14px 16px', marginBottom: 20, fontSize: 13 }}>
                      <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text2)' }}>Visa Status Preview</div>
                      <span>Expires: {visaPreview} · {(() => { const d = Math.round((new Date(visaPreview) - new Date()) / 86400000); return d > 0 ? `${d} days left` : 'Expired' })()}</span>
                    </div>
                  )}

                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text3)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>📋 Additional Documents</div>
                  <div className="form-grid">
                    <div className="form-group"><label className="form-label">Labour / Work Permit No.</label><input className="form-input" placeholder="Labour permit number" value={form.labour} onChange={e => sf({ labour: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Labour Permit Expiry</label><input type="date" className="form-input" value={form.labourExp} onChange={e => sf({ labourExp: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Health Insurance No.</label><input className="form-input" placeholder="Insurance card number" value={form.insurance} onChange={e => sf({ insurance: e.target.value })} /></div>
                    <div className="form-group"><label className="form-label">Insurance Expiry</label><input type="date" className="form-input" value={form.insuranceExp} onChange={e => sf({ insuranceExp: e.target.value })} /></div>
                    <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Notes / Special Conditions</label><textarea className="form-textarea" placeholder="e.g. Awaiting passport renewal…" value={form.visaNotes} onChange={e => sf({ visaNotes: e.target.value })} style={{ minHeight: 70 }} /></div>
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-secondary" onClick={() => setAddStep(2)}>← Back</button>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button className="btn btn-secondary" onClick={() => setTab('list')}>Cancel</button>
                  <button className="btn btn-primary" style={{ padding: '10px 24px' }} onClick={addEmployee} disabled={saving}>
                    {saving ? '⏳ Saving…' : '✓ Save Employee'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
