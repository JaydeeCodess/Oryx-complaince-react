import { useState } from 'react'
import { avatarColor, initials } from '../data/store.js'

export default function Payroll({ db, showToast }) {
  const [tab, setTab] = useState('overview')
  const [selEmp, setSelEmp] = useState('')
  const [selMonth, setSelMonth] = useState('July 2025')

  // Support both old and new field names
  const getBasic = p => p.basic || p.basic_salary || 0
  const getAllowance = p => p.allowance || p.allowances || 0
  const getDeduction = p => p.deduction || p.total_deductions || 0
  const getNet = p => p.net || p.net_salary || 0

  const p = selEmp ? db.payroll.find(x => x.name === selEmp) : null
  const emp = selEmp ? db.employees.find(e => e.name === selEmp) : null

  // Real totals from Supabase data
  const totalGross     = db.payroll.reduce((s, p) => s + (p.gross || getBasic(p) + getAllowance(p)), 0)
  const totalNet       = db.payroll.reduce((s, p) => s + getNet(p), 0)
  const totalDeduction = db.payroll.reduce((s, p) => s + getDeduction(p), 0)
  const avgNet         = db.payroll.length ? Math.round(totalNet / db.payroll.length) : 0

  const fmt = n => '$' + Math.round(n).toLocaleString()

  return (
    <div>
      <div className="tabs">
        {[['overview','Overview'],['payslip','Payslips'],['run','Run Payroll']].map(([t,l]) => (
          <button key={t} className={`tab${tab===t?' active':''}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {tab === 'overview' && (
        <div>
          <div className="stat-grid" style={{ marginBottom: 24 }}>
            {[
              ['Gross Payroll', fmt(totalGross), 'This month', 'blue'],
              ['Net Payroll', fmt(totalNet), 'After deductions', 'green'],
              ['Total Deductions', fmt(totalDeduction), 'Tax + Benefits', 'yellow'],
              ['Avg Net Salary', fmt(avgNet), 'Per employee', 'purple']
            ].map(([l,v,s,c]) => (
              <div key={l} className={`stat-card ${c}`}><div className="stat-label">{l}</div><div className="stat-value">{v}</div><div className="stat-sub">{s}</div></div>
            ))}
          </div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Employee</th><th>Department</th><th>Basic</th><th>Allowances</th><th>Deductions</th><th>Net Pay</th><th>Status</th></tr></thead>
                <tbody>
                  {db.payroll.slice(0,20).map((p, i) => (
                    <tr key={p.id || i}>
                      <td><div style={{ display:'flex',alignItems:'center',gap:10 }}><div className="avatar" style={{ background:avatarColor(i) }}>{initials(p.name)}</div><span style={{ fontWeight:500 }}>{p.name}</span></div></td>
                      <td className="td-muted">{p.dept}</td>
                      <td>{fmt(getBasic(p))}</td>
                      <td style={{ color:'var(--green)' }}>+{fmt(getAllowance(p))}</td>
                      <td style={{ color:'var(--red)' }}>-{fmt(getDeduction(p))}</td>
                      <td><strong style={{ color:'var(--accent3)' }}>{fmt(getNet(p))}</strong></td>
                      <td><span className={`badge badge-${p.status === 'paid' ? 'green' : 'yellow'}`}>{p.status || 'paid'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'payslip' && (
        <div>
          <div style={{ display:'flex',gap:14,marginBottom:24,flexWrap:'wrap' }}>
            <select className="form-select" style={{ width:220 }} value={selEmp} onChange={e => setSelEmp(e.target.value)}>
              <option value="">Select Employee…</option>
              {db.employees.map(e => <option key={e.id}>{e.name}</option>)}
            </select>
            <select className="form-select" style={{ width:160 }} value={selMonth} onChange={e => setSelMonth(e.target.value)}>
              {(db.payroll_periods?.length > 0
                ? db.payroll_periods.map(pp => pp.name)
                : ['January 2025','February 2025','March 2025','April 2025','May 2025','June 2025','July 2025']
              ).map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          {p && emp && (
            <div style={{ maxWidth: 600 }}>
              <div className="payslip">
                <div className="payslip-header">
                  <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start' }}>
                    <div><div style={{ fontFamily:"'DM Serif Display',serif",fontSize:26,marginBottom:4 }}>HRS</div><div style={{ opacity:.8,fontSize:13 }}>Acme Corporation</div></div>
                    <div style={{ textAlign:'right' }}><div style={{ fontSize:13,opacity:.8 }}>Payslip</div><div style={{ fontSize:16,fontWeight:700 }}>{selMonth}</div></div>
                  </div>
                  <div style={{ marginTop:20,paddingTop:16,borderTop:'1px solid rgba(255,255,255,.2)' }}>
                    <div style={{ fontSize:18,fontWeight:700 }}>{p.name}</div>
                    <div style={{ opacity:.8,fontSize:13 }}>{emp.title} · {emp.dept} · {emp.nid || emp.employee_number}</div>
                  </div>
                </div>
                <div className="payslip-body">
                  <div style={{ fontSize:12,fontWeight:600,color:'var(--text3)',letterSpacing:1,textTransform:'uppercase',marginBottom:10 }}>Earnings</div>
                  <div className="payslip-row"><span>Basic Salary</span><span>{fmt(getBasic(p))}</span></div>
                  <div className="payslip-row"><span>Housing Allowance</span><span style={{ color:'var(--green)' }}>+{fmt(Math.round(getBasic(p)*.1))}</span></div>
                  <div className="payslip-row"><span>Transport Allowance</span><span style={{ color:'var(--green)' }}>+{fmt(Math.round(getBasic(p)*.05))}</span></div>
                  <div style={{ fontSize:12,fontWeight:600,color:'var(--text3)',letterSpacing:1,textTransform:'uppercase',margin:'14px 0 10px' }}>Deductions</div>
                  <div className="payslip-row"><span>Income Tax</span><span style={{ color:'var(--red)' }}>-{fmt(Math.round(getBasic(p)*.12))}</span></div>
                  <div className="payslip-row"><span>Social Security</span><span style={{ color:'var(--red)' }}>-{fmt(Math.round(getBasic(p)*.04))}</span></div>
                  <div className="payslip-row"><span>Health Insurance</span><span style={{ color:'var(--red)' }}>-{fmt(Math.round(getBasic(p)*.02))}</span></div>
                  <div style={{ borderTop:'2px solid var(--border)',marginTop:12 }}>
                    <div className="payslip-total"><span>Net Pay</span><span>{fmt(getNet(p))}</span></div>
                  </div>
                </div>
              </div>
              <div style={{ marginTop:12,display:'flex',gap:10 }}>
                <button className="btn btn-primary btn-sm" onClick={() => showToast('Payslip downloaded!','success')}>⬇ Download PDF</button>
                <button className="btn btn-secondary btn-sm" onClick={() => showToast('Payslip emailed to '+emp.email,'info')}>✉ Email Payslip</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'run' && (
        <div className="card" style={{ maxWidth:500 }}>
          <div className="section-title mb-4">Run Monthly Payroll</div>
          <div className="form-group mb-4">
            <label className="form-label">Payroll Period</label>
            <select className="form-select">
              {(db.payroll_periods?.length > 0
                ? db.payroll_periods.map(pp => pp.name)
                : ['August 2025','July 2025','June 2025']
              ).map(m => <option key={m}>{m}</option>)}
            </select>
          </div>
          <div className="form-group mb-4">
            <label className="form-label">Include</label>
            <div style={{ display:'flex',flexDirection:'column',gap:8,marginTop:4 }}>
              {[['Basic Salaries',true],['Allowances',true],['Tax Deductions',true],['Performance Bonuses',false]].map(([l,c]) => (
                <label key={l} style={{ display:'flex',alignItems:'center',gap:8,fontSize:14,cursor:'pointer' }}><input type="checkbox" defaultChecked={c} /> {l}</label>
              ))}
            </div>
          </div>
          <div style={{ background:'var(--bg3)',borderRadius:'var(--radius2)',padding:16,marginBottom:20,fontSize:13 }}>
            {[['Employees affected:', db.payroll.length],['Estimated gross:', fmt(totalGross)],['Estimated net:', fmt(totalNet)]].map(([l,v],i) => (
              <div key={l} style={{ display:'flex',justifyContent:'space-between',marginBottom: i<2?6:0 }}><span>{l}</span><strong style={i===2?{color:'var(--green)'}:{}}>{v}</strong></div>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => showToast(`Payroll processed for ${db.payroll.length} employees!`,'success')}>▶ Process Payroll</button>
        </div>
      )}
    </div>
  )
}
