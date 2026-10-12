import React from 'react';
import { User } from 'firebase/auth';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  Smartphone, 
  Layers, 
  BarChart3, 
  LogOut, 
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { AppConfig, SyncStatus } from '../types';

interface NavbarProps {
  user: User | null;
  config: AppConfig;
  syncStatus: SyncStatus;
  currentView: 'studio' | 'mobile-only' | 'reports';
  onViewChange: (view: 'studio' | 'mobile-only' | 'reports') => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onOpenSpreadsheetModal: () => void;
  isLoggingIn: boolean;
  onTriggerSync?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  config,
  syncStatus,
  currentView,
  onViewChange,
  onLoginClick,
  onLogoutClick,
  onOpenSpreadsheetModal,
  isLoggingIn,
  onTriggerSync,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 dark:border-stone-800 bg-white/95 dark:bg-stone-950/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Brand & Spreadsheet badge */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-stone-900 dark:text-stone-100 tracking-tight text-base">
                SheetSync
              </span>
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                AppSheet Companion
              </span>
            </div>
            
            {/* Sheet Link */}
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
              {config.spreadsheetId ? (
                <>
                  <button 
                    onClick={onOpenSpreadsheetModal}
                    className="hover:text-emerald-600 dark:hover:text-emerald-400 font-medium truncate max-w-[160px] sm:max-w-[220px] text-left transition-colors"
                    title={config.spreadsheetName || 'Connected Sheet'}
                  >
                    {config.spreadsheetName || 'Connected Sheet'}
                  </button>
                  <a
                    href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-stone-400 hover:text-emerald-500 transition-colors"
                    title="Open in Google Sheets"
                  >
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>
                  {syncStatus.state === 'syncing' ? (
                    <RefreshCw className="w-3 h-3 animate-spin text-emerald-500 ml-1" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 ml-1" />
                  )}
                </>
              ) : (
                <button
                  onClick={onOpenSpreadsheetModal}
                  className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-medium"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                  Connect Google Sheet
                </button>
              )}
            </div>
          </div>
        </div>

        {/* View Switcher Navigation */}
        <div className="hidden md:flex items-center p-1 bg-stone-100 dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-800 text-xs font-medium">
          <button
            onClick={() => onViewChange('studio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'studio'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Studio & Companion</span>
          </button>

          <button
            onClick={() => onViewChange('mobile-only')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'mobile-only'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Mobile Logger</span>
          </button>

          <button
            onClick={() => onViewChange('reports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
              currentView === 'reports'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white shadow-xs font-semibold'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>Monthly Reports</span>
          </button>
        </div>

        {/* Mobile View Toggles (compact on small screens) */}
        <div className="flex md:hidden items-center gap-1 bg-stone-100 dark:bg-stone-900 p-1 rounded-lg text-xs">
          <button
            onClick={() => onViewChange('studio')}
            className={`p-1.5 rounded ${currentView === 'studio' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white' : 'text-stone-500'}`}
            title="Studio"
          >
            <Layers className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange('mobile-only')}
            className={`p-1.5 rounded ${currentView === 'mobile-only' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white' : 'text-stone-500'}`}
            title="Mobile Logger"
          >
            <Smartphone className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewChange('reports')}
            className={`p-1.5 rounded ${currentView === 'reports' ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-white' : 'text-stone-500'}`}
            title="Monthly Reports"
          >
            <BarChart3 className="w-4 h-4" />
          </button>
        </div>

        {/* Auth status & actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-6 h-6 rounded-full border border-stone-300 dark:border-stone-700 object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs flex items-center justify-center font-bold">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <span className="text-xs font-medium text-stone-800 dark:text-stone-200 hidden sm:inline max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
                <button
                  onClick={onLogoutClick}
                  className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-full transition-colors ml-1"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={onLoginClick}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-800 dark:text-stone-200 text-xs font-semibold shadow-xs transition-colors"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12c0 2.02.45 3.84 1.25 5.42l4.03-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLoggingIn ? 'Connecting...' : 'Connect Google'}</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
