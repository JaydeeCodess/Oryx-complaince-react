export default function Sidebar({ currentPage, nav, pendingLeaves, urgentVisas, onLogout }) {
  const navItem = (page, icon, label, badge) => (
    <button
      key={page}
      className={`nav-item${currentPage === page ? ' active' : ''}`}
      onClick={() => nav(page)}
    >
      <span className="icon">{icon}</span> {label}
      {badge != null && badge > 0 && (
        <span className="nav-badge" style={page === 'visas' ? { background: 'var(--red)' } : {}}>
          {badge}
        </span>
      )}
    </button>
  )

  return (
    <div id="sidebar">
      <div className="sidebar-logo">
        <h1>ORYX</h1>
        <span>By Brandoryx</span>
      </div>
      <nav className="sidebar-nav">
        <div className="nav-section-label">Overview</div>
        {navItem('dashboard', '⬛', 'Dashboard')}
        {navItem('calendar', '📅', 'Calendar')}
        <div className="nav-section-label">Workforce</div>
        {navItem('employees', '👥', 'Employees')}
        {navItem('departments', '🏢', 'Departments')}
        {navItem('branches', '📍', 'Branches')}
        <div className="nav-section-label">Operations</div>
        {navItem('attendance', '⏱️', 'Attendance')}
        {navItem('leaves', '🏖️', 'Leave Requests', pendingLeaves)}
        {navItem('payroll', '💰', 'Payroll')}
        {navItem('visas', '🛂', 'Visa Tracker', urgentVisas)}
        <div className="nav-section-label">Account</div>
        {navItem('settings', '⚙️', 'Settings')}
        <button className="nav-item" onClick={onLogout}>
          <span className="icon">🚪</span> Sign Out
        </button>
      </nav>
      <div className="sidebar-user">
        <div className="user-avatar">AD</div>
        <div className="user-info">
          <div className="name">Admin User</div>
          <div className="role">Administrator</div>
        </div>
      </div>
    </div>
  )
}
