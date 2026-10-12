export type FieldType = 
  | 'text' 
  | 'number' 
  | 'rating' 
  | 'boolean' 
  | 'select' 
  | 'multiselect' 
  | 'stepper' 
  | 'notes';

export interface CustomField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  options?: string[]; // for select/multiselect
  unit?: string; // e.g. "hrs", "glasses", "pts"
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  defaultValue?: any;
  showInQuickLog?: boolean;
  category: 'life' | 'health' | 'prayer' | 'habits';
}

export interface HabitItem {
  id: string;
  name: string;
  category: 'life' | 'health' | 'prayer' | 'other';
  frequency: 'daily' | 'weekdays' | 'weekends';
  targetDaysPerWeek: number;
  streak: number;
  lastCompletedDate?: string; // YYYY-MM-DD
}

export interface LifeLogEntry {
  id: string;
  timestamp: string; // ISO string
  date: string; // YYYY-MM-DD
  mood: number; // 1-10
  energy: 'Low' | 'Medium' | 'High' | 'Peak';
  gratitude: string;
  highlight: string;
  notes?: string;
  tags?: string[];
  customValues?: Record<string, any>;
}

export interface HealthLogEntry {
  id: string;
  timestamp: string;
  date: string;
  sleepHours: number;
  waterGlasses: number;
  workoutDone: boolean;
  workoutType?: string;
  workoutDurationMin?: number;
  stressLevel: 1 | 2 | 3 | 4 | 5;
  nutritionQuality?: 'Clean' | 'Balanced' | 'Indulgent' | 'Fasting';
  symptomsOrVitals?: string;
  customValues?: Record<string, any>;
}

export interface PrayerLogEntry {
  id: string;
  timestamp: string;
  date: string;
  prayerFocus: string;
  scriptureReference?: string;
  meditationMinutes: number;
  isAnswered: boolean;
  answeredDate?: string;
  answeredNote?: string;
  tags?: string[];
  customValues?: Record<string, any>;
}

export interface HabitLogEntry {
  id: string;
  timestamp: string;
  date: string; // YYYY-MM-DD
  completedHabitIds: string[];
  notes?: string;
}

export interface AppConfig {
  appName: string;
  accentColor: string;
  lifeFields: CustomField[];
  healthFields: CustomField[];
  prayerFields: CustomField[];
  habitFields: CustomField[];
  habitsList: HabitItem[];
  enableHaptics: boolean;
  quickEntryDefaultTab: 'life' | 'health' | 'prayer' | 'habits';
  spreadsheetId: string | null;
  spreadsheetName: string | null;
  lastSyncedAt: string | null;
}

export interface SyncStatus {
  state: 'idle' | 'syncing' | 'synced' | 'error' | 'offline';
  message?: string;
  pendingCount: number;
}
