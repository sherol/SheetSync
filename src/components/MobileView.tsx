import React, { useState, useEffect } from 'react';
import { 
  Smile, 
  Activity, 
  Heart, 
  Flame, 
  Check, 
  Plus, 
  Minus, 
  Calendar, 
  Send, 
  Sparkles, 
  Droplet, 
  Moon, 
  Dumbbell, 
  CheckCircle,
  Clock,
  BookOpen
} from 'lucide-react';
import { 
  AppConfig, 
  LifeLogEntry, 
  HealthLogEntry, 
  PrayerLogEntry, 
  HabitLogEntry, 
  CustomField 
} from '../types';

interface MobileViewProps {
  config: AppConfig;
  onSaveLifeLog: (log: Omit<LifeLogEntry, 'id' | 'timestamp'>) => Promise<void>;
  onSaveHealthLog: (log: Omit<HealthLogEntry, 'id' | 'timestamp'>) => Promise<void>;
  onSavePrayerLog: (log: Omit<PrayerLogEntry, 'id' | 'timestamp'>) => Promise<void>;
  onSaveHabitLog: (habitIds: string[], notes?: string) => Promise<void>;
  habitsCheckedToday: string[];
  todayLifeLog?: LifeLogEntry;
  todayHealthLog?: HealthLogEntry;
  todayPrayerLogs?: PrayerLogEntry[];
  isSyncing: boolean;
  isInDesktopFrame?: boolean;
}

