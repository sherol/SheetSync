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

// 10-point chromatic rainbow palette for Mood Buttons
const MOOD_RAINBOW = [
  { val: 1, label: '1', bgActive: 'bg-red-600 text-white shadow-lg shadow-red-500/40', bgIdle: 'bg-red-500/10 text-red-400 border border-red-500/30' },
  { val: 2, label: '2', bgActive: 'bg-rose-600 text-white shadow-lg shadow-rose-500/40', bgIdle: 'bg-rose-500/10 text-rose-400 border border-rose-500/30' },
  { val: 3, label: '3', bgActive: 'bg-orange-600 text-white shadow-lg shadow-orange-500/40', bgIdle: 'bg-orange-500/10 text-orange-400 border border-orange-500/30' },
  { val: 4, label: '4', bgActive: 'bg-amber-600 text-white shadow-lg shadow-amber-500/40', bgIdle: 'bg-amber-500/10 text-amber-400 border border-amber-500/30' },
  { val: 5, label: '5', bgActive: 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/40', bgIdle: 'bg-yellow-500/10 text-yellow-300 border border-yellow-500/30' },
  { val: 6, label: '6', bgActive: 'bg-lime-500 text-black shadow-lg shadow-lime-500/40', bgIdle: 'bg-lime-500/10 text-lime-400 border border-lime-500/30' },
  { val: 7, label: '7', bgActive: 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40', bgIdle: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' },
  { val: 8, label: '8', bgActive: 'bg-teal-500 text-white shadow-lg shadow-teal-500/40', bgIdle: 'bg-teal-500/10 text-teal-300 border border-teal-500/30' },
  { val: 9, label: '9', bgActive: 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/40', bgIdle: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30' },
  { val: 10, label: '10', bgActive: 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-lg shadow-purple-500/50', bgIdle: 'bg-purple-500/15 text-purple-300 border border-purple-500/30' },
];

export const MobileView: React.FC<MobileViewProps> = ({
  config,
  onSaveLifeLog,
  onSaveHealthLog,
  onSavePrayerLog,
  onSaveHabitLog,
  habitsCheckedToday,
  todayLifeLog,
  todayHealthLog,
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
    <div className={`flex flex-col bg-[#0b0c10] text-stone-100 ${
      isInDesktopFrame 
        ? 'h-full' 
        : 'min-h-[calc(100vh-4rem)] w-full max-w-xl md:max-w-2xl mx-auto shadow-2xl md:rounded-3xl md:my-4 md:border border-stone-800'
    }`}>
      
      {/* Mobile Top App Bar */}
      <div className="sticky top-0 z-20 bg-[#10121a]/95 backdrop-blur-md border-b border-stone-800 px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-tight rainbow-text">
              SheetSync
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-gradient-to-r from-rose-500/20 to-amber-500/20 text-rose-300 border border-rose-500/30">
              Fast Log
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-stone-300 bg-stone-900 border border-stone-800 px-2.5 py-1 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-stone-200 focus:outline-none cursor-pointer"
            />
          </div>
        </div>

        {/* Rainbow Quick Summary Strip (Red -> Orange -> Green -> Violet) */}
        <div className="mt-2.5 grid grid-cols-4 gap-1.5 text-center text-[10px]">
          <div className="bg-rose-500/10 border border-rose-500/30 p-1.5 rounded-xl shadow-xs">
            <span className="text-rose-300 block font-bold text-xs">{mood}/10</span>
            <span className="text-rose-400/80">Mood</span>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 p-1.5 rounded-xl shadow-xs">
            <span className="text-orange-300 block font-bold text-xs">{waterGlasses} gls</span>
            <span className="text-orange-400/80">Water</span>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-1.5 rounded-xl shadow-xs">
            <span className="text-emerald-300 block font-bold text-xs">{meditationMinutes}m</span>
            <span className="text-emerald-400/80">Prayer</span>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 p-1.5 rounded-xl shadow-xs">
            <span className="text-purple-300 block font-bold text-xs">{checkedHabits.length}/{config.habitsList.length}</span>
            <span className="text-purple-400/80">Habits</span>
          </div>
        </div>

        {/* Fast Category Switcher Buttons in Rainbow Order (Red -> Orange -> Green -> Violet) */}
        <div className="mt-3 flex p-1 bg-stone-900/90 rounded-2xl gap-1 text-xs font-semibold border border-stone-800">
          <button
            onClick={() => setActiveTab('life')}
            className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'life'
                ? 'bg-gradient-to-r from-rose-500/30 to-red-500/20 text-rose-300 border border-rose-500/40 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Smile className="w-3.5 h-3.5 text-rose-400" />
            <span>Life</span>
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'health'
                ? 'bg-gradient-to-r from-orange-500/30 to-amber-500/20 text-orange-300 border border-orange-500/40 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5 text-orange-400" />
            <span>Health</span>
          </button>
          <button
            onClick={() => setActiveTab('prayer')}
            className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'prayer'
                ? 'bg-gradient-to-r from-emerald-500/30 to-teal-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-emerald-400" />
            <span>Prayer</span>
          </button>
          <button
            onClick={() => setActiveTab('habits')}
            className={`flex-1 py-1.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'habits'
                ? 'bg-gradient-to-r from-purple-500/30 to-violet-500/20 text-purple-300 border border-purple-500/40 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-purple-400" />
            <span>Habits</span>
          </button>
        </div>
      </div>

      {/* Instant Notification Banner */}
      {justSavedNotification && (
        <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-1.5 shadow-md animate-in slide-in-from-top duration-150">
          <CheckCircle className="w-4 h-4" />
          <span>{justSavedNotification}</span>
        </div>
      )}

      {/* Main Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        
        {/* 1. LIFE TAB */}
        {activeTab === 'life' && (
          <form onSubmit={handleSubmitLife} className="space-y-4">
            
            {/* Chromatic Rainbow Mood Selector (1 to 10) */}
            <div className="bg-[#13151f] p-4 rounded-2xl border border-stone-800 shadow-md space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Smile className="w-4 h-4 text-amber-400" />
                  Day Mood Rating
                </span>
                <span className="text-xs font-extrabold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                  {mood} / 10
                </span>
              </div>

              {/* 10-point chromatic rainbow buttons */}
              <div className="grid grid-cols-10 gap-1 pt-1">
                {MOOD_RAINBOW.map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setMood(item.val)}
                    className={`py-2.5 text-xs font-black rounded-xl transition-all ${
                      mood === item.val
                        ? `${item.bgActive} scale-110 z-10 ring-2 ring-white/40`
                        : `${item.bgIdle} hover:scale-105 opacity-80 hover:opacity-100`
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Level chips with warm sunrise colors */}
            <div className="bg-[#13151f] p-4 rounded-2xl border border-stone-800 shadow-md space-y-2">
              <span className="text-xs font-bold text-white block">
                Energy Level
              </span>
              <div className="grid grid-cols-4 gap-2">
                {(['Low', 'Medium', 'High', 'Peak'] as const).map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setEnergy(lvl)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all text-center ${
                      energy === lvl
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 shadow-sm'
                        : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Gratitude & Highlight fast text */}
            <div className="bg-[#13151f] p-4 rounded-2xl border border-stone-800 shadow-md space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-200 mb-1">
                  Grateful For Today
                </label>
                <input
                  type="text"
                  placeholder="e.g. Good health, family meal, clear sun"
                  value={gratitude}
                  onChange={(e) => setGratitude(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-200 mb-1">
                  Daily Win / Highlight
                </label>
                <input
                  type="text"
                  placeholder="e.g. Finished presentation, ran 5k"
                  value={highlight}
                  onChange={(e) => setHighlight(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-200 mb-1">
                  Quick Reflection Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Thoughts, mindset, or evening notes..."
                  value={lifeNotes}
                  onChange={(e) => setLifeNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />
              </div>
            </div>

            {/* Custom fields configured for Life */}
            {config.lifeFields.filter(f => !['f_mood', 'f_energy', 'f_gratitude', 'f_highlight', 'f_notes'].includes(f.id)).length > 0 && (
              <div className="bg-[#13151f] p-4 rounded-2xl border border-stone-800 shadow-md space-y-3">
                <span className="text-xs font-bold text-white block">
                  Custom Life Fields
                </span>
                {config.lifeFields.filter(f => !['f_mood', 'f_energy', 'f_gratitude', 'f_highlight', 'f_notes'].includes(f.id)).map((cf) => (
                  <div key={cf.id}>
                    <label className="block text-xs font-medium text-stone-300 mb-1">
                      {cf.label} {cf.unit && `(${cf.unit})`}
                    </label>
                    <input
                      type={cf.type === 'number' || cf.type === 'stepper' ? 'number' : 'text'}
                      value={lifeCustomValues[cf.id] ?? ''}
                      onChange={(e) => setLifeCustomValues({ ...lifeCustomValues, [cf.id]: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={isSyncing}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500 hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-rose-500/25 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log Life to Google Sheet</span>
            </button>
          </form>
        )}

        {/* 2. HEALTH TAB */}
        {activeTab === 'health' && (
          <form onSubmit={handleSubmitHealth} className="space-y-4">
            
            {/* Sleep Hours Stepper with Indigo/Cyan Glow */}
            <div className="bg-[#13151f] p-4 rounded-2xl border border-stone-800 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Sleep Duration</span>
                  <span className="text-[11px] text-stone-400">Night rest</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSleepHours((prev) => Math.max(0, Math.round((prev - 0.5) * 10) / 10))}
                  className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-200 font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-extrabold text-cyan-300 w-12 text-center">
                  {sleepHours}h
                </span>
                <button
                  type="button"
                  onClick={() => setSleepHours((prev) => Math.min(16, Math.round((prev + 0.5) * 10) / 10))}
                  className="w-8 h-8 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-500/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Water Stepper with Neon Cyan */}
            <div className="bg-[#13151f] p-4 rounded-2xl border border-stone-800 shadow-md flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                  <Droplet className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Water Intake</span>
                  <span className="text-[11px] text-stone-400">250ml glasses (~{(waterGlasses * 0.25).toFixed(1)}L)</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setWaterGlasses((prev) => Math.max(0, prev - 1))}
                  className="w-8 h-8 rounded-xl bg-stone-900 hover:bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-200 font-bold"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-extrabold text-cyan-300 w-12 text-center">
                  {waterGlasses}
                </span>
                <button
                  type="button"
                  onClick={() => setWaterGlasses((prev) => prev + 1)}
                  className="w-8 h-8 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-white hover:opacity-95 flex items-center justify-center font-bold shadow-md shadow-cyan-500/30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Workout toggle & details */}
            <div className="bg-[#13151f] p-4 rounded-2xl border border-stone-800 shadow-md space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">
                    Workout / Exercise Completed?
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setWorkoutDone(!workoutDone)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    workoutDone ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-stone-800'
                  }`}
                >
                  <span
                    className={`block w-5 h-5 rounded-full bg-white shadow-md transition-transform absolute top-0.5 ${
                      workoutDone ? 'left-6' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              {workoutDone && (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">Activity Type</label>
                    <select
                      value={workoutType}
                      onChange={(e) => setWorkoutType(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white"
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
                    <label className="block text-[11px] font-medium text-stone-400 mb-1">Duration (min)</label>
                    <input
                      type="number"
                      value={workoutDuration}
                      onChange={(e) => setWorkoutDuration(parseInt(e.target.value) || 0)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stress level (1 to 5) with chromatic scale */}
            <div className="bg-[#13151f] p-4 rounded-2xl border border-stone-800 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  Stress Level (1 Calm — 5 High)
                </span>
                <span className="text-xs font-extrabold text-rose-400">
                  {stressLevel}/5
                </span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { lvl: 1, label: '1 Calm', color: 'bg-emerald-500 text-white shadow-emerald-500/30' },
                  { lvl: 2, label: '2 Low', color: 'bg-teal-500 text-white shadow-teal-500/30' },
                  { lvl: 3, label: '3 Mid', color: 'bg-amber-500 text-black shadow-amber-500/30' },
                  { lvl: 4, label: '4 High', color: 'bg-orange-500 text-white shadow-orange-500/30' },
                  { lvl: 5, label: '5 Peak', color: 'bg-rose-600 text-white shadow-rose-500/40' },
                ].map((item) => (
                  <button
                    key={item.lvl}
                    type="button"
                    onClick={() => setStressLevel(item.lvl as any)}
                    className={`py-2 text-xs font-bold rounded-xl transition-all ${
                      stressLevel === item.lvl
                        ? `${item.color} shadow-lg scale-105 ring-1 ring-white/30`
                        : 'bg-stone-900 border border-stone-800 text-stone-400'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Nutrition & Vitals */}
            <div className="bg-[#13151f] p-4 rounded-2xl border border-stone-800 shadow-md space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-200 mb-1">
                  Nutrition Quality
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Clean', 'Balanced', 'Indulgent', 'Fasting'] as const).map((nut) => (
                    <button
                      key={nut}
                      type="button"
                      onClick={() => setNutrition(nut)}
                      className={`py-2 text-xs rounded-xl font-bold border transition-all text-center ${
                        nutrition === nut
                          ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300'
                          : 'border-stone-800 bg-stone-900 text-stone-400'
                      }`}
                    >
                      {nut}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-200 mb-1">
                  Symptoms / Vitals / Supplements
                </label>
                <input
                  type="text"
                  placeholder="e.g. 120/80 BP, Magnesium, no joint pain"
                  value={healthVitals}
                  onChange={(e) => setHealthVitals(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSyncing}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:opacity-95 active:scale-[0.99] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Log Health to Google Sheet</span>
            </button>
          </form>
        )}

        {/* 3. PRAYER & SPIRIT TAB */}
        {activeTab === 'prayer' && (
          <form onSubmit={handleSubmitPrayer} className="space-y-4">
            
            <div className="bg-[#13151f] p-4 rounded-2xl border border-stone-800 shadow-md space-y-3">
              <div>
                <label className="block text-xs font-bold text-stone-200 mb-1">
                  Prayer Focus / Intercession *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="What are you bringing before God today? Intercession for loved ones, discernment, peace..."
                  value={prayerFocus}
                  onChange={(e) => setPrayerFocus(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-200 mb-1 flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                  Scripture / Verse of the Day
                </label>
                <input
                  type="text"
                  placeholder="e.g. Psalm 23:1, Matthew 6:33"
                  value={scripture}
                  onChange={(e) => setScripture(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-stone-900 border border-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Meditation / Contemplation Minutes */}
            <div className="bg-[#13151f] p-4 rounded-2xl border border-stone-800 shadow-md space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Quiet Time / Meditation
                </span>
                <span className="text-xs font-extrabold text-purple-300">
                  {meditationMinutes} minutes
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 20, 30].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setMeditationMinutes(mins)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      meditationMinutes === mins
                        ? 'border-purple-400 bg-purple-500/20 text-purple-300 shadow-sm'
                        : 'border-stone-800 bg-stone-900 text-stone-400 hover:text-stone-200'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Mark as Answered Prayer */}
            <div className="bg-[#13151f] p-4 rounded-2xl border border-stone-800 shadow-md space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-xs font-bold text-white block">
                    Mark as Answered Prayer?
                  </span>
                  <span className="text-[11px] text-stone-400">
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
                <div className="pt-2 border-t border-stone-800 animate-in fade-in">
                  <label className="block text-[11px] font-medium text-stone-300 mb-1">
                    Testimony / How God Answered
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Describe how this prayer was answered..."
                    value={answeredNote}
                    onChange={(e) => setAnsweredNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-purple-950/30 border border-purple-500/30 text-white"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isSyncing || !prayerFocus.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 disabled:opacity-50 active:scale-[0.99] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
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
                <h3 className="text-xs font-bold text-white">
                  Today's Habit Checklist
                </h3>
                <span className="text-[11px] text-stone-400">
                  Tap to complete. Synced instantly to your Habit_Logs sheet.
                </span>
              </div>
              <span className="text-xs font-extrabold text-orange-300 bg-orange-500/20 px-2.5 py-0.5 rounded-full border border-orange-500/40">
                {checkedHabits.length} / {config.habitsList.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {config.habitsList.map((habit) => {
                const isDone = checkedHabits.includes(habit.id);
                return (
                  <div
                    key={habit.id}
                    onClick={() => handleToggleHabit(habit.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 select-none ${
                      isDone
                        ? 'bg-gradient-to-r from-emerald-950/40 via-teal-950/30 to-stone-900 border-emerald-500/40 shadow-md shadow-emerald-500/10'
                        : 'bg-[#13151f] border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-7 h-7 rounded-xl flex items-center justify-center transition-all ${
                        isDone 
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/30' 
                          : 'border border-stone-700 bg-stone-900'
                      }`}>
                        {isDone && <Check className="w-4 h-4 stroke-[3]" />}
                      </div>
                      <div className="truncate">
                        <span className={`text-xs font-bold block truncate ${
                          isDone ? 'line-through text-stone-400' : 'text-white'
                        }`}>
                          {habit.name}
                        </span>
                        <span className="text-[10px] text-stone-400 capitalize">
                          {habit.category} • {habit.targetDaysPerWeek}x weekly
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-pink-400 shrink-0 font-extrabold text-xs">
                      <Flame className="w-4 h-4 fill-pink-400 text-pink-400" />
                      <span>{isDone ? habit.streak + 1 : habit.streak} day streak</span>
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
