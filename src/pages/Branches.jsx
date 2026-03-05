import { avatarColor } from '../data/store.js'

export default function Branches({ db, updateDb, showToast, openModal }) {
  const deleteBranch = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return
    await updateDb('branches', 'delete', null, id)
    showToast('Branch deleted', 'error')
  }

  return (
    <div>
      <div className="section-header">
        <div><div className="section-title">Branches</div><div className="section-sub">Office locations and facilities</div></div>
        <button className="btn btn-primary" onClick={() => openModal('branch-modal')}>＋ New Branch</button>
      </div>
      <div className="grid-auto">
        {db.branches.map((b, i) => (
          <div key={b.id} className="card" style={{ borderLeft: `3px solid ${avatarColor(i + 2)}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 17, fontWeight: 700, fontFamily: "'DM Serif Display', serif" }}>{b.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 2 }}>{b.address}</div>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: avatarColor(i + 2), fontFamily: "'DM Serif Display', serif" }}>{b.emp_count ?? b.count}</div>
            </div>
            <div style={{ fontSize: 13, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
              <div><span style={{ color: 'var(--text3)' }}>Phone: </span>{b.phone}</div>
              <div><span style={{ color: 'var(--text3)' }}>Email: </span>{b.email}</div>
              <div><span style={{ color: 'var(--text3)' }}>Manager: </span>{b.manager}</div>
              <div><span style={{ color: 'var(--text3)' }}>Employees: </span>{b.emp_count ?? b.count}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm">Edit</button>
              <button className="btn btn-danger btn-sm" onClick={() => deleteBranch(b.id, b.name)}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
