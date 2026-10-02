import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  Search,
  ChevronDown,
  User,
  Settings,
  LogOut,
  ShieldCheck,
  Package,
  ShoppingCart,
  Truck,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { useAuth, DEMO_CREDENTIALS } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatDate } from '../../utils/formatters';

export const Navbar = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { user, logout, switchRole } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const roleRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setIsNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setIsProfileOpen(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setIsRoleOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = async (roleName) => {
    setIsRoleOpen(false);
    await switchRole(roleName);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between shadow-xs">
      {/* Left Search Bar */}
      <div className="flex items-center gap-3 w-full max-w-md">
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search SKU, orders, invoices, suppliers..."
            className="w-full bg-slate-50 hover:bg-slate-100/70 border border-slate-200 focus:border-primary-500 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Quick Role Switcher (Crucial for College Presentation / Viva) */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setIsRoleOpen(!isRoleOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition"
            title="Switch demo persona"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-primary-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className="text-primary-700 font-bold">{user?.role || 'Admin'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {isRoleOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Switch Persona (Viva Demo)</p>
              </div>
              {DEMO_CREDENTIALS.map((cred) => (
                <button
                  key={cred.role}
                  onClick={() => handleRoleSwitch(cred.role)}
                  className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-50 flex flex-col ${
                    user?.role === cred.role ? 'bg-primary-50/70 font-semibold text-primary-800' : 'text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{cred.role}</span>
                    {user?.role === cred.role && <CheckCircle className="w-3.5 h-3.5 text-primary-600" />}
                  </div>
                  <span className="text-[10px] text-slate-500 mt-0.5">{cred.desc}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
                  <p className="text-[10px] text-slate-500">{unreadCount} unread alerts</p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-[11px] font-semibold text-primary-600 hover:text-primary-800"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => markAsRead(n._id)}
                      className={`px-4 py-3 hover:bg-slate-50 text-xs transition cursor-pointer flex gap-3 ${
                        !n.isRead ? 'bg-blue-50/40 font-medium' : ''
                      }`}
                    >
                      <div className="mt-0.5">
                        {n.type === 'WARNING' ? (
                          <span className="w-2 h-2 rounded-full bg-amber-500 block" />
                        ) : n.type === 'SUCCESS' ? (
                          <span className="w-2 h-2 rounded-full bg-emerald-500 block" />
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-blue-500 block" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-slate-800">{n.title}</div>
                        <p className="text-slate-500 mt-0.5 leading-relaxed">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {formatDate(n.createdAt)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-100 text-center">
                <Link
                  to="/audit-logs"
                  onClick={() => setIsNotifOpen(false)}
                  className="text-xs font-semibold text-primary-600 hover:underline inline-flex items-center gap-1"
                >
                  View full audit log <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
            />
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold text-slate-900 leading-tight">{user?.name || 'User'}</span>
              <span className="text-[10px] text-slate-500">{user?.role || 'Staff'}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-fade-in">
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="mt-1.5 inline-block text-[10px] font-semibold px-2 py-0.5 rounded bg-primary-50 text-primary-700">
                  {user?.department || 'Operations'}
                </span>
              </div>

              <div className="py-1">
                <Link
                  to="/settings"
                  onClick={() => setIsProfileOpen(false)}
                  className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  Account Settings
                </Link>
                <Link
                  to="/users"
                  onClick={() => setIsProfileOpen(false)}
                  className="px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2.5"
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Team Management
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
