import React, { useState } from 'react';
import {
  Cpu,
  Layers,
  Database,
  BarChart3,
  Bot,
  FileText,
  ShieldCheck,
  Terminal,
  Brain,
  Globe,
  Sparkles,
  Zap,
  Menu,
  X,
  Play,
  Plus,
} from 'lucide-react';
import { UserSession } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: UserSession;
  hasApiSecret: boolean;
  onLaunchTaskClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  hasApiSecret,
  onLaunchTaskClick,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Control Center', icon: Cpu },
    { id: 'goalEngine', label: 'Goal Engine', icon: Brain, badge: 'Auto' },
    { id: 'agents', label: 'Multi-Agent Fleet', icon: Layers },
    { id: 'automl', label: 'AutoML Workbench', icon: BarChart3 },
    { id: 'rag', label: 'RAG Knowledge Hub', icon: Database },
    { id: 'sql', label: 'NL SQL & BI Studio', icon: Terminal },
    { id: 'chat', label: 'Agent Co-Pilot', icon: Bot },
    { id: 'reports', label: 'Executive Reports', icon: FileText },
    { id: 'security', label: 'System Design & Docs', icon: ShieldCheck },
  ];

  const getActiveTabTitle = () => {
    const item = navItems.find((n) => n.id === activeTab);
    return item ? item.label : 'Control Center';
  };

  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden lg:flex flex-col fixed inset-y-0 left-0 z-40">
        {/* Brand Logo Header */}
        <div className="p-6 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-md shadow-emerald-500/20">
              <div className="w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-emerald-600 rounded-full" />
              </div>
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">
              Nexus<span className="text-emerald-500">AI</span>
            </span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold">
            OS
          </span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 font-bold shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Load & Status Widget at Sidebar Bottom */}
        <div className="p-4 mt-auto border-t border-slate-100">
          <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                System Load
              </p>
              <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                OPTIMAL
              </span>
            </div>
            <div className="flex justify-between items-end pt-1">
              <span className="text-2xl font-extrabold text-white">42%</span>
              <div className="flex gap-1 h-8 items-end">
                <div className="w-1.5 h-3 bg-emerald-400 rounded-full" />
                <div className="w-1.5 h-5 bg-emerald-400 rounded-full" />
                <div className="w-1.5 h-8 bg-emerald-400 rounded-full" />
                <div className="w-1.5 h-4 bg-emerald-400 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Top Header Bar for Desktop & Mobile */}
      <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 lg:pl-72">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {getActiveTabTitle()}
          </h1>
        </div>

        {/* Right Header Avatar Cluster & Action Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex -space-x-2">
            <div className="w-8 h-8 rounded-full border-2 border-white bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold shadow-xs">
              PL
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-teal-100 text-teal-800 flex items-center justify-center text-[10px] font-bold shadow-xs">
              RS
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-blue-100 text-blue-800 flex items-center justify-center text-[10px] font-bold shadow-xs">
              DA
            </div>
            <div className="w-8 h-8 rounded-full border-2 border-white bg-purple-100 text-purple-800 flex items-center justify-center text-[10px] font-bold shadow-xs">
              ML
            </div>
          </div>

          <button
            onClick={() => {
              setActiveTab('agents');
              if (onLaunchTaskClick) onLaunchTaskClick();
            }}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm shadow-emerald-200 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Launch New Task</span>
            <span className="sm:hidden">New Task</span>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex">
          <div className="w-72 bg-white h-full flex flex-col p-6 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <div className="w-3 h-3 bg-white rounded-full" />
                </div>
                <span className="text-lg font-bold text-slate-900">
                  Nexus<span className="text-emerald-500">AI</span>
                </span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="space-y-1.5 flex-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 font-bold'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};

