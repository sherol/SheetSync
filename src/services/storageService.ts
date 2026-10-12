import { AppConfig, HabitItem, LifeLogEntry, HealthLogEntry, PrayerLogEntry, HabitLogEntry } from '../types';

export const DEFAULT_HABITS: HabitItem[] = [
  { id: 'h1', name: 'Morning Prayer & Reflection', category: 'prayer', frequency: 'daily', targetDaysPerWeek: 7, streak: 8, lastCompletedDate: '2026-10-10' },
  { id: 'h2', name: 'Drink 2.5L Water', category: 'health', frequency: 'daily', targetDaysPerWeek: 7, streak: 14, lastCompletedDate: '2026-10-11' },
  { id: 'h3', name: '30-min Workout / Walk', category: 'health', frequency: 'daily', targetDaysPerWeek: 5, streak: 4, lastCompletedDate: '2026-10-10' },
  { id: 'h4', name: 'Scripture / Wisdom Reading', category: 'prayer', frequency: 'daily', targetDaysPerWeek: 7, streak: 12, lastCompletedDate: '2026-10-11' },
  { id: 'h5', name: 'Evening Gratitude Journal', category: 'life', frequency: 'daily', targetDaysPerWeek: 7, streak: 6, lastCompletedDate: '2026-10-10' },
  { id: 'h6', name: 'No Processed Sugar', category: 'health', frequency: 'daily', targetDaysPerWeek: 6, streak: 3, lastCompletedDate: '2026-10-09' },
];

export const INITIAL_CONFIG: AppConfig = {
  appName: 'SheetSync',
  accentColor: '#10b981', // Emerald / Minimalist teal
  lifeFields: [
    { id: 'f_mood', name: 'mood', label: 'Day Mood Rating', type: 'rating', min: 1, max: 10, required: true, showInQuickLog: true, category: 'life' },
    { id: 'f_energy', name: 'energy', label: 'Energy Level', type: 'select', options: ['Low', 'Medium', 'High', 'Peak'], required: true, showInQuickLog: true, category: 'life' },
    { id: 'f_gratitude', name: 'gratitude', label: 'Grateful For', type: 'text', required: true, showInQuickLog: true, category: 'life' },
    { id: 'f_highlight', name: 'highlight', label: 'Daily Win / Highlight', type: 'text', required: false, showInQuickLog: true, category: 'life' },
    { id: 'f_notes', name: 'notes', label: 'Reflection Notes', type: 'notes', required: false, showInQuickLog: false, category: 'life' },
  ],
  healthFields: [
    { id: 'f_sleep', name: 'sleepHours', label: 'Sleep Hours', type: 'stepper', step: 0.5, min: 0, max: 16, unit: 'hrs', required: true, showInQuickLog: true, category: 'health' },
    { id: 'f_water', name: 'waterGlasses', label: 'Water Glasses (250ml)', type: 'stepper', step: 1, min: 0, max: 20, unit: 'gls', required: true, showInQuickLog: true, category: 'health' },
    { id: 'f_workout', name: 'workoutDone', label: 'Exercised Today?', type: 'boolean', required: true, showInQuickLog: true, category: 'health' },
    { id: 'f_workout_type', name: 'workoutType', label: 'Workout Type', type: 'select', options: ['Running', 'Strength / Gym', 'Yoga / Stretch', 'Brisk Walk', 'Swimming', 'Cycling'], showInQuickLog: true, category: 'health' },
    { id: 'f_stress', name: 'stressLevel', label: 'Stress Level (1-5)', type: 'rating', min: 1, max: 5, required: true, showInQuickLog: true, category: 'health' },
    { id: 'f_vitals', name: 'symptomsOrVitals', label: 'Vitals / Symptoms / Meds', type: 'text', showInQuickLog: false, category: 'health' },
  ],
  prayerFields: [
    { id: 'f_prayer_focus', name: 'prayerFocus', label: 'Prayer Intention / Focus', type: 'text', required: true, showInQuickLog: true, category: 'prayer' },
    { id: 'f_scripture', name: 'scriptureReference', label: 'Scripture Verse / Prompt', type: 'text', showInQuickLog: true, category: 'prayer' },
    { id: 'f_meditation', name: 'meditationMinutes', label: 'Quiet / Meditation Time', type: 'stepper', unit: 'min', step: 5, min: 0, max: 120, showInQuickLog: true, category: 'prayer' },
    { id: 'f_answered', name: 'isAnswered', label: 'Mark as Answered Prayer?', type: 'boolean', showInQuickLog: true, category: 'prayer' },
    { id: 'f_answered_notes', name: 'answeredNote', label: 'Testimony / Answer Details', type: 'notes', showInQuickLog: false, category: 'prayer' },
  ],
  habitFields: [
    { id: 'f_habit_notes', name: 'notes', label: 'Habit Daily Notes', type: 'text', showInQuickLog: true, category: 'habits' },
  ],
  habitsList: DEFAULT_HABITS,
  enableHaptics: true,
  quickEntryDefaultTab: 'life',
  spreadsheetId: null,
  spreadsheetName: null,
  lastSyncedAt: null,
};

