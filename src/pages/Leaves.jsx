import { useState } from 'react'

export default function Leaves({ db, updateDb, showToast }) {
  const [tab, setTab] = useState('pending')
  const [form, setForm] = useState({ type: 'Annual Leave', emp: '', from: '', to: '', reason: '' })
  const [saving, setSaving] = useState(false)
  const sf = v => setForm(p => ({ ...p, ...v }))

  const pending = db.leaves.filter(l => l.status === 'pending')
  const statusMap = { pending: 'yellow', approved: 'green', rejected: 'red' }
  const colorMap = { blue: 'badge-blue', red: 'badge-red', orange: 'badge-orange', purple: 'badge-purple', green: 'badge-green', gray: 'badge-gray' }

  const approveLeave = async (id) => {
    await updateDb('leaves', 'update', { status: 'approved', approved_by: 'Admin', reviewed_at: new Date().toISOString() }, id)
    showToast('Leave approved', 'success')
  }

  const rejectLeave = async (id) => {
    await updateDb('leaves', 'update', { status: 'rejected', approved_by: 'Admin', reviewed_at: new Date().toISOString() }, id)
    showToast('Leave rejected', 'error')
  }

  const submitLeave = async () => {
    if (!form.from || !form.to || !form.emp) { showToast('Please fill required fields', 'error'); return }
    setSaving(true)
    try {
      await updateDb('leaves', 'insert', {
        emp: form.emp,
        type: form.type,
        from_date: form.from,
        to_date: form.to,
        reason: form.reason || null,
        status: 'pending',
        approved_by: '',
      })
      showToast('Leave request submitted!', 'success')
      setTab('pending')
      setForm({ type: 'Annual Leave', emp: '', from: '', to: '', reason: '' })
    } catch (err) {
      showToast('Failed to submit leave', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Support both old (from/to) and new (from_date/to_date) field names
  const getFrom = l => l.from_date || l.from
  const getTo = l => l.to_date || l.to

  return (
    <div>
      <div className="tabs">
        <button className={`tab${tab === 'pending' ? ' active' : ''}`} onClick={() => setTab('pending')}>
          Pending <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 10, padding: '1px 6px', borderRadius: 10, marginLeft: 4 }}>{pending.length}</span>
        </button>
        {[['all', 'All Requests'], ['apply', 'Apply for Leave'], ['types', 'Leave Types']].map(([t, l]) => (
          <button key={t} className={`tab${tab === t ? ' active' : ''}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {tab === 'pending' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Reason</th><th>Actions</th></tr></thead>
              <tbody>
                {pending.length === 0 ? <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text3)', padding: 24 }}>No pending requests</td></tr>
                  : pending.map(l => (
                    <tr key={l.id}>
                      <td><div style={{ fontWeight: 600 }}>{l.emp}</div></td>
                      <td><span className="badge badge-blue">{l.type}</span></td>
                      <td>{getFrom(l)}</td><td>{getTo(l)}</td>
                      <td>{l.days} day{l.days > 1 ? 's' : ''}</td>
                      <td className="td-muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.reason}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-success btn-sm" onClick={() => approveLeave(l.id)}>✓ Approve</button>
                          <button className="btn btn-danger btn-sm" onClick={() => rejectLeave(l.id)}>✕ Reject</button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'all' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Approved By</th></tr></thead>
              <tbody>
                {db.leaves.map(l => (
                  <tr key={l.id}>
                    <td><div style={{ fontWeight: 600 }}>{l.emp}</div></td>
                    <td><span className="badge badge-blue">{l.type}</span></td>
                    <td>{getFrom(l)}</td><td>{getTo(l)}</td>
                    <td>{l.days}d</td>
                    <td><span className={`badge badge-${statusMap[l.status]}`}>{l.status}</span></td>
                    <td className="td-muted">{l.approved_by || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'apply' && (
        <div className="card" style={{ maxWidth: 600 }}>
          <div className="section-title mb-4">Submit Leave Request</div>
          <div className="form-grid">
            <div className="form-group"><label className="form-label">Leave Type *</label>
              <select className="form-select" value={form.type} onChange={e => sf({ type: e.target.value })}>
                {db.leaveTypes.length > 0
                  ? db.leaveTypes.map(t => <option key={t.id}>{t.name}</option>)
                  : ['Annual Leave','Sick Leave','Emergency Leave','Maternity Leave','Paternity Leave','Unpaid Leave'].map(t => <option key={t}>{t}</option>)
                }
              </select>
            </div>
            <div className="form-group"><label className="form-label">Employee *</label>
              <select className="form-select" value={form.emp} onChange={e => sf({ emp: e.target.value })}>
                <option value="">Select…</option>
                {db.employees.map(e => <option key={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">From Date *</label><input type="date" className="form-input" value={form.from} onChange={e => sf({ from: e.target.value })} /></div>
            <div className="form-group"><label className="form-label">To Date *</label><input type="date" className="form-input" value={form.to} onChange={e => sf({ to: e.target.value })} /></div>
            <div className="form-group" style={{ gridColumn: '1/-1' }}><label className="form-label">Reason / Notes</label><textarea className="form-textarea" value={form.reason} onChange={e => sf({ reason: e.target.value })} placeholder="Describe the reason for leave…" /></div>
          </div>
          <button className="btn btn-primary mt-4" onClick={submitLeave} disabled={saving}>
            {saving ? '⏳ Submitting…' : 'Submit Request'}
          </button>
        </div>
      )}

      {tab === 'types' && (
        <div className="grid-auto">
          {db.leaveTypes.map((t, i) => {
            const COLORS = ['#6c8cff','#3ecf8e','#f06060','#f0c060','#a06cff','#f08060']
            return (
              <div key={t.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, fontFamily: "'DM Serif Display', serif" }}>{t.name}</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: COLORS[i % COLORS.length], fontFamily: "'DM Serif Display', serif" }}>{t.days}d</div>
                </div>
                <div style={{ fontSize: 13, color: 'var(--text3)', marginBottom: 12 }}>{t.description || t.desc}</div>
                <span className={`badge ${colorMap[t.color] || 'badge-gray'}`}>{t.days} days allowed</span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
