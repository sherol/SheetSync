/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  logout, 
  setAccessTokenManually 
} from './services/auth';
import { 
  StorageService 
} from './services/storageService';
import { SheetsService } from './services/sheetsService';
import { 
  AppConfig, 
  SyncStatus, 
  LifeLogEntry, 
  HealthLogEntry, 
  PrayerLogEntry, 
  HabitLogEntry, 
  CustomField, 
  HabitItem 
} from './types';
import { Navbar, AppViewMode } from './components/Navbar';
import { DesktopStudio } from './components/DesktopStudio';
import { MobileView } from './components/MobileView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { SpreadsheetModal } from './components/SpreadsheetModal';
import { DestructiveConfirmModal } from './components/DestructiveConfirmModal';
import { Smartphone, Eye, EyeOff } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Auto-detect initial view: Desktop (>=1024px) -> Schema Editor, Mobile/iPad (<1024px) -> Mobile App
  const [currentView, setCurrentView] = useState<AppViewMode>(() => {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      return 'schema-editor';
    }
    return 'mobile-app';
  });

  // Optional side-by-side preview on desktop
  const [showDesktopMobilePreview, setShowDesktopMobilePreview] = useState(false);

  // App Configuration
  const [config, setConfig] = useState<AppConfig>(() => StorageService.getConfig());

  // Data logs
  const [lifeLogs, setLifeLogs] = useState<LifeLogEntry[]>(() => StorageService.getLifeLogs());
  const [healthLogs, setHealthLogs] = useState<HealthLogEntry[]>(() => StorageService.getHealthLogs());
  const [prayerLogs, setPrayerLogs] = useState<PrayerLogEntry[]>(() => StorageService.getPrayerLogs());
  const [habitLogs, setHabitLogs] = useState<HabitLogEntry[]>(() => StorageService.getHabitLogs());

  // Sync state
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    state: 'idle',
    pendingCount: 0,
  });
  const [isSavingToSheet, setIsSavingToSheet] = useState(false);
  const [isSyncingReport, setIsSyncingReport] = useState(false);

  // Modals
  const [isSpreadsheetModalOpen, setIsSpreadsheetModalOpen] = useState(false);

  // Destructive Confirmation Dialog State
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionText: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    actionText: 'Delete',
    onConfirm: () => {},
  });

  // Today's Date
  const todayStr = new Date().toISOString().split('T')[0];
  const todayHabitLog = habitLogs.find((h) => h.date === todayStr);
  const habitsCheckedToday = todayHabitLog ? todayHabitLog.completedHabitIds : [];
  const todayLifeLog = lifeLogs.find((l) => l.date === todayStr);
  const todayHealthLog = healthLogs.find((h) => h.date === todayStr);
  const todayPrayerLogs = prayerLogs.filter((p) => p.date === todayStr);

  // Initialize auth listener safely
  useEffect(() => {
    try {
      const unsubscribe = initAuth(
        (authUser, token) => {
          setUser(authUser);
          setAccessToken(token);
        },
        () => {
          setUser(null);
          setAccessToken(null);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Auth init failed:', e);
    }
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setAccessToken(res.accessToken);
        setAccessTokenManually(res.accessToken);
      }
    } catch (err) {
      console.error('Sign-in error:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setUser(null);
      setAccessToken(null);
    }
  };

  // Update Config
  const handleUpdateConfig = (newConfig: AppConfig) => {
    setConfig(newConfig);
    StorageService.saveConfig(newConfig);
  };

  // Connect / Select Spreadsheet
  const handleUpdateSpreadsheet = (sheetId: string, sheetName: string) => {
    const updated = {
      ...config,
      spreadsheetId: sheetId,
      spreadsheetName: sheetName,
      lastSyncedAt: new Date().toISOString(),
    };
    handleUpdateConfig(updated);
  };

  // Save Schema Config to Google Sheet
  const handleSaveSchemaToSheet = async () => {
    if (!accessToken || !config.spreadsheetId) {
      setIsSpreadsheetModalOpen(true);
      return;
    }
    setIsSavingToSheet(true);
    try {
      await SheetsService.saveAppConfigToSheet(
        accessToken,
        config.spreadsheetId,
        JSON.stringify(config)
      );
      setSyncStatus({ state: 'synced', pendingCount: 0, message: 'Schema synced to Google Sheet!' });
      setTimeout(() => setSyncStatus({ state: 'idle', pendingCount: 0 }), 3000);
    } catch (err: any) {
      setSyncStatus({ state: 'error', pendingCount: 0, message: err.message });
    } finally {
      setIsSavingToSheet(false);
    }
  };

  // 1. Save Life Log
  const handleSaveLifeLog = async (logData: Omit<LifeLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LifeLogEntry = {
      ...logData,
      id: `life_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const updated = [newEntry, ...lifeLogs.filter(l => l.date !== logData.date)];
    setLifeLogs(updated);
    StorageService.saveLifeLogs(updated);

    if (accessToken && config.spreadsheetId) {
      setSyncStatus({ state: 'syncing', pendingCount: 1 });
      try {
        await SheetsService.appendRow(accessToken, config.spreadsheetId, 'Life_Logs', [
          newEntry.timestamp,
          newEntry.date,
          newEntry.mood,
          newEntry.energy,
          newEntry.gratitude,
          newEntry.highlight,
          newEntry.notes || '',
          (newEntry.tags || []).join(', '),
          JSON.stringify(newEntry.customValues || {}),
        ]);
        setSyncStatus({ state: 'synced', pendingCount: 0 });
        setTimeout(() => setSyncStatus({ state: 'idle', pendingCount: 0 }), 2500);
      } catch (err: any) {
        setSyncStatus({ state: 'error', pendingCount: 1, message: err.message });
      }
    }
  };

  // 2. Save Health Log
  const handleSaveHealthLog = async (logData: Omit<HealthLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: HealthLogEntry = {
      ...logData,
      id: `health_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const updated = [newEntry, ...healthLogs.filter(h => h.date !== logData.date)];
    setHealthLogs(updated);
    StorageService.saveHealthLogs(updated);

    if (accessToken && config.spreadsheetId) {
      setSyncStatus({ state: 'syncing', pendingCount: 1 });
      try {
        await SheetsService.appendRow(accessToken, config.spreadsheetId, 'Health_Logs', [
          newEntry.timestamp,
          newEntry.date,
          newEntry.sleepHours,
          newEntry.waterGlasses,
          newEntry.workoutDone ? 'YES' : 'NO',
          newEntry.workoutType || '',
          newEntry.workoutDurationMin || '',
          newEntry.stressLevel,
          newEntry.nutritionQuality || '',
          newEntry.symptomsOrVitals || '',
          JSON.stringify(newEntry.customValues || {}),
        ]);
        setSyncStatus({ state: 'synced', pendingCount: 0 });
        setTimeout(() => setSyncStatus({ state: 'idle', pendingCount: 0 }), 2500);
      } catch (err: any) {
        setSyncStatus({ state: 'error', pendingCount: 1, message: err.message });
      }
    }
  };

  // 3. Save Prayer Log
  const handleSavePrayerLog = async (logData: Omit<PrayerLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: PrayerLogEntry = {
      ...logData,
      id: `prayer_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };

    const updated = [newEntry, ...prayerLogs];
    setPrayerLogs(updated);
    StorageService.savePrayerLogs(updated);

    if (accessToken && config.spreadsheetId) {
      setSyncStatus({ state: 'syncing', pendingCount: 1 });
      try {
        await SheetsService.appendRow(accessToken, config.spreadsheetId, 'Prayer_Logs', [
          newEntry.timestamp,
          newEntry.date,
          newEntry.prayerFocus,
          newEntry.scriptureReference || '',
          newEntry.meditationMinutes,
          newEntry.isAnswered ? 'YES' : 'NO',
          newEntry.answeredDate || '',
          newEntry.answeredNote || '',
          (newEntry.tags || []).join(', '),
          JSON.stringify(newEntry.customValues || {}),
        ]);
        setSyncStatus({ state: 'syncing', pendingCount: 0 });
        setTimeout(() => setSyncStatus({ state: 'idle', pendingCount: 0 }), 2500);
      } catch (err: any) {
        setSyncStatus({ state: 'error', pendingCount: 1, message: err.message });
      }
    }
  };

  // 4. Save Habit Checkoff
  const handleSaveHabitLog = async (habitIds: string[], notes?: string) => {
    const existingIndex = habitLogs.findIndex(h => h.date === todayStr);
    const newEntry: HabitLogEntry = {
      id: existingIndex >= 0 ? habitLogs[existingIndex].id : `habit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      date: todayStr,
      completedHabitIds: habitIds,
      notes,
    };

    let updatedLogs: HabitLogEntry[];
    if (existingIndex >= 0) {
      updatedLogs = [...habitLogs];
      updatedLogs[existingIndex] = newEntry;
    } else {
      updatedLogs = [newEntry, ...habitLogs];
    }

    setHabitLogs(updatedLogs);
    StorageService.saveHabitLogs(updatedLogs);

    if (accessToken && config.spreadsheetId) {
      setSyncStatus({ state: 'syncing', pendingCount: 1 });
      try {
        await SheetsService.appendRow(accessToken, config.spreadsheetId, 'Habit_Logs', [
          newEntry.timestamp,
          newEntry.date,
          habitIds.join(', '),
          habitIds.length,
          notes || '',
        ]);
        setSyncStatus({ state: 'synced', pendingCount: 0 });
        setTimeout(() => setSyncStatus({ state: 'idle', pendingCount: 0 }), 2500);
      } catch (err: any) {
        setSyncStatus({ state: 'error', pendingCount: 1, message: err.message });
      }
    }
  };

  // 5. Sync Monthly Report
  const handleSyncMonthlyReport = async (rep: any) => {
    if (!accessToken || !config.spreadsheetId) {
      setIsSpreadsheetModalOpen(true);
      return;
    }
    setIsSyncingReport(true);
    try {
      await SheetsService.appendMonthlyReport(accessToken, config.spreadsheetId, [
        rep.month,
        rep.avgMood,
        rep.avgSleep,
        rep.totalWater,
        rep.workoutDays,
        rep.totalPrayers,
        rep.answeredPrayers,
        rep.habitRate,
        rep.insightsText,
      ]);
    } finally {
      setIsSyncingReport(false);
    }
  };

  // Destructive Confirmation: Delete Custom Field
  const requestDeleteField = (field: CustomField) => {
    setConfirmModalState({
      isOpen: true,
      title: `Delete Field "${field.label}"?`,
      description: `Removing this field will exclude it from the mobile logger and future spreadsheet syncs. Existing columns already written to Google Sheets will remain intact.`,
      actionText: 'Delete Field',
      onConfirm: () => {
        const catKey = field.category === 'life' ? 'lifeFields' : field.category === 'health' ? 'healthFields' : field.category === 'prayer' ? 'prayerFields' : 'habitFields';
        const updated = {
          ...config,
          [catKey]: config[catKey].filter(f => f.id !== field.id),
        };
        handleUpdateConfig(updated);
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Destructive Confirmation: Delete Habit
  const requestDeleteHabit = (habit: HabitItem) => {
    setConfirmModalState({
      isOpen: true,
      title: `Delete Habit "${habit.name}"?`,
      description: `This habit and its current streak counter (${habit.streak} days) will be removed from your active daily tracking. Historical logs saved in Google Sheets will be preserved.`,
      actionText: 'Delete Habit',
      onConfirm: () => {
        const updated = {
          ...config,
          habitsList: config.habitsList.filter(h => h.id !== habit.id),
        };
        handleUpdateConfig(updated);
        setConfirmModalState(prev => ({ ...prev, isOpen: false }));
      },
    });
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar
        user={user}
        config={config}
        syncStatus={syncStatus}
        currentView={currentView}
        onViewChange={setCurrentView}
        onLoginClick={handleLogin}
        onLogoutClick={handleLogout}
        onOpenSpreadsheetModal={() => setIsSpreadsheetModalOpen(true)}
        isLoggingIn={isLoggingIn}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col">
        
        {/* VIEW 1: DESKTOP SCHEMA EDITOR (Full width AppSheet Studio for Desktop) */}
        {currentView === 'schema-editor' && (
          <div className="flex-1 flex flex-col space-y-4">
            
            {/* Desktop Toolbar with Optional Mobile Preview Toggle */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h1 className="text-base font-bold text-stone-900 dark:text-stone-100">
                  Desktop Schema Studio
                </h1>
                <p className="text-xs text-stone-500">
                  Customize mobile logging fields, habit engine rules, and Google Sheets database mapping.
                </p>
              </div>

              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => setShowDesktopMobilePreview(!showDesktopMobilePreview)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                    showDesktopMobilePreview
                      ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
                      : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50'
                  }`}
                >
                  {showDesktopMobilePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span>{showDesktopMobilePreview ? 'Hide Phone Preview' : 'Side-by-Side Phone Preview'}</span>
                </button>
              </div>
            </div>

            {/* Layout: Full width or split if preview is opened */}
            <div className={`flex-1 grid gap-6 ${showDesktopMobilePreview ? 'grid-cols-1 lg:grid-cols-12' : 'grid-cols-1'}`}>
              
              <div className={showDesktopMobilePreview ? 'lg:col-span-7' : 'w-full'}>
                <DesktopStudio
                  config={config}
                  onUpdateConfig={handleUpdateConfig}
                  onSaveToSheet={handleSaveSchemaToSheet}
                  isSavingToSheet={isSavingToSheet}
                  onRequestDeleteField={requestDeleteField}
                  onRequestDeleteHabit={requestDeleteHabit}
                />
              </div>

              {showDesktopMobilePreview && (
                <div className="lg:col-span-5 flex flex-col items-center">
                  <div className="w-full max-w-[380px] h-[720px] bg-stone-900 rounded-[44px] p-3 shadow-2xl border-4 border-stone-800 relative flex flex-col ring-1 ring-stone-700/50">
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-end px-2.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-stone-800" />
                    </div>
                    <div className="w-full h-full rounded-[34px] overflow-hidden bg-white dark:bg-stone-950 flex flex-col">
                      <MobileView
                        config={config}
                        onSaveLifeLog={handleSaveLifeLog}
                        onSaveHealthLog={handleSaveHealthLog}
                        onSavePrayerLog={handleSavePrayerLog}
                        onSaveHabitLog={handleSaveHabitLog}
                        habitsCheckedToday={habitsCheckedToday}
                        todayLifeLog={todayLifeLog}
                        todayHealthLog={todayHealthLog}
                        todayPrayerLogs={todayPrayerLogs}
                        isSyncing={syncStatus.state === 'syncing'}
                        isInDesktopFrame={true}
                      />
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-32 h-1 bg-stone-700 rounded-full pointer-events-none" />
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* VIEW 2: THE MOBILE & IPAD / TABLET APP ITSELF */}
        {currentView === 'mobile-app' && (
          <div className="flex-1 flex justify-center py-1 sm:py-3">
            <MobileView
              config={config}
              onSaveLifeLog={handleSaveLifeLog}
              onSaveHealthLog={handleSaveHealthLog}
              onSavePrayerLog={handleSavePrayerLog}
              onSaveHabitLog={handleSaveHabitLog}
              habitsCheckedToday={habitsCheckedToday}
              todayLifeLog={todayLifeLog}
              todayHealthLog={todayHealthLog}
              todayPrayerLogs={todayPrayerLogs}
              isSyncing={syncStatus.state === 'syncing'}
              isInDesktopFrame={false}
            />
          </div>
        )}

        {/* VIEW 3: AUTOMATED MONTHLY REPORTS */}
        {currentView === 'reports' && (
          <div className="flex-1">
            <MonthlyReportView
              config={config}
              lifeLogs={lifeLogs}
              healthLogs={healthLogs}
              prayerLogs={prayerLogs}
              habitLogs={habitLogs}
              onSyncReportToSheet={handleSyncMonthlyReport}
              isSyncingReport={isSyncingReport}
            />
          </div>
        )}

      </main>

      {/* Spreadsheet Connection & Creation Modal */}
      <SpreadsheetModal
        isOpen={isSpreadsheetModalOpen}
        onClose={() => setIsSpreadsheetModalOpen(false)}
        config={config}
        onUpdateSpreadsheet={handleUpdateSpreadsheet}
        accessToken={accessToken}
        onLoginClick={handleLogin}
      />

      {/* Destructive Action Confirmation Modal */}
      <DestructiveConfirmModal
        isOpen={confirmModalState.isOpen}
        title={confirmModalState.title}
        description={confirmModalState.description}
        actionButtonText={confirmModalState.actionText}
        onConfirm={confirmModalState.onConfirm}
        onCancel={() => setConfirmModalState(prev => ({ ...prev, isOpen: false }))}
      />

    </div>
  );
}
