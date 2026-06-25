import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useStudent } from '../../context/StudentContext';
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  Calendar,
  Bell,
  Activity,
  Logs,
  LogOut,
  User,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';

export default function DashboardLayout({ children }) {
  const { activeStudent, students, switchStudent, logout } = useStudent();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showProfileSwitcher, setShowProfileSwitcher] = useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Tasks', href: '/tasks', icon: CheckSquare },
    { name: 'AI Study Buddy', href: '/ai-buddy', icon: BookOpen },
    { name: 'Attendance Analyzer', href: '/attendance', icon: Activity },
    { name: 'Notice Summarizer', href: '/notices', icon: Bell },
    { name: 'Automation Logs', href: '/automation-logs', icon: Logs },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const currentTabName = navigation.find(item => item.href === location.pathname)?.name || 'CampusFlow';

  return (
    <div className="min-h-screen bg-background flex text-gray-300">
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r border-glass-border bg-background/50 backdrop-blur-md z-20">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-glass-border">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-cyan to-brand-purple flex items-center justify-center shadow-glow-cyan">
                <span className="font-extrabold text-background text-lg">CF</span>
              </div>
              <span className="font-bold text-xl text-white tracking-wider">CampusFlow</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-blue/15 to-brand-cyan/5 text-brand-cyan border-l-2 border-brand-cyan shadow-sm'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className={`mr-3 h-5 w-5 transition-colors ${isActive ? 'text-brand-cyan' : 'text-gray-400 group-hover:text-white'}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Active Student Selector / Profile Section */}
          <div className="p-4 border-t border-glass-border bg-background-deep/40 relative">
            {activeStudent ? (
              <div>
                <button
                  onClick={() => setShowProfileSwitcher(!showProfileSwitcher)}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center min-w-0">
                    <div className="h-9 w-9 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center text-brand-cyan font-bold uppercase shrink-0">
                      {activeStudent.name.charAt(0)}
                    </div>
                    <div className="ml-3 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{activeStudent.name}</p>
                      <p className="text-xs text-gray-500 truncate">{activeStudent.branch} • Year {activeStudent.year}</p>
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-400 shrink-0 ml-1" />
                </button>

                {/* Profile Switcher Dropdown */}
                {showProfileSwitcher && (
                  <div className="absolute bottom-16 left-4 right-4 bg-background-card border border-glass-border rounded-xl shadow-glass-shadow p-2 z-30 max-h-48 overflow-y-auto">
                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-800 mb-1">
                      Switch Student
                    </div>
                    {students
                      .filter(s => s.id !== activeStudent.id)
                      .map(student => (
                        <button
                          key={student.id}
                          onClick={() => {
                            switchStudent(student.id);
                            setShowProfileSwitcher(false);
                          }}
                          className="w-full text-left px-2 py-2 text-sm text-gray-300 hover:bg-white/5 rounded-lg truncate flex items-center gap-2"
                        >
                          <div className="h-6 w-6 rounded bg-gray-800 text-xs font-bold text-center flex items-center justify-center uppercase">
                            {student.name.charAt(0)}
                          </div>
                          <span>{student.name}</span>
                        </button>
                      ))}
                    <div className="border-t border-gray-800 my-1 pt-1">
                      <Link
                        to="/onboard"
                        onClick={() => setShowProfileSwitcher(false)}
                        className="flex items-center gap-2 px-2 py-2 text-sm text-brand-cyan hover:bg-brand-cyan/5 rounded-lg"
                      >
                        <User className="h-4 w-4" />
                        <span>Add New Profile</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-2 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/onboard" className="btn-primary w-full text-sm py-2">
                Get Started
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* --- MOBILE NAVIGATION --- */}
      <div className="flex flex-col flex-1 md:pl-64 min-w-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-background/70 backdrop-blur-md border-b border-glass-border md:hidden">
          <button
            type="button"
            className="px-4 border-r border-glass-border text-gray-400 focus:outline-none"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 px-4 flex justify-between items-center">
            <span className="font-bold text-lg text-white">{currentTabName}</span>
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-cyan to-brand-purple flex items-center justify-center">
              <span className="font-extrabold text-background text-sm">CF</span>
            </div>
          </div>
        </header>

        {/* Mobile Drawer Backdrop */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-40 flex md:hidden">
            {/* Overlay */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
            
            {/* Drawer Content */}
            <div className="relative flex-1 flex flex-col max-w-xs w-full bg-background border-r border-glass-border pt-5 pb-4">
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <X className="h-6 w-6 text-white" />
                </button>
              </div>

              {/* Logo */}
              <div className="flex-shrink-0 flex items-center px-6 pb-4 border-b border-glass-border">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-cyan to-brand-purple flex items-center justify-center">
                  <span className="font-bold text-background text-sm">CF</span>
                </div>
                <span className="ml-3 font-bold text-lg text-white">CampusFlow</span>
              </div>

              {/* Links */}
              <div className="mt-5 flex-1 h-0 overflow-y-auto px-4">
                <nav className="space-y-1">
                  {navigation.map((item) => {
                    const isActive = location.pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`group flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-brand-blue/15 to-brand-cyan/5 text-brand-cyan border-l-2 border-brand-cyan'
                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5 shrink-0" />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>
              </div>

              {/* Footer Switcher */}
              <div className="p-4 border-t border-glass-border bg-background-deep/40">
                {activeStudent ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded bg-gray-800 text-brand-cyan font-bold flex items-center justify-center uppercase shrink-0">
                        {activeStudent.name.charAt(0)}
                      </div>
                      <div className="ml-3 truncate">
                        <p className="text-sm font-semibold text-white truncate">{activeStudent.name}</p>
                        <p className="text-xs text-gray-500 truncate">{activeStudent.branch} • Yr {activeStudent.year}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <Link
                        to="/onboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="btn-secondary py-1.5 text-xs flex justify-center"
                      >
                        Add Profile
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMobileMenuOpen(false);
                        }}
                        className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 hover:bg-red-500/20"
                      >
                        <LogOut className="h-3.5 w-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link to="/onboard" onClick={() => setMobileMenuOpen(false)} className="btn-primary w-full text-xs py-2">
                    Get Started
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- MAIN PAGE WRAPPER --- */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6 px-4 sm:px-6 md:px-8 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
