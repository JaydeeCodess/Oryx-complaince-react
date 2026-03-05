import { useState } from 'react'
import { daysUntil } from '../data/store.js'

const PAGE_TITLES = {
  dashboard: 'Dashboard', employees: 'Employees', departments: 'Departments',
  branches: 'Branches', attendance: 'Attendance', leaves: 'Leave Requests',
  payroll: 'Payroll', calendar: 'Calendar', settings: 'Settings', visas: 'Visa Tracker'
}

const PAGE_ACTIONS = {
  employees: '＋ New Employee', departments: '＋ New Department',
  branches: '＋ New Branch', leaves: '＋ New Request',
  calendar: '＋ Add Event', visas: '＋ Add Visa Record'
}

export default function Topbar({ currentPage, nav, db, globalSearch, setGlobalSearch, openModal, showToast }) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [readAll, setReadAll] = useState(false)

  const title = PAGE_TITLES[currentPage] || currentPage

  const handleAction = () => {
    const actions = {
      employees: () => window.__empTabFn?.('add'),
      departments: () => openModal('dept-modal'),
      branches: () => openModal('branch-modal'),
      leaves: () => window.__leaveTabFn?.('apply'),
      calendar: () => openModal('event-modal'),
      visas: () => window.__visaTabFn?.('add'),
    }
    actions[currentPage]?.()
  }

  const notifications = db.visas.map(v => {
    const days = daysUntil(v.expiry)
    if (days < 0) return { type: 'red', title: `${v.emp}'s visa has EXPIRED`, body: `${v.type} (${v.country}) expired ${Math.abs(days)} days ago.`, time: 'Urgent', vid: v.id }
    if (days <= 15) return { type: 'red', title: `${v.emp}'s visa expires in ${days} days`, body: `${v.type} for ${v.country} — Visa #${v.visaNum}`, time: `${days}d left`, vid: v.id }
    if (days <= 30) return { type: 'warn', title: `${v.emp}'s visa expiring soon`, body: `${v.type} (${v.country}) expires in ${days} days.`, time: `${days}d left`, vid: v.id }
    if (days <= 60) return { type: 'notice', title: `Upcoming visa expiry — ${v.emp}`, body: `${v.type} (${v.country}) expires in ${days} days.`, time: `${days}d left`, vid: v.id }
    return null
  }).filter(Boolean)

  const hasUnread = notifications.length > 0 && !readAll

  return (
    <div className="topbar">
      <div>
        <div className="topbar-title">{title}</div>
        <div className="topbar-breadcrumb">HRS / {title}</div>
      </div>
      <div className="topbar-spacer" />
      <input
        className="topbar-search"
        placeholder="🔍 Search employees, departments…"
        value={globalSearch}
        onChange={e => setGlobalSearch(e.target.value)}
      />
      <div style={{ position: 'relative' }}>
        <button className="notif-btn" onClick={() => setNotifOpen(o => !o)}>
          🔔{hasUnread && <span className="notif-dot" />}
        </button>
        {notifOpen && (
          <div className="notif-panel open">
            <div className="notif-panel-header">
              <span>Notifications</span>
              <button style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                onClick={() => { setReadAll(true); showToast('All notifications marked as read', 'info') }}>
                Mark all read
              </button>
            </div>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text3)', fontSize: 14 }}>No urgent notifications</div>
            ) : notifications.map((n, i) => (
              <div key={i} className={`notif-item${!readAll ? ' notif-unread ' + n.type : ''}`}
                onClick={() => { setNotifOpen(false); nav('visas') }}>
                <div className="notif-item-title">{n.type === 'red' ? '🚨' : n.type === 'warn' ? '⚠️' : '📋'} {n.title}</div>
                <div className="notif-item-body">{n.body}</div>
                <div className="notif-item-time">{n.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {PAGE_ACTIONS[currentPage] && (
        <button className="btn btn-primary btn-sm" onClick={handleAction}>
          {PAGE_ACTIONS[currentPage]}
        </button>
      )}
    </div>
  )
}
