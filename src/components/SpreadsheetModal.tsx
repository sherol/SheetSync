import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Plus, 
  ExternalLink, 
  Check, 
  RefreshCw, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { SheetsService } from '../services/sheetsService';
import { AppConfig } from '../types';

interface SpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: AppConfig;
  onUpdateSpreadsheet: (sheetId: string, sheetName: string) => void;
  accessToken: string | null;
  onLoginClick: () => void;
}

export const SpreadsheetModal: React.FC<SpreadsheetModalProps> = ({
  isOpen,
  onClose,
  config,
  onUpdateSpreadsheet,
  accessToken,
  onLoginClick,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'drive' | 'manual'>('create');
  const [newTitle, setNewTitle] = useState('SheetSync - Personal Tracker');
  const [manualInput, setManualInput] = useState('');
  const [driveSheets, setDriveSheets] = useState<Array<{ id: string; name: string; modifiedTime: string }>>([]);
  const [isLoadingDrive, setIsLoadingDrive] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    if (isOpen && accessToken && activeTab === 'drive') {
      loadDriveFiles();
    }
  }, [isOpen, accessToken, activeTab]);

  const loadDriveFiles = async () => {
    if (!accessToken) return;
    setIsLoadingDrive(true);
    setStatusMessage(null);
    try {
      const files = await SheetsService.listUserSpreadsheets(accessToken);
      setDriveSheets(files);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Could not load spreadsheets from Drive' });
    } finally {
      setIsLoadingDrive(false);
    }
  };

  const handleCreateNew = async () => {
    if (!accessToken) {
      setStatusMessage({ type: 'error', text: 'Please sign in with Google first to create a spreadsheet.' });
      return;
    }
    setIsCreating(true);
    setStatusMessage(null);
    try {
      const res = await SheetsService.createMasterSpreadsheet(accessToken, newTitle || 'SheetSync - Personal Tracker');
      onUpdateSpreadsheet(res.id, res.name);
      setStatusMessage({ type: 'success', text: `Created and linked "${res.name}"!` });
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to create spreadsheet' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleSelectDriveSheet = async (sheet: { id: string; name: string }) => {
    if (!accessToken) return;
    setIsCreating(true);
    setStatusMessage(null);
    try {
      await SheetsService.ensureTabsExist(accessToken, sheet.id);
      onUpdateSpreadsheet(sheet.id, sheet.name);
      setStatusMessage({ type: 'success', text: `Connected to "${sheet.name}" and ensured tabs!` });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to connect sheet' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleManualConnect = async () => {
    if (!manualInput.trim()) return;
    // Extract ID if full URL was pasted
    let id = manualInput.trim();
    const urlMatch = manualInput.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (urlMatch && urlMatch[1]) {
      id = urlMatch[1];
    }

    if (!accessToken) {
      // Allow saving ID locally even in demo mode
      onUpdateSpreadsheet(id, 'Custom Linked Sheet');
      onClose();
      return;
    }

    setIsCreating(true);
    try {
      const details = await SheetsService.getSpreadsheet(accessToken, id);
      await SheetsService.ensureTabsExist(accessToken, id);
      const title = details.properties?.title || 'Google Sheet';
      onUpdateSpreadsheet(id, title);
      setStatusMessage({ type: 'success', text: `Linked "${title}" successfully!` });
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Spreadsheet ID invalid or not accessible. Make sure you have permission.' });
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 shadow-2xl text-stone-900 dark:text-stone-100 flex flex-col max-h-[90vh]"
        role="dialog"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Google Sheets Connection</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Link or create a Google Spreadsheet to store your mobile logs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Linked Sheet Status */}
        {config.spreadsheetId && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              <div className="truncate">
                <span className="text-xs text-stone-500 dark:text-stone-400 block">Currently Active Sheet:</span>
                <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-300 truncate block">
                  {config.spreadsheetName || config.spreadsheetId}
                </span>
              </div>
            </div>
            <a
              href={`https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-lg transition-colors"
            >
              <span>Open in Sheets</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}

        {/* Status notice */}
        {statusMessage && (
          <div className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
            statusMessage.type === 'success' 
              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700' 
              : 'bg-red-100 dark:bg-red-950/80 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700'
          }`}>
            {statusMessage.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Auth prompt if not logged in */}
        {!accessToken && (
          <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">Google Account Required</p>
              <p className="text-xs text-amber-700 dark:text-amber-400">Sign in to read and create spreadsheets in your Google Drive.</p>
            </div>
            <button
              onClick={onLoginClick}
              className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium transition-colors shrink-0"
            >
              Sign In with Google
            </button>
          </div>
        )}

        {/* Tab Selection */}
        <div className="mt-4 flex border-b border-stone-200 dark:border-stone-800 text-xs font-medium">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'create'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Create New Sheet
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'drive'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Choose from Drive
          </button>
          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-2.5 px-3 border-b-2 transition-colors ${
              activeTab === 'manual'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
                : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-200'
            }`}
          >
            Enter ID / URL
          </button>
        </div>

        {/* Content per Tab */}
        <div className="mt-4 flex-1 overflow-y-auto">
          {activeTab === 'create' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Spreadsheet Title
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. SheetSync - Life, Health & Prayer"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/60 text-xs text-stone-600 dark:text-stone-400 space-y-1.5">
                <span className="font-semibold text-stone-800 dark:text-stone-200 block">
                  SheetSync will automatically initialize:
                </span>
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                    <Check className="w-3 h-3 text-emerald-500" /> Life_Logs
                  </span>
                  <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                    <Check className="w-3 h-3 text-emerald-500" /> Health_Logs
                  </span>
                  <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                    <Check className="w-3 h-3 text-emerald-500" /> Prayer_Logs
                  </span>
                  <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                    <Check className="w-3 h-3 text-emerald-500" /> Habit_Logs
                  </span>
                  <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                    <Check className="w-3 h-3 text-emerald-500" /> Monthly_Reports
                  </span>
                  <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                    <Check className="w-3 h-3 text-emerald-500" /> App_Config
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateNew}
                disabled={isCreating}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                {isCreating ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Spreadsheet in Drive...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create & Connect Spreadsheet</span>
                  </>
                )}
              </button>
            </div>
          )}

          {activeTab === 'drive' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-stone-500">
                <span>Recent Spreadsheets in your Drive:</span>
                <button
                  onClick={loadDriveFiles}
                  disabled={isLoadingDrive}
                  className="flex items-center gap-1 text-emerald-600 hover:text-emerald-500"
                >
                  <RefreshCw className={`w-3 h-3 ${isLoadingDrive ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>

              {isLoadingDrive ? (
                <div className="py-8 text-center text-xs text-stone-400">Loading spreadsheets from Drive...</div>
              ) : driveSheets.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  No spreadsheets found. You can create a new one using the "Create New Sheet" tab.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {driveSheets.map((sheet) => (
                    <div
                      key={sheet.id}
                      className="p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-emerald-500/50 hover:bg-stone-50 dark:hover:bg-stone-800/50 flex items-center justify-between transition-colors cursor-pointer group"
                      onClick={() => handleSelectDriveSheet(sheet)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                        <div className="truncate">
                          <p className="text-xs font-medium text-stone-800 dark:text-stone-200 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                            {sheet.name}
                          </p>
                          <span className="text-[10px] text-stone-400">
                            Modified: {new Date(sheet.modifiedTime).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button className="px-2.5 py-1 text-[11px] rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-medium group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Google Sheet URL or Spreadsheet ID
                </label>
                <input
                  type="text"
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Make sure your Google account has editor permissions on this sheet. SheetSync will verify tabs and add missing categories.
              </p>

              <button
                type="button"
                onClick={handleManualConnect}
                disabled={isCreating || !manualInput.trim()}
                className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium text-xs flex items-center justify-center gap-2 transition-colors"
              >
                {isCreating ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                <span>Verify & Connect Sheet</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
