import React from 'react';
import {
  LayoutDashboard,
  Upload,
  CalendarClock,
  Sparkles,
  Archive,
  FilePenLine,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'upload' | 'deadlines' | 'watchdog' | 'vault' | 'actions';

interface BottomNavProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  flaggedCount?: number;
  upcomingCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  flaggedCount = 0,
  upcomingCount = 0,
}) => {
  const navItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    highlight?: boolean;
  }> = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
      id: 'upload',
      label: 'Upload',
      icon: <Upload className="w-5 h-5" />,
      highlight: true,
    },
    {
      id: 'deadlines',
      label: 'Deadlines',
      icon: <CalendarClock className="w-5 h-5" />,
      badge: upcomingCount > 0 ? upcomingCount : undefined,
    },
    {
      id: 'watchdog',
      label: 'Watchdog',
      icon: <Sparkles className="w-5 h-5" />,
    },
    {
      id: 'actions',
      label: 'Drafts',
      icon: <FilePenLine className="w-5 h-5" />,
    },
    {
      id: 'vault',
      label: 'Vault',
      icon: <Archive className="w-5 h-5" />,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 pb-safe">
      <div className="max-w-md md:max-w-xl mx-auto px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                item.highlight && !isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-medium'
                  : isActive
                  ? 'text-indigo-600 dark:text-indigo-400 font-semibold'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-[10px] font-bold text-white flex items-center justify-center leading-none">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-5 h-0.5 rounded-full bg-indigo-600 dark:bg-indigo-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
