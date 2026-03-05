import { useState, useEffect, useCallback } from 'react'
import { supabase } from './lib/supabase.js'
import LoginPage from './components/LoginPage.jsx'
import Sidebar from './components/Sidebar.jsx'
import Topbar from './components/Topbar.jsx'
import Toast from './components/Toast.jsx'
import Modal from './components/Modal.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Employees from './pages/Employees.jsx'
import Departments from './pages/Departments.jsx'
import Branches from './pages/Branches.jsx'
import Attendance from './pages/Attendance.jsx'
import Leaves from './pages/Leaves.jsx'
import Payroll from './pages/Payroll.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import VisaTracker from './pages/VisaTracker.jsx'
import Settings from './pages/Settings.jsx'

export default function App() {
  const [loggedIn, setLoggedIn]           = useState(false)
  const [currentPage, setCurrentPage]     = useState('dashboard')
  const [db, setDb]                       = useState({
    employees: [], departments: [], branches: [], attendance: [],
    leaves: [], payroll: [], events: [], visas: [], visaHistory: [],
    leaveTypes: [], payroll_periods: []
  })
  const [loading, setLoading]             = useState(true)
  const [toast, setToast]                 = useState(null)
  const [activeModal, setActiveModal]     = useState(null)
  const [modalData, setModalData]         = useState(null)
  const [globalSearchVal, setGlobalSearchVal] = useState('')

  // ── Toast ────────────────────────────────────────────────
  const showToast = useCallback((msg, type = 'info', icon = '') => {
    const ic = icon || (type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ')
    setToast({ msg: ic + ' ' + msg, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // ── Load all data from Supabase ──────────────────────────
  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [
        { data: employees },
        { data: departments },
        { data: branches },
        { data: attendance },
        { data: leaves },
        { data: payroll },
        { data: events },
        { data: visas },
        { data: visaHistory },
        { data: leaveTypes },
        { data: payroll_periods },
      ] = await Promise.all([
        supabase.from('employees').select('*').order('employee_number'),
        supabase.from('departments').select('*').order('name'),
        supabase.from('branches').select('*').order('name'),
        supabase.from('attendance_daily').select('*').order('date', { ascending: false }),
        supabase.from('leave_requests').select('*').order('created_at', { ascending: false }),
        supabase.from('payroll_entries').select('*').order('name'),
        supabase.from('calendar_events').select('*').order('start_date'),
        supabase.from('visas').select('*').order('expiry'),
        supabase.from('visa_history').select('*').order('created_at', { ascending: false }),
        supabase.from('leave_types').select('*').order('name'),
        supabase.from('payroll_periods').select('*').order('year', { ascending: false }),
      ])

      setDb({
        employees:      employees      || [],
        departments:    departments    || [],
        branches:       branches       || [],
        attendance:     attendance     || [],
        leaves:         leaves         || [],
        payroll:        payroll        || [],
        events:         events         || [],
        visas:          visas          || [],
        visaHistory:    visaHistory    || [],
        leaveTypes:     leaveTypes     || [],
        payroll_periods: payroll_periods || [],
      })
    } catch (err) {
      showToast('Failed to load data', 'error')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    if (loggedIn) loadAll()
  }, [loggedIn, loadAll])

  // ── updateDb: local state update + Supabase sync ─────────
  // Usage: updateDb('employees', 'insert', newRow)
  //        updateDb('employees', 'update', updatedRow, id)
  //        updateDb('employees', 'delete', null, id)
  const updateDb = useCallback(async (table, action, data, id) => {
    // Map app table names → Supabase table names
    const tableMap = {
      employees:    'employees',
      departments:  'departments',
      branches:     'branches',
      attendance:   'attendance_daily',
      leaves:       'leave_requests',
      payroll:      'payroll_entries',
      events:       'calendar_events',
      visas:        'visas',
      visaHistory:  'visa_history',
      leaveTypes:   'leave_types',
    }
    const supabaseTable = tableMap[table]

    try {
      if (action === 'insert') {
        const { data: inserted, error } = await supabase
          .from(supabaseTable).insert(data).select().single()
        if (error) throw error
        setDb(prev => ({ ...prev, [table]: [...prev[table], inserted] }))
        return inserted

      } else if (action === 'update') {
        const { data: updated, error } = await supabase
          .from(supabaseTable).update(data).eq('id', id).select().single()
        if (error) throw error
        setDb(prev => ({
          ...prev,
          [table]: prev[table].map(row => row.id === id ? updated : row)
        }))
        return updated

      } else if (action === 'delete') {
        const { error } = await supabase
          .from(supabaseTable).delete().eq('id', id)
        if (error) throw error
        setDb(prev => ({
          ...prev,
          [table]: prev[table].filter(row => row.id !== id)
        }))
      }
    } catch (err) {
      showToast('Database error: ' + err.message, 'error')
      console.error(err)
    }
  }, [showToast])

  // ── Modal ────────────────────────────────────────────────
  const openModal  = useCallback((id, data = null) => { setActiveModal(id); setModalData(data) }, [])
  const closeModal = useCallback(() => { setActiveModal(null); setModalData(null) }, [])

  // ── Navigation ───────────────────────────────────────────
  const nav = useCallback((page) => { setCurrentPage(page); setGlobalSearchVal('') }, [])

  // ── Badge counts ─────────────────────────────────────────
  const pendingLeaves = db.leaves.filter(l => l.status === 'pending').length
  const urgentVisas   = db.visas.filter(v => {
    const d = (new Date(v.expiry) - new Date()) / 86400000
    return d <= 15
  }).length

  // ── Page router ──────────────────────────────────────────
  const pages = {
    dashboard: Dashboard, employees: Employees, departments: Departments,
    branches: Branches,   attendance: Attendance, leaves: Leaves,
    payroll: Payroll,     calendar: CalendarPage, visas: VisaTracker,
    settings: Settings
  }
  const PageComponent = pages[currentPage] || Dashboard

  // ── Login screen ─────────────────────────────────────────
  if (!loggedIn) {
    return (
      <LoginPage
        onLogin={() => { setLoggedIn(true); showToast('Welcome back, Admin!', 'success', '👋') }}
        showToast={showToast}
      />
    )
  }

  // ── Loading screen ───────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
        <div style={{ width: 40, height: 40, border: '4px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ color: 'var(--text3)', fontSize: 14 }}>Loading ORYX HRS…</div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  // ── Main app ─────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)', overflow: 'hidden', width: '100vw' }}>
      <Sidebar
        currentPage={currentPage} nav={nav}
        pendingLeaves={pendingLeaves} urgentVisas={urgentVisas}
        onLogout={() => { setLoggedIn(false); showToast('Signed out successfully', 'info') }}
      />
      <div id="main" style={{ marginLeft: 'var(--sidebar-w)', flex: 1, height: '100vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        <Topbar
          currentPage={currentPage} nav={nav} db={db}
          globalSearch={globalSearchVal} setGlobalSearch={setGlobalSearchVal}
          openModal={openModal} showToast={showToast}
        />
        <div className="content">
          <PageComponent
            db={db} updateDb={updateDb} showToast={showToast}
            openModal={openModal} closeModal={closeModal}
            nav={nav} globalSearch={globalSearchVal}
            refreshDb={loadAll}
          />
        </div>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} />}
      <Modal
        activeModal={activeModal} modalData={modalData} closeModal={closeModal}
        db={db} updateDb={updateDb} showToast={showToast} nav={nav}
      />
    </div>
  )
}
