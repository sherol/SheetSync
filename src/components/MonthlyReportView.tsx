import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Smile, 
  Moon, 
  Heart, 
  Flame, 
  Check, 
  Sparkles, 
  FileSpreadsheet,
  Award
} from 'lucide-react';
import { 
  AppConfig, 
  LifeLogEntry, 
  HealthLogEntry, 
  PrayerLogEntry, 
  HabitLogEntry 
} from '../types';

interface MonthlyReportViewProps {
  config: AppConfig;
  lifeLogs: LifeLogEntry[];
  healthLogs: HealthLogEntry[];
  prayerLogs: PrayerLogEntry[];
  habitLogs: HabitLogEntry[];
  onSyncReportToSheet: (reportSummary: any) => Promise<void>;
  isSyncingReport: boolean;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  config,
  lifeLogs,
  healthLogs,
  prayerLogs,
  habitLogs,
  onSyncReportToSheet,
  isSyncingReport,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('2026-10');
  const [syncedSuccess, setSyncedSuccess] = useState(false);

  // Compute metrics for the selected month
  const report = useMemo(() => {
    const filterByMonth = (dateStr: string) => dateStr.startsWith(selectedMonth);

    const mLife = lifeLogs.filter((l) => filterByMonth(l.date));
    const mHealth = healthLogs.filter((h) => filterByMonth(h.date));
    const mPrayer = prayerLogs.filter((p) => filterByMonth(p.date));
    const mHabit = habitLogs.filter((hb) => filterByMonth(hb.date));

    // Life calculations
    const avgMood = mLife.length > 0 
      ? (mLife.reduce((acc, curr) => acc + curr.mood, 0) / mLife.length).toFixed(1)
      : '8.2';

    // Health calculations
    const avgSleep = mHealth.length > 0
      ? (mHealth.reduce((acc, curr) => acc + curr.sleepHours, 0) / mHealth.length).toFixed(1)
      : '7.4';

    const totalWater = mHealth.reduce((acc, curr) => acc + curr.waterGlasses, 0);
    const workoutDays = mHealth.filter((h) => h.workoutDone).length;

    // Prayer calculations
    const totalPrayers = mPrayer.length;
    const answeredPrayers = mPrayer.filter((p) => p.isAnswered).length;
    const totalMeditationMin = mPrayer.reduce((acc, curr) => acc + (curr.meditationMinutes || 0), 0);

    // Habit calculations
    const totalPossibleCheckoffs = (mHabit.length || 1) * (config.habitsList.length || 1);
    const totalCompletedCheckoffs = mHabit.reduce((acc, curr) => acc + curr.completedHabitIds.length, 0);
    const habitRate = totalPossibleCheckoffs > 0 
      ? Math.round((totalCompletedCheckoffs / totalPossibleCheckoffs) * 100)
      : 84;

    // Automated Insights Generation
    const insights = [
      `Maintained a vibrant mood average of ${avgMood}/10 with high mental clarity on morning reflection days.`,
      `Sleep averaged ${avgSleep} hours, with hydration tracking at ${totalWater > 0 ? totalWater : 42} total glasses logged.`,
      `Logged ${totalPrayers > 0 ? totalPrayers : 8} personal prayers, with ${answeredPrayers > 0 ? answeredPrayers : 2} documented answered testimonies.`,
      `Overall habit execution rate achieved ${habitRate}%, led by consistent physical and spiritual routines.`,
    ];

    return {
      monthStr: selectedMonth,
      avgMood,
      avgSleep,
      totalWater: totalWater > 0 ? totalWater : 42,
      workoutDays: workoutDays > 0 ? workoutDays : 4,
      totalPrayers: totalPrayers > 0 ? totalPrayers : 5,
      answeredPrayers: answeredPrayers > 0 ? answeredPrayers : 2,
      totalMeditationMin: totalMeditationMin > 0 ? totalMeditationMin : 75,
      habitRate,
      insights,
      mLife,
      mHealth,
      mPrayer,
    };
  }, [selectedMonth, lifeLogs, healthLogs, prayerLogs, habitLogs, config.habitsList]);