// Seed sample log entries for immediate visualization and monthly report demonstration
export const SAMPLE_LIFE_LOGS: LifeLogEntry[] = [
  {
    id: 'l-1',
    timestamp: '2026-10-11T14:30:00.000Z',
    date: '2026-10-11',
    mood: 9,
    energy: 'High',
    gratitude: 'Morning clarity, family health, and quiet peaceful start',
    highlight: 'Shipped a great new feature & deep focused work block',
    notes: 'Feeling grateful and grounded today.',
    tags: ['work', 'family', 'peace'],
  },
  {
    id: 'l-2',
    timestamp: '2026-10-10T19:45:00.000Z',
    date: '2026-10-10',
    mood: 8,
    energy: 'High',
    gratitude: 'Good conversation with a mentor and fresh autumn breeze',
    highlight: 'Long walk in nature without looking at notifications',
    notes: 'Mind feels refreshed after being outside.',
    tags: ['outdoors', 'friends'],
  },
  {
    id: 'l-3',
    timestamp: '2026-10-09T20:10:00.000Z',
    date: '2026-10-09',
    mood: 7,
    energy: 'Medium',
    gratitude: 'A warm meal and safe home',
    highlight: 'Completed my reading goal for the week',
    tags: ['reading', 'home'],
  },
  {
    id: 'l-4',
    timestamp: '2026-10-08T18:00:00.000Z',
    date: '2026-10-08',
    mood: 9,
    energy: 'Peak',
    gratitude: 'Surprise visit from an old friend',
    highlight: 'Shared laughs and deep mutual encouragement',
    tags: ['community'],
  },
  {
    id: 'l-5',
    timestamp: '2026-10-07T21:15:00.000Z',
    date: '2026-10-07',
    mood: 8,
    energy: 'Medium',
    gratitude: 'Strength to handle unexpected schedule changes',
    highlight: 'Stayed patient during stressful meetings',
    tags: ['patience', 'growth'],
  },
];

export const SAMPLE_HEALTH_LOGS: HealthLogEntry[] = [
  {
    id: 'h-1',
    timestamp: '2026-10-11T08:00:00.000Z',
    date: '2026-10-11',
    sleepHours: 7.5,
    waterGlasses: 8,
    workoutDone: true,
    workoutType: 'Strength / Gym',
    workoutDurationMin: 45,
    stressLevel: 2,
    nutritionQuality: 'Clean',
    symptomsOrVitals: 'Feeling strong, no soreness',
  },
  {
    id: 'h-2',
    timestamp: '2026-10-10T08:00:00.000Z',
    date: '2026-10-10',
    sleepHours: 8.0,
    waterGlasses: 9,
    workoutDone: true,
    workoutType: 'Running',
    workoutDurationMin: 35,
    stressLevel: 1,
    nutritionQuality: 'Balanced',
  },
  {
    id: 'h-3',
    timestamp: '2026-10-09T08:30:00.000Z',
    date: '2026-10-09',
    sleepHours: 6.8,
    waterGlasses: 7,
    workoutDone: false,
    stressLevel: 3,
    nutritionQuality: 'Balanced',
    symptomsOrVitals: 'Mild neck stiffness from desk posture',
  },
  {
    id: 'h-4',
    timestamp: '2026-10-08T07:45:00.000Z',
    date: '2026-10-08',
    sleepHours: 7.5,
    waterGlasses: 10,
    workoutDone: true,
    workoutType: 'Yoga / Stretch',
    workoutDurationMin: 30,
    stressLevel: 2,
    nutritionQuality: 'Clean',
  },
  {
    id: 'h-5',
    timestamp: '2026-10-07T08:00:00.000Z',
    date: '2026-10-07',
    sleepHours: 7.2,
    waterGlasses: 8,
    workoutDone: true,
    workoutType: 'Brisk Walk',
    workoutDurationMin: 40,
    stressLevel: 2,
    nutritionQuality: 'Clean',
  },
];

