import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Save, 
  Check, 
  HelpCircle,
  Database,
  Flame,
  Activity,
  Heart,
  Smile,
  BookOpen
} from 'lucide-react';
import { AppConfig, CustomField, FieldType, HabitItem } from '../types';

interface DesktopStudioProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  onSaveToSheet: () => void;
  isSavingToSheet: boolean;
  onRequestDeleteField: (field: CustomField) => void;
  onRequestDeleteHabit: (habit: HabitItem) => void;
}

export const DesktopStudio: React.FC<DesktopStudioProps> = ({
  config,
  onUpdateConfig,
  onSaveToSheet,
  isSavingToSheet,
  onRequestDeleteField,
  onRequestDeleteHabit,
}) => {
  const [activeTab, setActiveTab] = useState<'life' | 'health' | 'prayer' | 'habits' | 'settings'>('life');
  const [isAddingField, setIsAddingField] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<FieldType>('text');
  const [newFieldUnit, setNewFieldUnit] = useState('');
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldQuickLog, setNewFieldQuickLog] = useState(true);

  // New Habit creation
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitCategory, setNewHabitCategory] = useState<'life' | 'health' | 'prayer' | 'other'>('health');
  const [newHabitTargetDays, setNewHabitTargetDays] = useState(7);

  const getFieldsForCategory = (cat: 'life' | 'health' | 'prayer' | 'habits'): CustomField[] => {
    switch (cat) {
      case 'life': return config.lifeFields;
      case 'health': return config.healthFields;
      case 'prayer': return config.prayerFields;
      case 'habits': return config.habitFields;
    }
  };

  const handleToggleQuickLog = (fieldId: string, cat: 'life' | 'health' | 'prayer' | 'habits') => {
    const fieldsKey = cat === 'life' ? 'lifeFields' : cat === 'health' ? 'healthFields' : cat === 'prayer' ? 'prayerFields' : 'habitFields';
    const updated = config[fieldsKey].map((f) => {
      if (f.id === fieldId) {
        return { ...f, showInQuickLog: !f.showInQuickLog };
      }
      return f;
    });

    onUpdateConfig({
      ...config,
      [fieldsKey]: updated,
    });
  };

  const handleAddField = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldLabel.trim()) return;

    const id = `f_${Date.now()}`;
    const name = newFieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const fieldCat = activeTab as 'life' | 'health' | 'prayer' | 'habits';

    const newField: CustomField = {
      id,
      name,
      label: newFieldLabel.trim(),
      type: newFieldType,
      category: fieldCat,
      unit: newFieldUnit.trim() || undefined,
      required: newFieldRequired,
      showInQuickLog: newFieldQuickLog,
      options: newFieldType === 'select' || newFieldType === 'multiselect'
        ? newFieldOptions.split(',').map((s) => s.trim()).filter(Boolean)
        : undefined,
    };

    const fieldsKey = fieldCat === 'life' ? 'lifeFields' : fieldCat === 'health' ? 'healthFields' : fieldCat === 'prayer' ? 'prayerFields' : 'habitFields';
    
    onUpdateConfig({
      ...config,
      [fieldsKey]: [...config[fieldsKey], newField],
    });

    // Reset
    setNewFieldLabel('');
    setNewFieldUnit('');
    setNewFieldOptions('');
    setIsAddingField(false);
  };

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitName.trim()) return;

    const newHabit: HabitItem = {
      id: `h_${Date.now()}`,
      name: newHabitName.trim(),
      category: newHabitCategory,
      frequency: 'daily',
      targetDaysPerWeek: newHabitTargetDays,
      streak: 0,
    };

    onUpdateConfig({
      ...config,
      habitsList: [...config.habitsList, newHabit],
    });

    setNewHabitName('');
    setIsAddingHabit(false);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-xs overflow-hidden">
      
      {/* Studio Top Toolbar */}
      <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex flex-wrap items-center justify-between gap-3 bg-stone-50/50 dark:bg-stone-950/40">
        <div>
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-100">
              AppSheet Studio Customizer
            </h2>
            <span className="text-[11px] px-2 py-0.5 rounded-full bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-mono">
              Live Desktop Editor
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Configure mobile logging schemas, custom input fields, and habit tracking logic
          </p>
        </div>

        <button
          onClick={onSaveToSheet}
          disabled={isSavingToSheet}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
        >
          {isSavingToSheet ? (
            <span>Saving schema...</span>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Schema to Sheet</span>
            </>
          )}
        </button>
      </div>

      {/* Domain Navigation Tabs */}
      <div className="flex border-b border-stone-200 dark:border-stone-800 bg-stone-50/30 dark:bg-stone-900/50 px-4 text-xs font-medium overflow-x-auto">
        <button
          onClick={() => { setActiveTab('life'); setIsAddingField(false); }}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'life'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <Smile className="w-4 h-4 text-amber-500" />
          <span>Life & Mind</span>
          <span className="px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-500">
            {config.lifeFields.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('health'); setIsAddingField(false); }}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'health'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <Activity className="w-4 h-4 text-red-500" />
          <span>Health & Body</span>
          <span className="px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-500">
            {config.healthFields.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('prayer'); setIsAddingField(false); }}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'prayer'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <Heart className="w-4 h-4 text-purple-500" />
          <span>Prayer & Spirit</span>
          <span className="px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-500">
            {config.prayerFields.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('habits'); setIsAddingField(false); }}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'habits'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <Flame className="w-4 h-4 text-orange-500" />
          <span>Habit Engine</span>
          <span className="px-1.5 py-0.2 rounded-full bg-stone-100 dark:bg-stone-800 text-[10px] text-stone-500">
            {config.habitsList.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('settings'); setIsAddingField(false); }}
          className={`py-3 px-3.5 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'settings'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'border-transparent text-stone-500 hover:text-stone-800 dark:hover:text-stone-300'
          }`}
        >
          <Settings2 className="w-4 h-4 text-stone-500" />
          <span>Mobile UI Config</span>
        </button>
      </div>

      {/* Main Tab Area */}
      <div className="flex-1 p-5 overflow-y-auto">
        
        {/* Custom Fields Editor for Life / Health / Prayer */}
        {(activeTab === 'life' || activeTab === 'health' || activeTab === 'prayer') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  {activeTab.toUpperCase()} Input Fields Configuration
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                  Fields appear on the mobile logger and sync as designated columns in your Google Sheet.
                </p>
              </div>

              <button
                onClick={() => setIsAddingField(!isAddingField)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add Custom Field</span>
              </button>
            </div>

            {/* Field Builder Form */}
            {isAddingField && (
              <form 
                onSubmit={handleAddField}
                className="p-4 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-3 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between pb-2 border-b border-emerald-200 dark:border-emerald-800/60">
                  <span className="text-xs font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    New Field for {activeTab.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingField(false)}
                    className="text-stone-400 hover:text-stone-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Field Label *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Blood Pressure, Scripture Verse"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Input Type
                    </label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="text">Single-line Text</option>
                      <option value="notes">Long Notes / Textarea</option>
                      <option value="number">Numeric Value</option>
                      <option value="stepper">Stepper (+ / - counter)</option>
                      <option value="rating">Rating (1 to 5 or 10)</option>
                      <option value="boolean">Toggle / Checkbox (Yes / No)</option>
                      <option value="select">Dropdown Choice</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Unit (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. hrs, min, glasses, mmHg"
                      value={newFieldUnit}
                      onChange={(e) => setNewFieldUnit(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                {newFieldType === 'select' && (
                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Dropdown Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Running, Gym, Yoga, Cycling, Walking"
                      value={newFieldOptions}
                      onChange={(e) => setNewFieldOptions(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newFieldQuickLog}
                      onChange={(e) => setNewFieldQuickLog(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Show in Mobile Quick Entry</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-stone-700 dark:text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newFieldRequired}
                      onChange={(e) => setNewFieldRequired(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Required Field</span>
                  </label>

                  <button
                    type="submit"
                    className="ml-auto px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs"
                  >
                    Add Field
                  </button>
                </div>
              </form>
            )}

            {/* List of existing fields */}
            <div className="space-y-2">
              {getFieldsForCategory(activeTab).map((field, idx) => (
                <div
                  key={field.id}
                  className="p-3 rounded-xl border border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-700 bg-white dark:bg-stone-900 flex items-center justify-between gap-3 transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center text-xs font-mono text-stone-400">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-stone-900 dark:text-stone-100">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-[10px] text-red-500 font-medium">*req</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500 dark:text-stone-400">
                        <span className="font-mono bg-stone-100 dark:bg-stone-800 px-1.5 py-0.2 rounded text-[10px]">
                          {field.type}
                        </span>
                        {field.unit && <span>Unit: {field.unit}</span>}
                        {field.options && (
                          <span className="truncate max-w-[200px]">
                            Options: {field.options.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleQuickLog(field.id, activeTab)}
                      className={`p-1.5 rounded-lg text-xs flex items-center gap-1 border transition-colors ${
                        field.showInQuickLog
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
                          : 'bg-stone-100 dark:bg-stone-800 border-stone-200 dark:border-stone-700 text-stone-400'
                      }`}
                      title={field.showInQuickLog ? 'Visible in Mobile Quick Entry' : 'Hidden from Quick Entry'}
                    >
                      {field.showInQuickLog ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline text-[11px]">
                        {field.showInQuickLog ? 'Quick Entry' : 'Detailed Only'}
                      </span>
                    </button>

                    <button
                      onClick={() => onRequestDeleteField(field)}
                      className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Remove field"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Habits Engine Manager */}
        {activeTab === 'habits' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                  Daily Habit Checklist & Streaks
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                  Habits render as lightning-fast one-tap checkoffs on mobile and sync daily streaks to your Google Sheet.
                </p>
              </div>

              <button
                onClick={() => setIsAddingHabit(!isAddingHabit)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Add New Habit</span>
              </button>
            </div>

            {/* New Habit Builder */}
            {isAddingHabit && (
              <form
                onSubmit={handleAddHabit}
                className="p-4 rounded-xl border border-orange-300 dark:border-orange-800 bg-orange-50/40 dark:bg-orange-950/20 space-y-3 animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between pb-2 border-b border-orange-200 dark:border-orange-800/60">
                  <span className="text-xs font-semibold text-orange-900 dark:text-orange-200 flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-600" />
                    Create Tracked Habit
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingHabit(false)}
                    className="text-stone-400 hover:text-stone-600 text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Habit Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Read 20 pages, Cold shower"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newHabitCategory}
                      onChange={(e) => setNewHabitCategory(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="health">Health & Body</option>
                      <option value="prayer">Prayer & Spiritual</option>
                      <option value="life">Life & Mindset</option>
                      <option value="other">General / Productivity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-700 dark:text-stone-300 mb-1">
                      Target (Days / Week)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={newHabitTargetDays}
                      onChange={(e) => setNewHabitTargetDays(parseInt(e.target.value) || 7)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white text-xs font-semibold shadow-xs"
                  >
                    Save Habit
                  </button>
                </div>
              </form>
            )}

            {/* Habit Items Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.habitsList.map((habit) => (
                <div
                  key={habit.id}
                  className="p-3.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 flex items-start justify-between gap-3 shadow-2xs"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-stone-900 dark:text-stone-100 truncate">
                        {habit.name}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                        habit.category === 'prayer' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300' :
                        habit.category === 'health' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300' :
                        'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                      }`}>
                        {habit.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-stone-500">
                      <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 font-semibold">
                        <Flame className="w-3.5 h-3.5 fill-orange-500" />
                        <span>{habit.streak} day streak</span>
                      </div>
                      <span>•</span>
                      <span>{habit.targetDaysPerWeek}x / week</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRequestDeleteHabit(habit)}
                    className="p-1.5 text-stone-400 hover:text-red-500 rounded-lg transition-colors"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile UI Configuration Settings */}
        {activeTab === 'settings' && (
          <div className="space-y-4 max-w-xl">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">
                Mobile Companion Experience
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                Tune the mobile companion's default entry tab and touch behavior.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/50 space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Default Launch Tab on Mobile
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['life', 'health', 'prayer', 'habits'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => onUpdateConfig({ ...config, quickEntryDefaultTab: tab })}
                      className={`py-2 px-2 text-xs rounded-xl font-medium border capitalize text-center transition-all ${
                        config.quickEntryDefaultTab === tab
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-semibold'
                          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-200 dark:border-stone-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200 block">
                      Fast Feedback & Micro-animations
                    </span>
                    <span className="text-[11px] text-stone-500 block">
                      Subtle haptic-style pulse when a habit or log is saved
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enableHaptics}
                    onChange={(e) => onUpdateConfig({ ...config, enableHaptics: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                </label>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 text-xs text-stone-600 dark:text-stone-400 space-y-2">
              <span className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <Database className="w-4 h-4 text-emerald-600" />
                AppSheet Architecture Sync
              </span>
              <p>
                In SheetSync, your Google Spreadsheet acts as the single authoritative database. Adding custom fields here updates both the mobile logging interface and your Google Sheet structure.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
