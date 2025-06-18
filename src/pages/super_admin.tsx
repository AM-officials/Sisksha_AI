import React, { useState } from 'react';
import { BarChart3, Users, School, DollarSign, Database, Activity, Settings, Menu, Plus, Search, FileText, UploadCloud, UserCog, Sun, Moon, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';

const stats = [
  { label: 'Total Schools', value: 42, icon: <School className="w-6 h-6 text-siksha-purple" /> },
  { label: 'Total Students', value: 12000, icon: <Users className="w-6 h-6 text-siksha-purple" /> },
  { label: 'Total Teachers', value: 850, icon: <Users className="w-6 h-6 text-siksha-purple" /> },
  { label: 'Revenue (YTD)', value: '₹ 12,50,000', icon: <DollarSign className="w-6 h-6 text-siksha-purple" /> },
  { label: 'Storage Used', value: '320 GB', icon: <Database className="w-6 h-6 text-siksha-purple" /> },
];

const recentActivity = [
  'School A joined the platform',
  'Payment received from School B',
  'Teacher C created a new quiz',
  'Student X completed a course',
  'Storage upgraded for School D',
];

const heatmapData = Array.from({ length: 28 }, (_, i) => ['bg-indigo-100','bg-indigo-200','bg-siksha-purple','bg-indigo-300'][i%4]);

const schoolsMock = [
  { name: 'Green Valley School', city: 'Delhi', students: 1200, teachers: 80, joined: '2023-01-15', logo: '/school1.png' },
  { name: 'Blue Ridge Academy', city: 'Mumbai', students: 950, teachers: 60, joined: '2022-11-10', logo: '/school2.png' },
  { name: 'Sunrise Public School', city: 'Bangalore', students: 700, teachers: 45, joined: '2023-03-05', logo: '/school3.png' },
  { name: 'Harmony High', city: 'Chennai', students: 1100, teachers: 70, joined: '2022-09-20', logo: '/school4.png' },
];

const revenueMock = [
  { id: 1, school: 'Green Valley School', amount: '₹ 50,000', date: '2024-05-01', status: 'Paid' },
  { id: 2, school: 'Blue Ridge Academy', amount: '₹ 40,000', date: '2024-04-28', status: 'Paid' },
  { id: 3, school: 'Sunrise Public School', amount: '₹ 35,000', date: '2024-04-25', status: 'Pending' },
];

const storageMock = [
  { school: 'Green Valley School', used: '80 GB', total: '100 GB', files: 1200 },
  { school: 'Blue Ridge Academy', used: '60 GB', total: '80 GB', files: 900 },
  { school: 'Sunrise Public School', used: '45 GB', total: '60 GB', files: 700 },
];

const SuperAdmin: React.FC = () => {
  const [section, setSection] = useState('Overview');
  const [search, setSearch] = useState('');
  const [darkMode, setDarkMode] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Section UIs
  const renderSection = () => {
    switch (section) {
      case 'Overview':
        return (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-6 mb-6">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white rounded-2xl shadow p-3 sm:p-6 flex flex-col items-center">
                  {stat.icon}
                  <span className="text-xs sm:text-sm text-indigo-400 font-semibold mb-1 mt-2">{stat.label}</span>
                  <span className="text-2xl sm:text-3xl font-bold text-siksha-purple">{stat.value}</span>
                </div>
              ))}
            </div>
            {/* Revenue Chart Placeholder */}
            <div className="bg-white rounded-2xl shadow p-4 mb-6">
              <h3 className="font-semibold text-siksha-purple mb-2">Revenue Trend</h3>
              <svg viewBox="0 0 200 60" className="w-full h-16">
                <polyline fill="none" stroke="#fbbf24" strokeWidth="3" points="0,50 40,40 80,30 120,35 160,20 200,25" />
                <circle cx="0" cy="50" r="2" fill="#fbbf24" />
                <circle cx="40" cy="40" r="2" fill="#fbbf24" />
                <circle cx="80" cy="30" r="2" fill="#fbbf24" />
                <circle cx="120" cy="35" r="2" fill="#fbbf24" />
                <circle cx="160" cy="20" r="2" fill="#fbbf24" />
                <circle cx="200" cy="25" r="2" fill="#fbbf24" />
              </svg>
            </div>
            {/* Storage Usage Chart Placeholder */}
            <div className="bg-white rounded-2xl shadow p-4 mb-6">
              <h3 className="font-semibold text-siksha-purple mb-2">Storage Usage</h3>
              <svg viewBox="0 0 200 60" className="w-full h-16">
                <rect x="0" y="30" width="40" height="30" fill="#6366f1" />
                <rect x="50" y="20" width="40" height="40" fill="#fbbf24" />
                <rect x="100" y="10" width="40" height="50" fill="#10b981" />
                <rect x="150" y="25" width="40" height="35" fill="#e0e7ff" />
              </svg>
            </div>
            {/* Platform Heatmap */}
            <div className="bg-white rounded-2xl shadow p-4 mb-6">
              <h3 className="font-semibold text-siksha-purple mb-2">Platform Usage Heatmap</h3>
              <div className="grid grid-cols-7 gap-1 w-full max-w-xs mx-auto">
                {heatmapData.map((bg, i) => (
                  <div key={i} className={`w-6 h-6 rounded ${bg}`}></div>
                ))}
              </div>
              <div className="flex justify-between text-xs text-indigo-400 mt-2 max-w-xs mx-auto">
                <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
              </div>
            </div>
            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow p-4 mb-6">
              <h3 className="font-semibold text-siksha-purple mb-2">Recent Activity</h3>
              <div className="flex flex-col gap-2 pb-2">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="bg-indigo-100 text-siksha-purple rounded-xl px-3 py-2 text-xs sm:text-sm shadow">
                    {activity}
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case 'Schools':
        return (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 shadow w-full sm:w-auto">
                <Search className="w-4 h-4 text-siksha-purple" />
                <input
                  className="outline-none bg-transparent w-full sm:w-48 text-siksha-purple placeholder:text-indigo-300"
                  placeholder="Search schools..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 bg-siksha-purple text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition">
                <Plus className="w-4 h-4" /> Add School
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {schoolsMock.filter(s => s.name.toLowerCase().includes(search.toLowerCase())).map((school, idx) => (
                <div key={idx} className="bg-white rounded-2xl shadow-lg p-5 flex flex-col items-center text-center hover:scale-[1.02] transition">
                  <img src={school.logo} alt={school.name} className="w-16 h-16 rounded-full mb-3 bg-indigo-100 object-cover" />
                  <div className="font-bold text-siksha-purple text-lg mb-1">{school.name}</div>
                  <div className="text-indigo-400 text-sm mb-1">{school.city}</div>
                  <div className="flex gap-3 text-xs text-indigo-400 mb-2">
                    <span>{school.students} students</span>
                    <span>{school.teachers} teachers</span>
                  </div>
                  <div className="text-xs text-indigo-300">Joined: {school.joined}</div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'Revenue':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-siksha-purple text-lg mb-1">Revenue Analytics</h3>
                <div className="text-indigo-400 text-sm">Year-to-date, monthly, and school-wise revenue</div>
              </div>
              <button className="flex items-center gap-2 bg-siksha-purple text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition mt-3 sm:mt-0">
                <DollarSign className="w-4 h-4" /> Download Report
              </button>
            </div>
            <div className="bg-white rounded-2xl shadow p-4 mb-4">
              <h4 className="font-semibold text-siksha-purple mb-2">Recent Transactions</h4>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-indigo-400">
                      <th className="px-3 py-2 text-left">School</th>
                      <th className="px-3 py-2 text-left">Amount</th>
                      <th className="px-3 py-2 text-left">Date</th>
                      <th className="px-3 py-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueMock.map(txn => (
                      <tr key={txn.id} className="border-b last:border-0">
                        <td className="px-3 py-2 font-medium text-siksha-purple">{txn.school}</td>
                        <td className="px-3 py-2">{txn.amount}</td>
                        <td className="px-3 py-2">{txn.date}</td>
                        <td className="px-3 py-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${txn.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{txn.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow p-4">
              <h4 className="font-semibold text-siksha-purple mb-2">Revenue Trend</h4>
              <svg viewBox="0 0 200 60" className="w-full h-16">
                <polyline fill="none" stroke="#fbbf24" strokeWidth="3" points="0,50 40,40 80,30 120,35 160,20 200,25" />
                <circle cx="0" cy="50" r="2" fill="#fbbf24" />
                <circle cx="40" cy="40" r="2" fill="#fbbf24" />
                <circle cx="80" cy="30" r="2" fill="#fbbf24" />
                <circle cx="120" cy="35" r="2" fill="#fbbf24" />
                <circle cx="160" cy="20" r="2" fill="#fbbf24" />
                <circle cx="200" cy="25" r="2" fill="#fbbf24" />
              </svg>
            </div>
          </div>
        );
      case 'Storage':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow p-4 flex flex-col sm:flex-row sm:items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-siksha-purple text-lg mb-1">Storage Usage by School</h3>
                <div className="text-indigo-400 text-sm">Monitor and manage storage allocation</div>
              </div>
              <button className="flex items-center gap-2 bg-siksha-purple text-white font-semibold px-4 py-2 rounded-xl shadow hover:bg-indigo-700 transition mt-3 sm:mt-0">
                <UploadCloud className="w-4 h-4" /> Upgrade Storage
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-indigo-400">
                    <th className="px-3 py-2 text-left">School</th>
                    <th className="px-3 py-2 text-left">Used</th>
                    <th className="px-3 py-2 text-left">Total</th>
                    <th className="px-3 py-2 text-left">Files</th>
                  </tr>
                </thead>
                <tbody>
                  {storageMock.map((row, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="px-3 py-2 font-medium text-siksha-purple">{row.school}</td>
                      <td className="px-3 py-2">{row.used}</td>
                      <td className="px-3 py-2">{row.total}</td>
                      <td className="px-3 py-2">{row.files}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-white rounded-2xl shadow p-4">
              <h4 className="font-semibold text-siksha-purple mb-2">Storage Usage Chart</h4>
              <svg viewBox="0 0 200 60" className="w-full h-16">
                <rect x="0" y="30" width="40" height="30" fill="#6366f1" />
                <rect x="50" y="20" width="40" height="40" fill="#fbbf24" />
                <rect x="100" y="10" width="40" height="50" fill="#10b981" />
                <rect x="150" y="25" width="40" height="35" fill="#e0e7ff" />
              </svg>
            </div>
          </div>
        );
      case 'Settings':
        return (
          <div className="space-y-6 max-w-xl mx-auto">
            <div className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 items-center">
              <UserCog className="w-10 h-10 text-siksha-purple mb-2" />
              <div className="font-bold text-siksha-purple text-xl">Super Admin Settings</div>
              <div className="w-full flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-indigo-400 text-sm font-semibold">Name</label>
                  <input className="bg-indigo-50 rounded-xl px-3 py-2 outline-none" placeholder="Your Name" defaultValue="Super Admin" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-indigo-400 text-sm font-semibold">Email</label>
                  <input className="bg-indigo-50 rounded-xl px-3 py-2 outline-none" placeholder="Email" defaultValue="admin@platform.com" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-indigo-400 text-sm font-semibold">Theme</label>
                  <button onClick={() => setDarkMode(v => !v)} className="flex items-center gap-2 bg-indigo-100 rounded-xl px-3 py-2 font-semibold text-siksha-purple w-fit">
                    {darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} {darkMode ? 'Dark' : 'Light'} Mode
                  </button>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-indigo-400 text-sm font-semibold">Password</label>
                  <input className="bg-indigo-50 rounded-xl px-3 py-2 outline-none" type="password" placeholder="Change password" />
                </div>
              </div>
              <button className="mt-4 bg-siksha-purple text-white font-semibold px-6 py-2 rounded-xl shadow hover:bg-indigo-700 transition">Save Changes</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const sidebarItems = [
    { label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { label: 'Schools', icon: <School className="w-5 h-5" /> },
    { label: 'Revenue', icon: <DollarSign className="w-5 h-5" /> },
    { label: 'Storage', icon: <Database className="w-5 h-5" /> },
    { label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <div className={`min-h-screen flex bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${darkMode ? 'dark bg-gray-900' : ''}`}>
      {/* Sidebar */}
      <aside className="hidden sm:flex w-56 bg-white/80 border-r border-indigo-100 flex-col py-4 px-4 gap-4 shadow-lg z-20">
        <div className="flex items-center gap-2 mb-6">
          <Menu className="w-6 h-6 text-siksha-purple" />
          <span className="font-bold text-siksha-purple text-lg">Super Admin</span>
        </div>
        {sidebarItems.map(item => (
          <button
            key={item.label}
            className={`flex items-center gap-3 py-2 px-3 rounded-xl font-medium text-base transition-all ${section === item.label ? 'bg-indigo-100 text-siksha-purple font-bold shadow' : 'text-siksha-purple hover:bg-indigo-50'}`}
            onClick={() => setSection(item.label)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </aside>
      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 py-3 bg-white/80 border-b border-indigo-100 shadow-sm sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <img src="/avatar.png" alt="Super Admin Avatar" className="w-8 h-8 rounded-full bg-siksha-yellow" />
            <span className="font-bold text-siksha-purple text-lg">Super Admin</span>
          </div>
          <button
            onClick={async () => { await logout(); navigate('/super_admin_login'); }}
            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-600 font-semibold px-4 py-2 rounded-xl shadow transition"
            title="Log out"
          >
            <LogOut className="w-5 h-5" /> Log out
          </button>
        </header>
        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-6 overflow-y-auto">
          {renderSection()}
        </main>
      </div>
    </div>
  );
};

export default SuperAdmin; 