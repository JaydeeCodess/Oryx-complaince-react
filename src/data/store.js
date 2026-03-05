export const COLORS = ['#6c8cff','#3ecf8e','#f06060','#f0c060','#a06cff','#f08060','#26c4f0','#f060a0'];
export const avatarColor = (i) => COLORS[i % COLORS.length];
export const initials = (name) => name.split(' ').map(n=>n[0]).join('').toUpperCase().slice(0,2);

export const initialDb = {
  employees: [
    {id:1, name:'Sarah Mitchell',  email:'s.mitchell@acme.com',  phone:'+1 555-0101', dept:'Engineering', branch:'HQ - Downtown',   title:'Senior Engineer',   hire:'2021-03-15', salary:8200, gender:'Female', nid:'EMP-001', status:'Active'},
    {id:2, name:'James Okafor',    email:'j.okafor@acme.com',    phone:'+1 555-0102', dept:'Finance',     branch:'HQ - Downtown',   title:'Financial Analyst', hire:'2020-07-01', salary:6400, gender:'Male',   nid:'EMP-002', status:'Active'},
    {id:3, name:'Priya Nair',      email:'p.nair@acme.com',      phone:'+1 555-0103', dept:'HR',          branch:'North Branch',    title:'HR Manager',        hire:'2019-11-20', salary:7100, gender:'Female', nid:'EMP-003', status:'Active'},
    {id:4, name:'Carlos Mendez',   email:'c.mendez@acme.com',    phone:'+1 555-0104', dept:'Operations',  branch:'East Branch',     title:'Ops Lead',          hire:'2022-01-10', salary:5800, gender:'Male',   nid:'EMP-004', status:'Active'},
    {id:5, name:'Aisha Rahman',    email:'a.rahman@acme.com',    phone:'+1 555-0105', dept:'Marketing',   branch:'HQ - Downtown',   title:'Marketing Dir.',    hire:'2020-05-22', salary:7500, gender:'Female', nid:'EMP-005', status:'Active'},
    {id:6, name:'David Chen',      email:'d.chen@acme.com',      phone:'+1 555-0106', dept:'Engineering', branch:'North Branch',    title:'Full-Stack Dev',    hire:'2023-02-14', salary:6900, gender:'Male',   nid:'EMP-006', status:'Active'},
    {id:7, name:'Fatima Al-Hassan',email:'f.hassan@acme.com',    phone:'+1 555-0107', dept:'Legal',       branch:'HQ - Downtown',   title:'Legal Counsel',     hire:'2018-09-05', salary:9200, gender:'Female', nid:'EMP-007', status:'Active'},
    {id:8, name:'Tom Brooks',      email:'t.brooks@acme.com',    phone:'+1 555-0108', dept:'Sales',       branch:'East Branch',     title:'Sales Manager',     hire:'2021-08-30', salary:6100, gender:'Male',   nid:'EMP-008', status:'Active'},
    {id:9, name:'Yuki Tanaka',     email:'y.tanaka@acme.com',    phone:'+1 555-0109', dept:'Engineering', branch:'HQ - Downtown',   title:'DevOps Engineer',   hire:'2022-06-01', salary:7800, gender:'Female', nid:'EMP-009', status:'Active'},
    {id:10,name:'Marcus Williams', email:'m.williams@acme.com',  phone:'+1 555-0110', dept:'Management',  branch:'HQ - Downtown',   title:'CEO',               hire:'2015-01-01', salary:15000,gender:'Male',   nid:'EMP-010', status:'Active'},
    {id:11,name:'Elena Popescu',   email:'e.popescu@acme.com',   phone:'+1 555-0111', dept:'Finance',     branch:'North Branch',    title:'Accountant',        hire:'2023-04-10', salary:5200, gender:'Female', nid:'EMP-011', status:'Active'},
    {id:12,name:"Kevin O'Brien",   email:'k.obrien@acme.com',    phone:'+1 555-0112', dept:'Operations',  branch:'HQ - Downtown',   title:'Supply Chain',      hire:'2020-12-01', salary:5900, gender:'Male',   nid:'EMP-012', status:'Active'},
    {id:13,name:'Amara Diallo',    email:'a.diallo@acme.com',    phone:'+1 555-0113', dept:'Marketing',   branch:'East Branch',     title:'Content Lead',      hire:'2021-10-15', salary:5600, gender:'Female', nid:'EMP-013', status:'Active'},
    {id:14,name:'Robert Zhang',    email:'r.zhang@acme.com',     phone:'+1 555-0114', dept:'Engineering', branch:'East Branch',     title:'ML Engineer',       hire:'2022-09-01', salary:9100, gender:'Male',   nid:'EMP-014', status:'Active'},
    {id:15,name:'Nadia Kozlov',    email:'n.kozlov@acme.com',    phone:'+1 555-0115', dept:'HR',          branch:'HQ - Downtown',   title:'Recruiter',         hire:'2023-01-15', salary:4800, gender:'Female', nid:'EMP-015', status:'Active'},
    {id:16,name:'Sam Patel',       email:'s.patel@acme.com',     phone:'+1 555-0116', dept:'Engineering', branch:'HQ - Downtown',   title:'Backend Dev',       hire:'2022-11-01', salary:7200, gender:'Male',   nid:'EMP-016', status:'Active'},
    {id:17,name:'Lisa Johansson',  email:'l.johansson@acme.com', phone:'+1 555-0117', dept:'Finance',     branch:'HQ - Downtown',   title:'CFO',               hire:'2017-03-01', salary:12000,gender:'Female', nid:'EMP-017', status:'Active'},
    {id:18,name:'Ali Hassan',      email:'ali.h@acme.com',       phone:'+1 555-0118', dept:'Sales',       branch:'North Branch',    title:'Sales Rep',         hire:'2023-06-01', salary:4500, gender:'Male',   nid:'EMP-018', status:'Active'},
    {id:19,name:'Grace Kim',       email:'g.kim@acme.com',       phone:'+1 555-0119', dept:'Legal',       branch:'East Branch',     title:'Paralegal',         hire:'2022-03-20', salary:5100, gender:'Female', nid:'EMP-019', status:'Active'},
    {id:20,name:'Omar Faruk',      email:'o.faruk@acme.com',     phone:'+1 555-0120', dept:'Operations',  branch:'North Branch',    title:'Logistics Coord.',  hire:'2021-07-01', salary:4900, gender:'Male',   nid:'EMP-020', status:'Active'},
  ],
  departments: [
    {id:1, name:'Engineering',  manager:'Sarah Mitchell',  count:42, desc:'Software development, DevOps, and infrastructure.'},
    {id:2, name:'Finance',      manager:'Lisa Johansson',  count:18, desc:'Financial planning, accounting, and reporting.'},
    {id:3, name:'HR',           manager:'Priya Nair',      count:9,  desc:'Recruitment, employee relations, and compliance.'},
    {id:4, name:'Operations',   manager:'Carlos Mendez',   count:24, desc:'Supply chain, logistics, and facilities.'},
    {id:5, name:'Marketing',    manager:'Aisha Rahman',    count:15, desc:'Brand, digital marketing, and content strategy.'},
    {id:6, name:'Sales',        manager:'Tom Brooks',      count:20, desc:'Business development and account management.'},
    {id:7, name:'Legal',        manager:'Fatima Al-Hassan',count:6,  desc:'Legal compliance, contracts, and IP.'},
    {id:8, name:'Management',   manager:'Marcus Williams', count:8,  desc:'Executive leadership and strategic planning.'},
  ],
  branches: [
    {id:1, name:'HQ - Downtown',  phone:'+1 555-1000', email:'hq@acme.com',    address:'100 Corporate Blvd, Suite 1200, New York, NY 10001', manager:'Marcus Williams', count:78},
    {id:2, name:'North Branch',   phone:'+1 555-2000', email:'north@acme.com', address:'45 Innovation Drive, Boston, MA 02101',              manager:'Priya Nair',       count:41},
    {id:3, name:'East Branch',    phone:'+1 555-3000', email:'east@acme.com',  address:'2200 Tech Park Ave, Austin, TX 73301',               manager:'Carlos Mendez',    count:23},
  ],
  attendance: [
    {date:'2025-07-14',attended:130,on_time:118,late:12,missed:12},
    {date:'2025-07-13',attended:135,on_time:125,late:10,missed:7},
    {date:'2025-07-12',attended:128,on_time:115,late:13,missed:14},
    {date:'2025-07-11',attended:138,on_time:130,late:8, missed:4},
    {date:'2025-07-10',attended:126,on_time:110,late:16,missed:16},
    {date:'2025-07-09',attended:140,on_time:134,late:6, missed:2},
    {date:'2025-07-08',attended:132,on_time:120,late:12,missed:10},
  ],
  leaves: [
    {id:1, emp:'Priya Nair',       type:'Annual Leave',   from:'2025-07-18',to:'2025-07-22',days:5,reason:'Family vacation',        status:'pending',  approved_by:''},
    {id:2, emp:'David Chen',       type:'Sick Leave',     from:'2025-07-15',to:'2025-07-16',days:2,reason:'Medical appointment',    status:'pending',  approved_by:''},
    {id:3, emp:'Amara Diallo',     type:'Emergency Leave',from:'2025-07-17',to:'2025-07-17',days:1,reason:'Family emergency',       status:'pending',  approved_by:''},
    {id:4, emp:'Carlos Mendez',    type:'Annual Leave',   from:'2025-07-01',to:'2025-07-05',days:5,reason:'Personal travel',        status:'approved', approved_by:'Admin'},
    {id:5, emp:'Sarah Mitchell',   type:'Annual Leave',   from:'2025-07-10',to:'2025-07-11',days:2,reason:'Holiday weekend',        status:'approved', approved_by:'Admin'},
    {id:6, emp:"Kevin O'Brien",    type:'Sick Leave',     from:'2025-06-28',to:'2025-06-28',days:1,reason:'Not feeling well',       status:'rejected', approved_by:'Admin'},
    {id:7, emp:'Yuki Tanaka',      type:'Maternity Leave',from:'2025-08-01',to:'2025-11-01',days:92,reason:'Maternity',             status:'approved', approved_by:'Admin'},
  ],
  events: [
    {id:1, title:'Company Picnic',     type:'event',   start:'2025-07-19',end:'2025-07-19', notes:'Annual summer picnic at Riverside Park'},
    {id:2, title:'Independence Day',   type:'holiday', start:'2025-07-04',end:'2025-07-04', notes:'Public holiday'},
    {id:3, title:'Q2 Review Meeting',  type:'meeting', start:'2025-07-21',end:'2025-07-21', notes:'Board room, 10:00 AM'},
    {id:4, title:'System Maintenance', type:'other',   start:'2025-07-28',end:'2025-07-28', notes:'Scheduled downtime 12AM-4AM'},
  ],
  leaveTypes: [
    {id:1, name:'Annual Leave',    days:21,  color:'blue',   desc:'Paid vacation leave accrued per year'},
    {id:2, name:'Sick Leave',      days:10,  color:'red',    desc:"Medical leave with doctor's note required"},
    {id:3, name:'Emergency Leave', days:3,   color:'orange', desc:'Urgent unforeseen circumstances'},
    {id:4, name:'Maternity Leave', days:90,  color:'purple', desc:'Paid leave for new mothers'},
    {id:5, name:'Paternity Leave', days:14,  color:'green',  desc:'Paid leave for new fathers'},
    {id:6, name:'Unpaid Leave',    days:30,  color:'gray',   desc:'Extended leave without pay'},
  ],
  visas: [
    {id:1,  empId:1,  emp:'Sarah Mitchell',   nationality:'American',   type:'Work Visa',        visaNum:'UV-2021-4412', country:'UAE',         issue:'2023-01-15', expiry:'2025-08-10', passportNum:'US9812341', passportExp:'2028-06-01', sponsor:'Acme Corporation', notes:'Renewal in progress', renewed:false},
    {id:2,  empId:3,  emp:'Priya Nair',        nationality:'Indian',     type:'Residence Permit', visaNum:'RP-KW-8821',   country:'Kuwait',       issue:'2022-07-01', expiry:'2025-07-29', passportNum:'IN7612981', passportExp:'2027-03-15', sponsor:'Acme Corporation', notes:'Awaiting new passport', renewed:false},
    {id:3,  empId:4,  emp:'Carlos Mendez',     nationality:'Mexican',    type:'Work Visa',        visaNum:'SA-WV-33201',  country:'Saudi Arabia', issue:'2023-03-20', expiry:'2025-09-20', passportNum:'MX4512399', passportExp:'2029-01-10', sponsor:'Acme Corp KSA',   notes:'', renewed:false},
    {id:4,  empId:6,  emp:'David Chen',        nationality:'Canadian',   type:'Work Visa',        visaNum:'QA-WV-11042',  country:'Qatar',        issue:'2023-05-01', expiry:'2026-05-01', passportNum:'CA9012432', passportExp:'2030-08-20', sponsor:'Acme Corp Qatar', notes:'', renewed:false},
    {id:5,  empId:8,  emp:'Tom Brooks',        nationality:'British',    type:'Residence Permit', visaNum:'RP-UAE-5523',  country:'UAE',          issue:'2022-11-10', expiry:'2025-08-03', passportNum:'UK2912003', passportExp:'2027-11-05', sponsor:'Acme Corporation', notes:'Emirates ID also expiring', renewed:false},
    {id:6,  empId:12, emp:"Kevin O'Brien",     nationality:'Irish',      type:'Work Visa',        visaNum:'BH-WV-9901',   country:'Bahrain',      issue:'2023-08-15', expiry:'2025-09-15', passportNum:'IE8821100', passportExp:'2028-04-22', sponsor:'Acme Bahrain',    notes:'', renewed:false},
    {id:7,  empId:13, emp:'Amara Diallo',      nationality:'Senegalese', type:'Work Visa',        visaNum:'OM-WV-4418',   country:'Oman',         issue:'2024-01-01', expiry:'2026-01-01', passportNum:'SN3301298', passportExp:'2031-02-14', sponsor:'Acme Oman LLC',   notes:'', renewed:false},
    {id:8,  empId:14, emp:'Robert Zhang',      nationality:'Chinese',    type:'Work Visa',        visaNum:'UK-T2-20221',  country:'UK',           issue:'2022-09-01', expiry:'2025-08-22', passportNum:'CN5511802', passportExp:'2029-07-30', sponsor:'Acme UK Ltd',     notes:'Tier 2 Visa', renewed:false},
    {id:9,  empId:18, emp:'Ali Hassan',        nationality:'Pakistani',  type:'Work Visa',        visaNum:'UAE-WV-77123', country:'UAE',          issue:'2023-06-01', expiry:'2025-07-20', passportNum:'PK9901233', passportExp:'2026-08-10', sponsor:'Acme Corporation', notes:'URGENT - passport also expiring soon', renewed:false},
    {id:10, empId:19, emp:'Grace Kim',         nationality:'Korean',     type:'Residence Permit', visaNum:'DE-RP-20231',  country:'Germany',      issue:'2023-02-10', expiry:'2026-02-10', passportNum:'KR4412009', passportExp:'2030-05-01', sponsor:'Acme GmbH',       notes:'', renewed:false},
    {id:11, empId:20, emp:'Omar Faruk',        nationality:'Bangladeshi',type:'Work Visa',        visaNum:'QA-WV-55019',  country:'Qatar',        issue:'2021-11-01', expiry:'2025-08-01', passportNum:'BD8812340', passportExp:'2027-10-22', sponsor:'Acme Corp Qatar', notes:'Third renewal', renewed:false},
    {id:12, empId:16, emp:'Sam Patel',         nationality:'Indian',     type:'Work Visa',        visaNum:'SA-WV-84432',  country:'Saudi Arabia', issue:'2022-11-01', expiry:'2025-11-01', passportNum:'IN3309812', passportExp:'2028-12-15', sponsor:'Acme Corp KSA',   notes:'', renewed:false},
    {id:13, empId:11, emp:'Elena Popescu',     nationality:'Romanian',   type:'Residence Permit', visaNum:'UK-RP-30019',  country:'UK',           issue:'2023-10-01', expiry:'2026-10-01', passportNum:'RO2201983', passportExp:'2029-09-01', sponsor:'Acme UK Ltd',     notes:'', renewed:false},
    {id:14, empId:2,  emp:'James Okafor',      nationality:'Nigerian',   type:'Work Visa',        visaNum:'UAE-WV-61239', country:'UAE',          issue:'2020-07-01', expiry:'2025-07-15', passportNum:'NG7712004', passportExp:'2026-03-10', sponsor:'Acme Corporation', notes:'CRITICAL - expires very soon', renewed:false},
  ],
  visaHistory: [
    {id:1, emp:'Carlos Mendez',  type:'Work Visa',  oldExpiry:'2023-03-20', newExpiry:'2025-09-20', renewedOn:'2023-03-15', renewedBy:'Priya Nair', notes:'Standard 2-year renewal'},
    {id:2, emp:'David Chen',     type:'Work Visa',  oldExpiry:'2023-05-01', newExpiry:'2026-05-01', renewedOn:'2023-04-20', renewedBy:'Priya Nair', notes:'Sponsored by Qatar office'},
    {id:3, emp:'Omar Faruk',     type:'Work Visa',  oldExpiry:'2021-11-01', newExpiry:'2023-11-01', renewedOn:'2021-10-10', renewedBy:'Admin',      notes:'Second renewal'},
    {id:4, emp:'Omar Faruk',     type:'Work Visa',  oldExpiry:'2023-11-01', newExpiry:'2025-08-01', renewedOn:'2023-10-20', renewedBy:'Priya Nair', notes:'Third renewal - note new expiry'},
  ],
};

