export default function Settings({ showToast }) {
  return (
    <div className="grid-2">
      <div className="card">
        <div className="section-title mb-4">Company Settings</div>
        <div className="form-group mb-4"><label className="form-label">Company Name</label><input className="form-input" defaultValue="Acme Corporation" /></div>
        <div className="form-group mb-4"><label className="form-label">Company Email</label><input className="form-input" defaultValue="hr@acme.com" /></div>
        <div className="form-group mb-4"><label className="form-label">Work Start Time</label><input className="form-input" type="time" defaultValue="09:00" /></div>
        <div className="form-group mb-4"><label className="form-label">Work End Time</label><input className="form-input" type="time" defaultValue="17:30" /></div>
        <div className="form-group mb-4"><label className="form-label">Late Threshold (minutes)</label><input className="form-input" type="number" defaultValue="15" /></div>
        <div className="form-group mb-4">
          <label className="form-label">Weekend Days</label>
          <div style={{ display:'flex',gap:8,flexWrap:'wrap',marginTop:4 }}>
            {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((d,i) => (
              <label key={d} style={{ display:'flex',alignItems:'center',gap:6,fontSize:14,cursor:'pointer' }}>
                <input type="checkbox" defaultChecked={i>=5} /> {d}
              </label>
            ))}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => showToast('Settings saved!','success')}>Save Settings</button>
      </div>
      <div>
        <div className="card mb-4">
          <div className="section-title mb-4">My Profile</div>
          <div style={{ display:'flex',alignItems:'center',gap:16,marginBottom:20 }}>
            <div className="user-avatar" style={{ width:60,height:60,fontSize:22 }}>AD</div>
            <div>
              <div style={{ fontSize:16,fontWeight:600 }}>Admin User</div>
              <div style={{ fontSize:13,color:'var(--text3)' }}>Administrator · HR Management</div>
            </div>
          </div>
          <div className="form-group mb-4"><label className="form-label">Full Name</label><input className="form-input" defaultValue="Admin User" /></div>
          <div className="form-group mb-4"><label className="form-label">Email</label><input className="form-input" defaultValue="admin@acme.com" /></div>
          <div className="form-group mb-4"><label className="form-label">New Password</label><input className="form-input" type="password" placeholder="Leave blank to keep current" /></div>
          <button className="btn btn-primary" onClick={() => showToast('Profile updated!','success')}>Update Profile</button>
        </div>
        <div className="card">
          <div className="section-title mb-4">System Info</div>
          {[['Version','1.0.0'],['Framework','React + Vite'],['Database','● Connected'],['Last Backup','Today, 03:00 AM']].map(([l,v]) => (
            <div key={l} className="payslip-row">
              <span className="text-dim">{l}</span>
              <span style={v.startsWith('●')?{color:'var(--green)'}:{}} className={v==='1.0.0'?'font-mono':''}>{v}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