export const MobileView: React.FC<MobileViewProps> = ({
  config,
  onSaveLifeLog,
  onSaveHealthLog,
  onSavePrayerLog,
  onSaveHabitLog,
  habitsCheckedToday,
  todayLifeLog,
  todayHealthLog,
  todayPrayerLogs = [],
  isSyncing,
  isInDesktopFrame = false,
}) => {
  const [activeTab, setActiveTab] = useState<'life' | 'health' | 'prayer' | 'habits'>(
    config.quickEntryDefaultTab || 'life'
  );
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [justSavedNotification, setJustSavedNotification] = useState<string | null>(null);

  // Life form state
  const [mood, setMood] = useState(todayLifeLog?.mood ?? 8);
  const [energy, setEnergy] = useState<'Low' | 'Medium' | 'High' | 'Peak'>(todayLifeLog?.energy ?? 'High');
  const [gratitude, setGratitude] = useState(todayLifeLog?.gratitude ?? '');
  const [highlight, setHighlight] = useState(todayLifeLog?.highlight ?? '');
  const [lifeNotes, setLifeNotes] = useState(todayLifeLog?.notes ?? '');
  const [lifeCustomValues, setLifeCustomValues] = useState<Record<string, any>>({});

  // Health form state
  const [sleepHours, setSleepHours] = useState(todayHealthLog?.sleepHours ?? 7.5);
  const [waterGlasses, setWaterGlasses] = useState(todayHealthLog?.waterGlasses ?? 8);
  const [workoutDone, setWorkoutDone] = useState(todayHealthLog?.workoutDone ?? true);
  const [workoutType, setWorkoutType] = useState(todayHealthLog?.workoutType ?? 'Strength / Gym');
  const [workoutDuration, setWorkoutDuration] = useState(todayHealthLog?.workoutDurationMin ?? 30);
  const [stressLevel, setStressLevel] = useState<1 | 2 | 3 | 4 | 5>(todayHealthLog?.stressLevel ?? 2);
  const [nutrition, setNutrition] = useState<'Clean' | 'Balanced' | 'Indulgent' | 'Fasting'>(
    todayHealthLog?.nutritionQuality ?? 'Clean'
  );
  const [healthVitals, setHealthVitals] = useState(todayHealthLog?.symptomsOrVitals ?? '');
  const [healthCustomValues, setHealthCustomValues] = useState<Record<string, any>>({});

  // Prayer form state
  const [prayerFocus, setPrayerFocus] = useState('');
  const [scripture, setScripture] = useState('');
  const [meditationMinutes, setMeditationMinutes] = useState(15);
  const [isAnswered, setIsAnswered] = useState(false);
  const [answeredNote, setAnsweredNote] = useState('');
  const [prayerCustomValues, setPrayerCustomValues] = useState<Record<string, any>>({});

  // Habits local checked set
  const [checkedHabits, setCheckedHabits] = useState<string[]>(habitsCheckedToday);

  useEffect(() => {
    setCheckedHabits(habitsCheckedToday);
  }, [habitsCheckedToday]);

  const triggerFeedback = (message: string) => {
    setJustSavedNotification(message);
    setTimeout(() => {
      setJustSavedNotification(null);
    }, 2500);
  };

  const handleSubmitLife = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveLifeLog({
      date: selectedDate,
      mood,
      energy,
      gratitude: gratitude.trim() || 'A peaceful day and clear mind',
      highlight: highlight.trim() || 'Consistent focus and progress',
      notes: lifeNotes.trim(),
      customValues: lifeCustomValues,
    });
    triggerFeedback('Life log synced to Google Sheets!');
  };

  const handleSubmitHealth = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveHealthLog({
      date: selectedDate,
      sleepHours,
      waterGlasses,
      workoutDone,
      workoutType: workoutDone ? workoutType : undefined,
      workoutDurationMin: workoutDone ? workoutDuration : undefined,
      stressLevel,
      nutritionQuality: nutrition,
      symptomsOrVitals: healthVitals.trim(),
      customValues: healthCustomValues,
    });
    triggerFeedback('Health log synced to Google Sheets!');
  };

  const handleSubmitPrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prayerFocus.trim()) return;
    await onSavePrayerLog({
      date: selectedDate,
      prayerFocus: prayerFocus.trim(),
      scriptureReference: scripture.trim() || undefined,
      meditationMinutes,
      isAnswered,
      answeredDate: isAnswered ? selectedDate : undefined,
      answeredNote: isAnswered ? answeredNote.trim() : undefined,
      customValues: prayerCustomValues,
    });
    setPrayerFocus('');
    setScripture('');
    setAnsweredNote('');
    setIsAnswered(false);
    triggerFeedback('Prayer logged to Google Sheets!');
  };

  const handleToggleHabit = async (habitId: string) => {
    const isChecked = checkedHabits.includes(habitId);
    const nextChecked = isChecked 
      ? checkedHabits.filter((id) => id !== habitId)
      : [...checkedHabits, habitId];
    
    setCheckedHabits(nextChecked);
    await onSaveHabitLog(nextChecked);
    triggerFeedback(isChecked ? 'Habit updated' : 'Habit checked! Streak +1');
  };

  return (
    <div className={`flex flex-col bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 ${
      isInDesktopFrame 
        ? 'h-full' 
        : 'min-h-[calc(100vh-4rem)] w-full max-w-xl md:max-w-2xl mx-auto shadow-sm md:rounded-3xl md:my-4 md:border border-stone-200 dark:border-stone-800'
    }`}>
      
      {/* Mobile Top App Bar */}
      <div className="sticky top-0 z-20 bg-white/90 dark:bg-stone-900/90 backdrop-blur-md border-b border-stone-200 dark:border-stone-800 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-tight text-stone-900 dark:text-stone-100">
              SheetSync
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              Fast Log
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-500 bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded-lg">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-stone-700 dark:text-stone-300 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Quick summary strip */}
        <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-center text-[10px]">
          <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 p-1 rounded-lg">
            <span className="text-amber-800 dark:text-amber-300 block font-semibold">{mood}/10</span>
            <span className="text-amber-600 dark:text-amber-400">Mood</span>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 p-1 rounded-lg">
            <span className="text-blue-800 dark:text-blue-300 block font-semibold">{waterGlasses} gls</span>
            <span className="text-blue-600 dark:text-blue-400">Hydration</span>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/60 p-1 rounded-lg">
            <span className="text-purple-800 dark:text-purple-300 block font-semibold">{meditationMinutes}m</span>
            <span className="text-purple-600 dark:text-purple-400">Prayer</span>
          </div>
          <div className="bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/60 p-1 rounded-lg">
            <span className="text-orange-800 dark:text-orange-300 block font-semibold">{checkedHabits.length}/{config.habitsList.length}</span>
            <span className="text-orange-600 dark:text-orange-400">Habits</span>
          </div>
        </div>

        {/* Fast Category Switcher Buttons */}
        <div className="mt-3 flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl gap-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab('life')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'life'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Smile className="w-3.5 h-3.5 text-amber-500" />
            <span>Life</span>
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'health'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-red-500" />
            <span>Health</span>
          </button>
          <button
            onClick={() => setActiveTab('prayer')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'prayer'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-purple-500" />
            <span>Prayer</span>
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1 transition-all ${
              activeTab === 'habits'
                ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-white shadow-xs font-semibold'
                : 'text-stone-500 hover:text-stone-900 dark:hover:text-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-500" />
            <span>Habits</span>
          </button>
        </div>
      </div>

      {/* Instant Notification Banner */}
      {justSavedNotification && (
        <div className="bg-emerald-600 text-white text-xs font-medium py-1.5 px-4 text-center flex items-center justify-center gap-1.5 animate-in slide-in-from-top duration-150">
          <CheckCircle className="w-3.5 h-3.5" />
          <span>{justSavedNotification}</span>
        </div>
      )}

      {/* Main Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        
        {/* 1. LIFE TAB */}
        {activeTab === 'life' && (
          <form onSubmit={handleSubmitLife} className="space-y-4">
            
            {/* Mood selector (1 to 10 tap chips) */}
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-amber-500" />
                  Day Mood Rating
                </span>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                  {mood} / 10
                </span>
              </div>

              <div className="grid grid-cols-10 gap-1 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setMood(val)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      mood === val
                        ? 'bg-amber-500 text-white shadow-xs scale-105'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level chips */}
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
              <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                Energy Level
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(['Low', 'Medium', 'High', 'Peak'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergy(lvl)}
                    className={`py-2 text-xs font-medium rounded-xl border transition-all text-center ${
                      energy === lvl
                        ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-semibold'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Gratitude & Highlight fast text */}
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Grateful For Today
                </label>
                <input
                  type="text"
                  placeholder="e.g. Good health, family meal, clear sun"
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Daily Win / Highlight
                </label>
                <input
                  type="text"
                  placeholder="e.g. Finished presentation, ran 5k"
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Quick Reflection Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Thoughts, mindset, or evening notes..."
                  value={lifeNotes}
                  onChange={(e) => setLifeNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                />
              </div>
            </div>

            {/* Custom fields configured for Life */}
            {config.lifeFields.filter(f => !['f_mood', 'f_energy', 'f_gratitude', 'f_highlight', 'f_notes'].includes(f.id)).length > 0 && (
              <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                  Custom Life Fields
                </span>
                {config.lifeFields.filter(f => !['f_mood', 'f_energy', 'f_gratitude', 'f_highlight', 'f_notes'].includes(f.id)).map((cf) => (
                  <div key={cf.id}>
                    <label className="block text-xs font-medium text-stone-700 dark:text-stone-300 mb-1">
                      {cf.label} {cf.unit && `(${cf.unit})`}
                    </label>
                    <input
                      type={cf.type === 'number' || cf.type === 'stepper' ? 'number' : 'text'}
                      value={lifeCustomValues[cf.id] ?? ''}
                      onChange={(e) => setLifeCustomValues({ ...lifeCustomValues, [cf.id]: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={isSyncing}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log Life to Google Sheet</span>
            </button>
          </form>
        )}

        {/* 2. HEALTH TAB */}
        {activeTab === 'health' && (
          <form onSubmit={handleSubmitHealth} className="space-y-4">
            
            {/* Sleep Hours Stepper */}
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">Sleep Duration</span>
                  <span className="text-[11px] text-stone-500">Rest recorded</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSleepHours((prev) => Math.max(0, Math.round((prev - 0.5) * 10) / 10))}
                  className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 flex items-center justify-center text-stone-700 dark:text-stone-300 font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 w-12 text-center">
                  {sleepHours}h
                </span>
                <button
                  type="button"
                  onClick={() => setSleepHours((prev) => Math.min(16, Math.round((prev + 0.5) * 10) / 10))}
                  className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 flex items-center justify-center text-stone-700 dark:text-stone-300 font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Water Stepper */}
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">Water Intake</span>
                  <span className="text-[11px] text-stone-500">250ml glasses (~{(waterGlasses * 0.25).toFixed(1)}L)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setWaterGlasses((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 flex items-center justify-center text-stone-700 dark:text-stone-300 font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-stone-900 dark:text-stone-100 w-12 text-center">
                  {waterGlasses}
                </span>
                <button
                  type="button"
                  onClick={() => setWaterGlasses((prev) => prev + 1)}
                  className="w-8 h-8 rounded-lg bg-blue-600 text-white hover:bg-blue-500 flex items-center justify-center font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Workout toggle & details */}
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                    Workout / Exercise Completed?
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setWorkoutDone(!workoutDone)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    workoutDone ? 'bg-emerald-600' : 'bg-stone-300 dark:bg-stone-700'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                      workoutDone ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {workoutDone && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-1">Activity Type</label>
                    <select
                      value={workoutType}
                      onChange={(e) => setWorkoutType(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                    >
                      <option>Strength / Gym</option>
                      <option>Running</option>
                      <option>Yoga / Stretch</option>
                      <option>Brisk Walk</option>
                      <option>Swimming</option>
                      <option>Cycling</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-stone-500 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      value={workoutDuration}
                      onChange={(e) => setWorkoutDuration(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stress level (1 to 5) */}
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Stress Level (1 Calm — 5 High)
                </span>
                <span className="text-xs font-bold text-stone-700 dark:text-stone-300">
                  {stressLevel}/5
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {([1, 2, 3, 4, 5] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setStressLevel(lvl)}
                    className={`py-2 text-xs font-bold rounded-lg transition-all ${
                      stressLevel === lvl
                        ? 'bg-red-500 text-white shadow-xs'
                        : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition & Vitals */}
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Nutrition Quality
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Clean', 'Balanced', 'Indulgent', 'Fasting'] as const).map((nut) => (
                    <button
                      key={nut}
                      type="button"
                      onClick={() => setNutrition(nut)}
                      className={`py-1.5 text-xs rounded-xl border transition-all text-center ${
                        nutrition === nut
                          ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 font-semibold'
                          : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                      }`}
                    >
                      {nut}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Symptoms / Vitals / Supplements
                </label>
                <input
                  type="text"
                  placeholder="e.g. 120/80 BP, Magnesium, no joint pain"
                  value={healthVitals}
                  onChange={(e) => setHealthVitals(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSyncing}
              className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-500 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log Health to Google Sheet</span>
            </button>
          </form>
        )}

        {/* 3. PRAYER & SPIRIT TAB */}
        {activeTab === 'prayer' && (
          <form onSubmit={handleSubmitPrayer} className="space-y-4">
            
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1">
                  Prayer Focus / Intercession *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What are you bringing before God today? Intercession for loved ones, discernment, peace..."
                  value={prayerFocus}
                  onChange={(e) => setPrayerFocus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-800 dark:text-stone-200 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-600" />
                  Scripture / Verse of the Day
                </label>
                <input
                  type="text"
                  placeholder="e.g. Psalm 23:1, Matthew 6:33"
                  value={scripture}
                  onChange={(e) => setScripture(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Meditation / Contemplation Minutes */}
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-600" />
                  Quiet Time / Meditation
                </span>
                <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                  {meditationMinutes} minutes
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setMeditationMinutes(mins)}
                    className={`py-2 text-xs font-semibold rounded-xl border transition-all ${
                      meditationMinutes === mins
                        ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200'
                        : 'border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Mark as Answered Prayer */}
            <div className="bg-white dark:bg-stone-900 p-3.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-2xs space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200 block">
                    Mark as Answered Prayer?
                  </span>
                  <span className="text-[11px] text-stone-500">
                    Celebrates answered prayers in your monthly report
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isAnswered}
                  onChange={(e) => setIsAnswered(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500 w-4 h-4"
                />
              </label>

              {isAnswered && (
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800 animate-in fade-in">
                  <label className="block text-[11px] font-medium text-stone-600 dark:text-stone-400 mb-1">
                    Testimony / How God Answered
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe how this prayer was answered..."
                    value={answeredNote}
                    onChange={(e) => setAnsweredNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-purple-50/50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSyncing || !prayerFocus.trim()}
              className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 active:scale-[0.99] text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log Prayer to Google Sheet</span>
            </button>
          </form>
        )}

        {/* 4. HABITS TAB */}
        {activeTab === 'habits' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <div>
                <h3 className="text-xs font-semibold text-stone-800 dark:text-stone-200">
                  Today's Habit Checklist
                </h3>
                <span className="text-[11px] text-stone-500">
                  Tap to complete. Synced instantly to your Habit_Logs sheet.
                </span>
              </div>
              <span className="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-full border border-orange-200 dark:border-orange-800">
                {checkedHabits.length} / {config.habitsList.length} Done
              </span>
            </div>

            <div className="space-y-2">
              {config.habitsList.map((habit) => {
                const isDone = checkedHabits.includes(habit.id);
                return (
                  <div
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                      isDone
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 shadow-2xs'
                        : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                        isDone ? 'bg-emerald-600 text-white' : 'border border-stone-300 dark:border-stone-700 bg-stone-100 dark:bg-stone-800'
                      }`}>
                        {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div className="truncate">
                        <span className={`text-xs font-medium block truncate ${
                          isDone ? 'line-through text-stone-500 dark:text-stone-400' : 'text-stone-900 dark:text-stone-100'
                        }`}>
                          {habit.name}
                        </span>
                        <span className="text-[10px] text-stone-400 capitalize">
                          {habit.category} • {habit.targetDaysPerWeek}x weekly
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-orange-600 dark:text-orange-400 shrink-0 font-semibold text-xs">
                      <Flame className="w-3.5 h-3.5 fill-orange-500" />
                      <span>{isDone ? habit.streak + 1 : habit.streak}d</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
