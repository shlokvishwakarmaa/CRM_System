import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getRoleLabel, getInitials, getAvatarColor } from '@/utils/helpers';
import { resetAllData, initializeData } from '@/utils/api';
import { useNavigate } from 'react-router-dom';
import { Save, RefreshCw, Trash2, Shield, Bell, Palette, Database } from 'lucide-react';

export default function SettingsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetData = () => {
    resetAllData();
    initializeData();
    setShowResetConfirm(false);
    window.location.reload();
  };

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage your account and system preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-orange-500" /> Profile
        </h2>
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${getAvatarColor(user?.name || 'U')}`}>
            {getInitials(user?.name || 'U')}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{user?.name}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-800">
              {getRoleLabel(user?.role || '')}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" defaultValue={user?.name} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" defaultValue={user?.email} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" disabled />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input type="tel" defaultValue={user?.phone} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
            <input type="text" defaultValue={user?.department} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50" disabled />
          </div>
        </div>
        <button onClick={handleSave} className="mt-4 flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors">
          <Save className="w-4 h-4" /> Save Profile
          {saved && <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full ml-1">Saved!</span>}
        </button>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-orange-500" /> Preferences
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Email Notifications</p>
              <p className="text-xs text-gray-500">Receive email alerts for new leads and ticket updates</p>
            </div>
            <button
              onClick={() => setNotifications(!notifications)}
              className={`relative w-11 h-6 rounded-full transition-colors ${notifications ? 'bg-orange-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${notifications ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Dark Mode</p>
              <p className="text-xs text-gray-500">Switch between light and dark themes</p>
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`relative w-11 h-6 rounded-full transition-colors ${darkMode ? 'bg-orange-500' : 'bg-gray-300'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${darkMode ? 'translate-x-5.5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-orange-500" /> Appearance
        </h2>
        <div>
          <p className="text-sm font-medium text-gray-900 mb-2">Accent Color</p>
          <div className="flex gap-2">
            {['bg-orange-500', 'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-red-500', 'bg-teal-500'].map(color => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full ${color} ${color === 'bg-orange-500' ? 'ring-2 ring-offset-2 ring-orange-500' : ''} hover:scale-110 transition-transform`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Data Management */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-orange-500" /> Data Management
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Refresh Sample Data</p>
              <p className="text-xs text-gray-500">Reset all data to initial sample values</p>
            </div>
            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <RefreshCw className="w-4 h-4" /> Reset Data
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">Clear All Data</p>
              <p className="text-xs text-gray-500">Permanently delete all CRM data</p>
            </div>
            <button
              onClick={() => {
                if (confirm('This will delete ALL data permanently. Are you sure?')) {
                  localStorage.clear();
                  navigate('/login');
                  window.location.reload();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-gray-500">Version</p>
            <p className="font-medium text-gray-900">LeadCRM v1.0.0</p>
          </div>
          <div>
            <p className="text-gray-500">Build</p>
            <p className="font-medium text-gray-900">2024.11.10</p>
          </div>
          <div>
            <p className="text-gray-500">Database</p>
            <p className="font-medium text-gray-900">LocalStorage (Demo)</p>
          </div>
          <div>
            <p className="text-gray-500">License</p>
            <p className="font-medium text-gray-900">Indian Business License</p>
          </div>
        </div>
      </div>

      {/* Reset Confirmation */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset All Data?</h3>
            <p className="text-sm text-gray-500 mb-4">This will restore all data to the initial sample values. Any changes you've made will be lost.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowResetConfirm(false)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
              <button onClick={handleResetData} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-lg">Reset</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
