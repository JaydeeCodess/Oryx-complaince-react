import { avatarColor } from '../data/store.js'

export default function Departments({ db, updateDb, showToast, openModal, nav }) {
  const deleteDept = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return
    await updateDb('departments', 'delete', null, id)
    showToast('Department deleted', 'error')
  }

  return (
    <div>
      <div className="section-header">
        <div><div className="section-title">Departments</div><div className="section-sub">Manage organizational structure</div></div>
        <button className="btn btn-primary" onClick={() => openModal('dept-modal')}>＋ New Department</button>
      </div>
      <div className="grid-auto">
        {db.departments.map((d, i) => (
          <div key={d.id} className="card" style={{ borderTop: `3px solid ${avatarColor(i)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'DM Serif Display', serif" }}>{d.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{d.description || d.desc}</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: avatarColor(i), fontFamily: "'DM Serif Display', serif" }}>{d.emp_count ?? d.count}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 14 }}>
              <span style={{ color: 'var(--text3)' }}>Manager</span>
              <span style={{ fontWeight: 500 }}>{d.manager}</span>
            </div>
            <div className="progress-bar"><div className="progress-fill" style={{ width: ((d.emp_count ?? d.count ?? 0) / 142 * 100) + '%', background: avatarColor(i) }} /></div>
            <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 6 }}>{d.emp_count ?? d.count} of 142 employees</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              <button className="btn btn-secondary btn-sm" onClick={() => nav('employees')}>View Employees</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteDept(d.id, d.name)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