// Generate payroll
initialDb.payroll = initialDb.employees.map(e => ({
  id: e.id, name: e.name, dept: e.dept,
  basic: e.salary,
  allowance: Math.round(e.salary * 0.15),
  tax: Math.round(e.salary * 0.18),
  deduction: Math.round(e.salary * 0.18),
  net: Math.round(e.salary * 0.97),
  status: 'paid'
}));

// Visa helpers
export const daysUntil = (dateStr) => {
  const today = new Date(); today.setHours(0,0,0,0);
  const exp = new Date(dateStr); exp.setHours(0,0,0,0);
  return Math.round((exp - today) / 86400000);
};

export const getVisaBadgeClass = (days) => {
  if (days < 0)   return 'badge-red';
  if (days <= 15) return 'badge-red';
  if (days <= 30) return 'badge-yellow';
  if (days <= 60) return 'badge-blue';
  return 'badge-green';
};

export const getVisaBadgeLabel = (days) => {
  if (days < 0)   return 'Expired';
  if (days <= 15) return '⚠ Critical';
  if (days <= 30) return '⚠ Warning';
  if (days <= 60) return 'Notice';
  return 'Active';
};

export const getDaysPillClass = (days) => {
  if (days < 0)   return 'pill-red';
  if (days <= 15) return 'pill-red';
  if (days <= 30) return 'pill-yellow';
  if (days <= 60) return 'pill-blue';
  return '';
};

export const getDaysPillLabel = (days) => {
  if (days < 0)   return `Expired ${Math.abs(days)}d ago`;
  if (days <= 15) return `⚠ ${days} days left`;
  if (days <= 30) return `⚠ ${days} days left`;
  if (days <= 60) return `${days} days left`;
  return `${days} days`;
};

export const getVisaTypeClass = (type) => {
  const map = {'Work Visa':'vt-work','Residence Permit':'vt-residence','Business Visa':'vt-business','Dependent Visa':'vt-dependent','Student Visa':'vt-student'};
  return map[type] || 'vt-work';
};

export const countryFlag = (country) => {
  const flags = {'UAE':'🇦🇪','Saudi Arabia':'🇸🇦','Qatar':'🇶🇦','Kuwait':'🇰🇼','Bahrain':'🇧🇭','Oman':'🇴🇲','UK':'🇬🇧','USA':'🇺🇸','Canada':'🇨🇦','Germany':'🇩🇪'};
  return flags[country] || '🌍';
};