export const SAMPLE_PRAYER_LOGS: PrayerLogEntry[] = [
  {
    id: 'p-1',
    timestamp: '2026-10-11T06:30:00.000Z',
    date: '2026-10-11',
    prayerFocus: 'Guidance and humility in making upcoming career decisions; peace for my parents',
    scriptureReference: 'Proverbs 3:5-6 - Trust in the Lord with all your heart',
    meditationMinutes: 20,
    isAnswered: false,
    tags: ['guidance', 'family', 'wisdom'],
  },
  {
    id: 'p-2',
    timestamp: '2026-10-09T07:00:00.000Z',
    date: '2026-10-09',
    prayerFocus: 'Healing for colleague John recovering from surgery',
    scriptureReference: 'Philippians 4:6-7',
    meditationMinutes: 15,
    isAnswered: true,
    answeredDate: '2026-10-11',
    answeredNote: 'John called today: surgery was successful and recovery is progressing ahead of schedule!',
    tags: ['healing', 'friends'],
  },
  {
    id: 'p-3',
    timestamp: '2026-10-07T06:45:00.000Z',
    date: '2026-10-07',
    prayerFocus: 'Patience in interactions, kindness towards strangers',
    scriptureReference: 'Colossians 3:12',
    meditationMinutes: 15,
    isAnswered: true,
    answeredDate: '2026-10-08',
    answeredNote: 'Experienced calm resolve during several challenging moments this week.',
    tags: ['character'],
  },
];

export const SAMPLE_HABIT_LOGS: HabitLogEntry[] = [
  {
    id: 'hb-1',
    timestamp: '2026-10-11T20:00:00.000Z',
    date: '2026-10-11',
    completedHabitIds: ['h1', 'h2', 'h3', 'h4', 'h5'],
    notes: '5 out of 6 completed today!',
  },
  {
    id: 'hb-2',
    timestamp: '2026-10-10T20:00:00.000Z',
    date: '2026-10-10',
    completedHabitIds: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    notes: 'Perfect 100% check-in.',
  },
  {
    id: 'hb-3',
    timestamp: '2026-10-09T20:00:00.000Z',
    date: '2026-10-09',
    completedHabitIds: ['h1', 'h2', 'h4', 'h5'],
  },
  {
    id: 'hb-4',
    timestamp: '2026-10-08T20:00:00.000Z',
    date: '2026-10-08',
    completedHabitIds: ['h1', 'h2', 'h3', 'h4'],
  },
];

const STORAGE_KEYS = {
  CONFIG: 'sheetsync_config',
  LIFE_LOGS: 'sheetsync_life_logs',
  HEALTH_LOGS: 'sheetsync_health_logs',
  PRAYER_LOGS: 'sheetsync_prayer_logs',
  HABIT_LOGS: 'sheetsync_habit_logs',
  PENDING_SYNC: 'sheetsync_pending_queue',
};

export class StorageService {
  static getConfig(): AppConfig {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (saved) {
        return { ...INITIAL_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Storage read failed', e);
    }
    return INITIAL_CONFIG;
  }

  static saveConfig(config: AppConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));
    } catch (e) {
      console.warn('Storage write failed', e);
    }
  }

  static getLifeLogs(): LifeLogEntry[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LIFE_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SAMPLE_LIFE_LOGS;
  }

  static saveLifeLogs(logs: LifeLogEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LIFE_LOGS, JSON.stringify(logs));
    } catch (e) {}
  }

  static getHealthLogs(): HealthLogEntry[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HEALTH_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SAMPLE_HEALTH_LOGS;
  }

  static saveHealthLogs(logs: HealthLogEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HEALTH_LOGS, JSON.stringify(logs));
    } catch (e) {}
  }

  static getPrayerLogs(): PrayerLogEntry[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRAYER_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SAMPLE_PRAYER_LOGS;
  }

  static savePrayerLogs(logs: PrayerLogEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PRAYER_LOGS, JSON.stringify(logs));
    } catch (e) {}
  }

  static getHabitLogs(): HabitLogEntry[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HABIT_LOGS);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return SAMPLE_HABIT_LOGS;
  }

  static saveHabitLogs(logs: HabitLogEntry[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.HABIT_LOGS, JSON.stringify(logs));
    } catch (e) {}
  }
}
