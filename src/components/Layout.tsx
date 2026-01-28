import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Pill,
  History,
  Phone,
  Users,
  Settings,
  Bell,
  Menu,
  X,
  Package
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const navItems = [
  { path: '/', icon: LayoutDashboard, label: '仪表板' },
  { path: '/medications', icon: Pill, label: '药物管理' },
  { path: '/history', icon: History, label: '服药历史' },
  { path: '/emergency', icon: Phone, label: '紧急联系' },
  { path: '/family', icon: Users, label: '家属设置' },
];

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Mobile Header - Notch compatible */}
      <header className="lg:hidden bg-white/95 backdrop-blur-md shadow-lg px-4 py-3 safe-area-top flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
            <Package className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg text-gray-800">智能药盒</span>
            <p className="text-xs text-gray-500 hidden sm:block">健康管理助手</p>
          </div>
        </div>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 active:scale-95 transition-all touch-target shadow-md"
          aria-label="菜单"
        >
          {sidebarOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-out lg:translate-x-0 rounded-r-2xl lg:rounded-none ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo area */}
            <div className="p-6 border-b border-gray-100 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-br-2xl">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-xl text-white">智能药盒</h1>
                  <p className="text-blue-100 text-sm">健康管理助手</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <ul className="space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-200 touch-target ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl'
                            : 'text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50'
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                        <span className="font-medium text-lg">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Settings at bottom */}
            <div className="p-4 border-t border-gray-100">
              <Link
                to="/settings"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-4 px-5 py-4 rounded-2xl text-gray-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-colors touch-target"
              >
                <Settings className="w-6 h-6" />
                <span className="font-medium text-lg">应用设置</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main content */}
        <main className="flex-1 min-h-screen lg:ml-72 pb-20 lg:pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 lg:pt-8">
            {/* Desktop notification icon */}
            <div className="hidden lg:flex justify-end mb-6">
              <button className="relative p-3 rounded-xl bg-white shadow-lg hover:shadow-xl transition-all active:scale-95">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                  3
                </span>
              </button>
            </div>

            {children}
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-100 safe-area-bottom z-40 shadow-lg">
        <div className="flex justify-around py-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 touch-target ${
                  isActive
                    ? 'text-blue-600'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className={`p-2 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30'
                    : 'bg-gray-100'
                }`}>
                  <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-gray-500'} transition-transform ${isActive ? 'scale-110' : ''}`} />
                </div>
                <span className={`text-xs font-medium ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
