import { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { getRoleLabel, getInitials, getAvatarColor } from '@/utils/helpers';
import {
  LayoutDashboard,
  Users,
  Target,
  Contact,
  Building2,
  Kanban,
  Ticket,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  IndianRupee,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'sales_manager', 'sales_executive', 'support_executive'] },
  { path: '/leads', label: 'Leads', icon: Target, roles: ['admin', 'sales_manager', 'sales_executive'] },
  { path: '/contacts', label: 'Contacts', icon: Contact, roles: ['admin', 'sales_manager', 'sales_executive', 'support_executive'] },
  { path: '/customers', label: 'Customers', icon: Building2, roles: ['admin', 'sales_manager', 'sales_executive', 'support_executive'] },
  { path: '/opportunities', label: 'Opportunities', icon: Kanban, roles: ['admin', 'sales_manager', 'sales_executive'] },
  { path: '/tickets', label: 'Support Tickets', icon: Ticket, roles: ['admin', 'support_executive'] },
  { path: '/users', label: 'User Management', icon: Users, roles: ['admin'] },
  { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin'] },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredNavItems = navItems.filter(item => hasRole(...item.roles as any[]));

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 via-white to-green-600">
            <IndianRupee className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">LeadCRM</h1>
            <p className="text-[10px] text-slate-400 tracking-wider uppercase">Indian CRM System</p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="ml-auto lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="mt-4 px-3 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          {filteredNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  active
                    ? 'bg-orange-500/20 text-orange-400 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-orange-400' : 'text-slate-400'}`} />
                {item.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400" />}
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(user?.name || 'U')}`}>
              {getInitials(user?.name || 'U')}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 truncate">{getRoleLabel(user?.role || '')}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between px-4 lg:px-6 h-16">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
              >
                <Menu className="w-5 h-5" />
              </button>
              <div className="hidden lg:flex items-center gap-2 text-sm text-gray-500">
                <span className="font-medium text-gray-700">
                  {filteredNavItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quick Stats */}
              <div className="hidden md:flex items-center gap-4 mr-4 text-xs">
                <div className="flex items-center gap-1 text-green-600">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  System Online
                </div>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(user?.name || 'U')}`}>
                    {getInitials(user?.name || 'U')}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-gray-700">{user?.name?.split(' ')[0]}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {profileOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 z-20 overflow-hidden">
                      <div className="px-4 py-3 bg-gray-50 border-b">
                        <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                        <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          user?.role === 'admin' ? 'bg-red-100 text-red-700' :
                          user?.role === 'sales_manager' ? 'bg-purple-100 text-purple-700' :
                          user?.role === 'sales_executive' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {getRoleLabel(user?.role || '')}
                        </span>
                      </div>
                      <div className="py-1">
                        <button
                          onClick={() => { setProfileOpen(false); navigate('/settings'); }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Settings className="w-4 h-4" />
                          Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