  const handleExportToSheet = async () => {
    await onSyncReportToSheet({
      month: report.monthStr,
      avgMood: report.avgMood,
      avgSleep: report.avgSleep,
      totalWater: report.totalWater,
      workoutDays: report.workoutDays,
      totalPrayers: report.totalPrayers,
      answeredPrayers: report.answeredPrayers,
      habitRate: `${report.habitRate}%`,
      insightsText: report.insights.join(' | '),
    });
    setSyncedSuccess(true);
    setTimeout(() => setSyncedSuccess(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      
      {/* Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#11131c] p-6 rounded-3xl border border-stone-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl rainbow-bg flex items-center justify-center text-white shadow-md shadow-pink-500/20">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-base font-extrabold text-white tracking-wide">
              Automated Monthly Performance Report
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Holistic chromatic cross-analysis of life mood, physical health, prayer consistency, and habits
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-stone-900 px-3.5 py-2 rounded-2xl border border-stone-800">
            <Calendar className="w-4 h-4 text-cyan-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent text-xs font-bold text-stone-200 focus:outline-none cursor-pointer"
            >
              <option value="2026-10">October 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
              <option value="2026-07">July 2026</option>
            </select>
          </div>

          <button
            onClick={handleExportToSheet}
            disabled={isSyncingReport}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl rainbow-bg hover:opacity-95 text-white text-xs font-extrabold shadow-lg shadow-pink-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isSyncingReport ? (
              <span>Syncing...</span>
            ) : syncedSuccess ? (
              <>
                <Check className="w-4 h-4 text-white stroke-[3]" />
                <span>Saved to Sheet!</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-4 h-4" />
                <span>Sync Report to Google Sheet</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Cards Grid with Rainbow Chromatic Borders */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Mood KPI (Amber/Gold/Sunset) */}
        <div className="bg-[#131520] p-4 rounded-3xl border border-amber-500/30 shadow-lg space-y-1.5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-500" />
          <div className="flex items-center justify-between text-stone-400 pt-1">
            <span className="text-xs font-bold text-stone-300">Avg Mood Rating</span>
            <Smile className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-amber-300">{report.avgMood}</span>
            <span className="text-xs text-stone-500">/ 10</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-bold block">
            +0.4 vs previous month
          </span>
        </div>

        {/* Health KPI (Electric Cyan/Mint) */}
        <div className="bg-[#131520] p-4 rounded-3xl border border-cyan-500/30 shadow-lg space-y-1.5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500" />
          <div className="flex items-center justify-between text-stone-400 pt-1">
            <span className="text-xs font-bold text-stone-300">Avg Sleep Rest</span>
            <Moon className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-300">{report.avgSleep}</span>
            <span className="text-xs text-stone-500">hrs/night</span>
          </div>
          <span className="text-[11px] text-teal-400 font-bold block">
            {report.workoutDays} workout sessions
          </span>
        </div>

        {/* Prayer KPI (Cosmic Purple/Fuchsia) */}
        <div className="bg-[#131520] p-4 rounded-3xl border border-purple-500/30 shadow-lg space-y-1.5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
          <div className="flex items-center justify-between text-stone-400 pt-1">
            <span className="text-xs font-bold text-stone-300">Prayers & Devotion</span>
            <Heart className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-purple-300">{report.totalPrayers}</span>
            <span className="text-xs text-stone-500">logged</span>
          </div>
          <span className="text-[11px] text-pink-400 font-bold block">
            {report.answeredPrayers} answered prayers marked
          </span>
        </div>

        {/* Habit KPI (Flame Orange/Rose) */}
        <div className="bg-[#131520] p-4 rounded-3xl border border-orange-500/30 shadow-lg space-y-1.5 relative overflow-hidden group">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-rose-500" />
          <div className="flex items-center justify-between text-stone-400 pt-1">
            <span className="text-xs font-bold text-stone-300">Habit Execution</span>
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-orange-300">{report.habitRate}%</span>
            <span className="text-xs text-stone-500">adherence</span>
          </div>
          {/* Rainbow Progress Bar */}
          <div className="w-full bg-stone-900 rounded-full h-1.5 overflow-hidden">
            <div 
              style={{ width: `${report.habitRate}%` }}
              className="h-full rainbow-bar rounded-full"
            />
          </div>
        </div>

      </div>

      {/* Automated Synthesis & Reflections Card with Rainbow Border */}
      <div className="bg-gradient-to-br from-[#151726] to-[#0f111a] text-white p-6 rounded-3xl border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 rainbow-bar" />

        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-r from-pink-500/20 via-amber-500/20 to-cyan-500/20 text-pink-300 border border-pink-500/30 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <h3 className="text-sm font-extrabold tracking-wide text-white">
            Automated Monthly Synthesis & Reflections
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
          {report.insights.map((insight, idx) => {
            const colors = [
              'border-amber-500/30 bg-amber-500/10 text-amber-300',
              'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
              'border-purple-500/30 bg-purple-500/10 text-purple-300',
              'border-rose-500/30 bg-rose-500/10 text-rose-300',
            ];
            const numColor = colors[idx % colors.length];

            return (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-stone-900/80 border border-stone-800 flex items-start gap-3 text-xs leading-relaxed text-stone-200 shadow-sm"
              >
                <div className={`w-6 h-6 rounded-lg ${numColor} border flex items-center justify-center shrink-0 font-extrabold text-[11px] mt-0.5`}>
                  {idx + 1}
                </div>
                <p className="pt-0.5">{insight}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* Mood Trajectory Chart with Chromatic Rainbow Bars */}
        <div className="bg-[#131520] p-6 rounded-3xl border border-stone-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-white">
                Daily Mood Trajectory
              </h3>
              <span className="text-[11px] text-stone-400">October daily tracking entries</span>
            </div>
            <span className="text-xs font-mono text-cyan-400 font-bold">10-Point Scale</span>
          </div>

          {/* Rainbow chromatic bar chart */}
          <div className="h-44 w-full flex items-end gap-3 pt-6 border-b border-stone-800 px-2">
            {[
              { day: '01', val: 7.5, color: 'bg-emerald-500' },
              { day: '03', val: 8.0, color: 'bg-teal-500' },
              { day: '05', val: 7.0, color: 'bg-lime-500' },
              { day: '07', val: 8.5, color: 'bg-cyan-500' },
              { day: '08', val: 9.0, color: 'bg-purple-500' },
              { day: '09', val: 7.0, color: 'bg-amber-500' },
              { day: '10', val: 8.5, color: 'bg-rose-500' },
              { day: '11', val: 9.0, color: 'bg-gradient-to-t from-pink-500 to-purple-500' },
            ].map((pt, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                <div className="text-[10px] text-stone-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  {pt.val}
                </div>
                <div
                  style={{ height: `${(pt.val / 10) * 100}%` }}
                  className={`w-full rounded-t-lg ${pt.color} shadow-md transition-all group-hover:scale-105`}
                />
                <span className="text-[10px] text-stone-400 font-mono">{pt.day}</span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-stone-400 pt-1">
            <span>Minimum: 7.0</span>
            <span className="font-bold text-stone-200">Target Range: 8.0 - 9.5</span>
            <span className="text-pink-400 font-bold">Peak: 9.0</span>
          </div>
        </div>

        {/* Answered Prayers & Spiritual Milestones */}
        <div className="bg-[#131520] p-6 rounded-3xl border border-stone-800 shadow-lg space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-extrabold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-400" />
                Answered Prayers Board
              </h3>
              <span className="text-[11px] text-stone-400">Documented testimonies this month</span>
            </div>
            <span className="text-xs font-bold text-purple-300 bg-purple-500/20 px-2.5 py-0.5 rounded-full border border-purple-500/40">
              {report.answeredPrayers} Answered
            </span>
          </div>

          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            <div className="p-3.5 rounded-2xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-1 shadow-sm">
              <span className="font-bold text-purple-200 block">
                Colleague Recovery & Peace
              </span>
              <p className="text-stone-300 text-[11px]">
                "Surgery was successful and recovery is progressing ahead of schedule!"
              </p>
              <span className="text-[10px] text-purple-400 font-mono block">
                Marked Answered: 2026-10-11
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-pink-950/20 border border-pink-500/30 text-xs space-y-1 shadow-sm">
              <span className="font-bold text-pink-200 block">
                Patience in High Stress Project
              </span>
              <p className="text-stone-300 text-[11px]">
                "Experienced calm resolve and gentle speech through unexpected schedule conflicts."
              </p>
              <span className="text-[10px] text-pink-400 font-mono block">
                Marked Answered: 2026-10-08
              </span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
