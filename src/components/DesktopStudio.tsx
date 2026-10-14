import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Settings2, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Save, 
  Flame, 
  Activity, 
  Heart, 
  Smile, 
  Database
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
    <div className="flex flex-col h-full bg-[#11131a] rounded-3xl border border-stone-800 shadow-2xl overflow-hidden">
      
      {/* Studio Top Toolbar */}
      <div className="p-4 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3 bg-[#141722]/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-r from-rose-500 to-amber-500 flex items-center justify-center text-white text-xs">
              <Settings2 className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              AppSheet Schema Customizer
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 text-pink-300 border border-pink-500/30">
              Rainbow Studio
            </span>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Configure mobile logging schemas, custom input fields, and habit tracking logic
          </p>
        </div>

        <button
          onClick={onSaveToSheet}
          disabled={isSavingToSheet}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-purple-500 to-cyan-500 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-purple-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
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

      {/* Domain Navigation Tabs in Rainbow Order (Red -> Orange -> Green -> Blue -> Violet) */}
      <div className="flex border-b border-stone-800 bg-[#0d0f15]/80 px-4 text-xs font-medium overflow-x-auto gap-1">
        <button
          onClick={() => { setActiveTab('life'); setIsAddingField(false); }}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'life'
              ? 'border-rose-400 text-rose-300 font-bold bg-rose-500/10'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Smile className="w-4 h-4 text-rose-400" />
          <span>Life & Mind</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-[10px] text-rose-300 font-mono">
            {config.lifeFields.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('health'); setIsAddingField(false); }}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'health'
              ? 'border-orange-400 text-orange-300 font-bold bg-orange-500/10'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Activity className="w-4 h-4 text-orange-400" />
          <span>Health & Body</span>
          <span className="px-1.5 py-0.2 rounded-full bg-orange-500/20 text-[10px] text-orange-300 font-mono">
            {config.healthFields.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('prayer'); setIsAddingField(false); }}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'prayer'
              ? 'border-emerald-400 text-emerald-300 font-bold bg-emerald-500/10'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Heart className="w-4 h-4 text-emerald-400" />
          <span>Prayer & Spirit</span>
          <span className="px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-[10px] text-emerald-300 font-mono">
            {config.prayerFields.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('habits'); setIsAddingField(false); }}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'habits'
              ? 'border-cyan-400 text-cyan-300 font-bold bg-cyan-500/10'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Flame className="w-4 h-4 text-cyan-400" />
          <span>Habit Engine</span>
          <span className="px-1.5 py-0.2 rounded-full bg-cyan-500/20 text-[10px] text-cyan-300 font-mono">
            {config.habitsList.length}
          </span>
        </button>

        <button
          onClick={() => { setActiveTab('settings'); setIsAddingField(false); }}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'settings'
              ? 'border-purple-400 text-purple-300 font-bold bg-purple-500/10'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Settings2 className="w-4 h-4 text-purple-400" />
          <span>Mobile UI Config</span>
        </button>
      </div>

      {/* Main Tab Area */}
      <div className="flex-1 p-5 overflow-y-auto bg-[#0e1017]">
        
        {/* Custom Fields Editor for Life / Health / Prayer */}
        {(activeTab === 'life' || activeTab === 'health' || activeTab === 'prayer') && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  {activeTab.toUpperCase()} Input Fields Configuration
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Fields appear on the mobile logger and sync as designated columns in your Google Sheet.
                </p>
              </div>

              <button
                onClick={() => setIsAddingField(!isAddingField)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-rose-500/20 via-amber-500/20 to-emerald-500/20 hover:from-rose-500/30 hover:to-emerald-500/30 text-rose-300 border border-rose-500/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-rose-400" />
                <span>Add Custom Field</span>
              </button>
            </div>

            {/* Field Builder Form */}
            {isAddingField && (
              <form 
                onSubmit={handleAddField}
                className="p-4 rounded-2xl border border-purple-500/30 bg-[#161926] space-y-3 shadow-xl animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    New Field for {activeTab.toUpperCase()}
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingField(false)}
                    className="text-stone-400 hover:text-stone-200 text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Field Label *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Blood Pressure, Scripture Verse"
                      value={newFieldLabel}
                      onChange={(e) => setNewFieldLabel(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Input Type
                    </label>
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value as FieldType)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Unit (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. hrs, min, glasses, mmHg"
                      value={newFieldUnit}
                      onChange={(e) => setNewFieldUnit(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {newFieldType === 'select' && (
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Dropdown Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      placeholder="Running, Gym, Yoga, Cycling, Walking"
                      value={newFieldOptions}
                      onChange={(e) => setNewFieldOptions(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 pt-1">
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newFieldQuickLog}
                      onChange={(e) => setNewFieldQuickLog(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Show in Mobile Quick Entry</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newFieldRequired}
                      onChange={(e) => setNewFieldRequired(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Required Field</span>
                  </label>

                  <button
                    type="submit"
                    className="ml-auto px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-95 text-white text-xs font-bold shadow-md"
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
                  className="p-3.5 rounded-2xl border border-stone-800 hover:border-stone-700 bg-[#141620] flex items-center justify-between gap-3 transition-colors shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center text-xs font-mono text-stone-500">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-white">
                          {field.label}
                        </span>
                        {field.required && (
                          <span className="text-[10px] text-rose-400 font-bold">*req</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-400">
                        <span className="font-mono bg-stone-900 border border-stone-800 px-2 py-0.5 rounded text-[10px] text-stone-300">
                          {field.type}
                        </span>
                        {field.unit && <span>Unit: {field.unit}</span>}
                        {field.options && (
                          <span className="truncate max-w-[200px] text-stone-400">
                            Options: {field.options.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleQuickLog(field.id, activeTab)}
                      className={`p-1.5 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${
                        field.showInQuickLog
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                          : 'bg-stone-900 border-stone-800 text-stone-500'
                      }`}
                      title={field.showInQuickLog ? 'Visible in Mobile Quick Entry' : 'Hidden from Quick Entry'}
                    >
                      {field.showInQuickLog ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span className="hidden sm:inline text-[11px] font-medium">
                        {field.showInQuickLog ? 'Quick Entry' : 'Detailed Only'}
                      </span>
                    </button>

                    <button
                      onClick={() => onRequestDeleteField(field)}
                      className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg transition-colors"
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
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Daily Habit Checklist & Streaks
                </h3>
                <p className="text-xs text-stone-400 mt-0.5">
                  Habits render as lightning-fast one-tap checkoffs on mobile and sync daily streaks to your Google Sheet.
                </p>
              </div>

              <button
                onClick={() => setIsAddingHabit(!isAddingHabit)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-orange-500/20 to-rose-500/20 text-orange-300 border border-orange-500/30 hover:opacity-90 transition-all"
              >
                <Plus className="w-3.5 h-3.5 text-orange-400" />
                <span>Add New Habit</span>
              </button>
            </div>

            {/* New Habit Builder */}
            {isAddingHabit && (
              <form
                onSubmit={handleAddHabit}
                className="p-4 rounded-2xl border border-orange-500/40 bg-[#181926] space-y-3 shadow-xl animate-in fade-in duration-200"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    Create Tracked Habit
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsAddingHabit(false)}
                    className="text-stone-400 hover:text-stone-200 text-xs"
                  >
                    Cancel
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Habit Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Read 20 pages, Cold shower"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newHabitCategory}
                      onChange={(e) => setNewHabitCategory(e.target.value as any)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="health">Health & Body</option>
                      <option value="prayer">Prayer & Spiritual</option>
                      <option value="life">Life & Mindset</option>
                      <option value="other">General / Productivity</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-300 mb-1">
                      Target (Days / Week)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={7}
                      value={newHabitTargetDays}
                      onChange={(e) => setNewHabitTargetDays(parseInt(e.target.value) || 7)}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-white text-xs font-bold shadow-md"
                  >
                    Save Habit
                  </button>
                </div>
              </form>
            )}

            {/* Habit Items Grid with Rainbow Category Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {config.habitsList.map((habit) => (
                <div
                  key={habit.id}
                  className="p-4 rounded-2xl border border-stone-800 bg-[#141620] flex items-start justify-between gap-3 shadow-sm hover:border-stone-700 transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">
                        {habit.name}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        habit.category === 'prayer' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' :
                        habit.category === 'health' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        habit.category === 'life' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      }`}>
                        {habit.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                      <div className="flex items-center gap-1.5 text-pink-400 font-bold">
                        <Flame className="w-3.5 h-3.5 fill-pink-400 text-pink-400" />
                        <span>{habit.streak} day streak</span>
                      </div>
                      <span>•</span>
                      <span>{habit.targetDaysPerWeek}x / week</span>
                    </div>
                  </div>

                  <button
                    onClick={() => onRequestDeleteHabit(habit)}
                    className="p-1.5 text-stone-500 hover:text-rose-400 rounded-lg transition-colors"
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Mobile Companion Experience
              </h3>
              <p className="text-xs text-stone-400 mt-0.5">
                Tune the mobile companion's default entry tab and touch behavior.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-stone-800 bg-[#141620] space-y-4">
              <div>
                <label className="block text-xs font-medium text-stone-300 mb-2">
                  Default Launch Tab on Mobile
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['life', 'health', 'prayer', 'habits'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => onUpdateConfig({ ...config, quickEntryDefaultTab: tab })}
                      className={`py-2 px-2 text-xs rounded-xl font-bold border capitalize text-center transition-all ${
                        config.quickEntryDefaultTab === tab
                          ? tab === 'life' ? 'border-rose-400 bg-rose-500/20 text-rose-300' :
                            tab === 'health' ? 'border-orange-400 bg-orange-500/20 text-orange-300' :
                            tab === 'prayer' ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300' :
                            'border-purple-400 bg-purple-500/20 text-purple-300'
                          : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-stone-800">
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="text-xs font-semibold text-stone-200 block">
                      Fast Feedback & Micro-animations
                    </span>
                    <span className="text-[11px] text-stone-400 block">
                      Subtle haptic-style pulse when a habit or log is saved
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={config.enableHaptics}
                    onChange={(e) => onUpdateConfig({ ...config, enableHaptics: e.target.checked })}
                    className="rounded text-pink-500 focus:ring-pink-500"
                  />
                </label>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/30 to-blue-950/30 border border-purple-500/20 text-xs text-stone-300 space-y-2">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-cyan-400" />
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
