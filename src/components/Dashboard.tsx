import React from 'react';
import {
  TrendingUp,
  CalendarClock,
  AlertTriangle,
  Upload,
  Camera,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  ChevronRight,
  CheckCircle2,
  FilePenLine,
  Zap,
} from 'lucide-react';
import { AppDocument, DeadlineItem, SubscriptionItem, UserSettings } from '../types';

interface DashboardProps {
  documents: AppDocument[];
  deadlines: DeadlineItem[];
  subscriptions: SubscriptionItem[];
  onSelectDocument: (doc: AppDocument) => void;
  onOpenUpload: () => void;
  onNavigateToDeadlines: () => void;
  onNavigateToWatchdog: () => void;
  onNavigateToActions: () => void;
  onNavigateToVault: () => void;
  settings: UserSettings;
}

export const Dashboard: React.FC<DashboardProps> = ({
  documents,
  deadlines,
  subscriptions,
  onSelectDocument,
  onOpenUpload,
  onNavigateToDeadlines,
  onNavigateToWatchdog,
  onNavigateToActions,
  onNavigateToVault,
  settings,
}) => {
  // Compute metrics
  const totalMoneySaved = documents.reduce((acc, d) => acc + (d.estimatedSavingsPotential || 0), 0) +
    subscriptions.filter((s) => s.status !== 'active').reduce((acc, s) => acc + s.amount, 0);

  const upcomingDeadlinesCount = deadlines.filter((d) => !d.completed).length;

  const totalFlaggedIssues = documents.reduce((acc, d) => acc + d.redFlags.length, 0) +
    subscriptions.filter((s) => s.status !== 'active').length;

  const highSeverityCount = documents.reduce(
    (acc, d) => acc + d.redFlags.filter((f) => f.severity === 'high').length,
    0
  );

  const now = new Date('2026-10-07T00:00:00Z');
  const upcomingDeadlinesList = deadlines
    .filter((d) => !d.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Hero Welcome / Upload Action Card */}
      <div className="rounded-2xl bg-gradient-to-tr from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold">
            <Zap className="w-4 h-4 text-amber-400 fill-current" />
            <span>AUTOPILOT INTELLIGENCE ACTIVE</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
            Understand every bill, policy & contract in 10 seconds.
          </h1>

          <p className="text-xs text-indigo-200 max-w-xl leading-relaxed">
            Snap or upload any confusing paperwork. We translate the fine print, flag unfair penalties, and schedule your renewal deadlines.
          </p>

          <div className="flex flex-wrap items-center gap-2.5 pt-2">
            <button
              onClick={onOpenUpload}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-950 hover:bg-indigo-50 font-bold text-xs shadow-md transition active:scale-95"
            >
              <Upload className="w-4 h-4 text-indigo-700" />
              <span>Upload or Snap Document</span>
            </button>

            <button
              onClick={onNavigateToActions}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white border border-white/20 font-semibold text-xs transition"
            >
              <FilePenLine className="w-4 h-4" />
              <span>Draft Resolution Letter</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Money Saved */}
        <div
          onClick={onNavigateToWatchdog}
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-emerald-500/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Money Saved & Protected</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {settings.currency} {Math.round(totalMoneySaved).toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-emerald-600 transition">
            <span>Caught penalty traps & hikes</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 2: Upcoming Deadlines */}
        <div
          onClick={onNavigateToDeadlines}
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-indigo-500/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Upcoming Deadlines</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <CalendarClock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {upcomingDeadlinesCount}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-indigo-600 transition">
            <span>Next due in 5 days</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>

        {/* Card 3: Issues Flagged */}
        <div
          onClick={onNavigateToVault}
          className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs hover:border-rose-500/50 cursor-pointer transition group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Hidden Traps Flagged</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {totalFlaggedIssues}
          </div>
          <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 group-hover:text-rose-600 transition">
            <span>{highSeverityCount} high severity traps</span>
            <ChevronRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Deadlines Timeline Preview */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Upcoming Renewals & Due Dates (Next 30 Days)
            </h2>
          </div>
          <button
            onClick={onNavigateToDeadlines}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {upcomingDeadlinesList.map((dl) => {
            const due = new Date(dl.dueDate + 'T00:00:00Z');
            const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={dl.id}
                onClick={onNavigateToDeadlines}
                className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/50 dark:hover:bg-slate-800/40 px-2 rounded-xl transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      diffDays <= 5 ? 'bg-rose-500 animate-pulse' : 'bg-indigo-500'
                    }`}
                  />
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {dl.title}
                    </span>
                    <span className="text-[11px] text-slate-500">{dl.documentTitle}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 block">
                    {dl.dueDate}
                  </span>
                  <span
                    className={`text-[11px] font-semibold ${
                      diffDays <= 5 ? 'text-rose-600' : 'text-slate-400'
                    }`}
                  >
                    {diffDays <= 0 ? 'Due Today' : `in ${diffDays} days`}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Documents Quick Explainer Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Analyzed Documents
            </h2>
            <span className="text-xs text-slate-500">
              Tap any document to see its 10-second plain summary and grounded Q&A
            </span>
          </div>
          <button
            onClick={onNavigateToVault}
            className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
          >
            <span>All Documents</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {documents.slice(0, 3).map((doc) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 shadow-xs cursor-pointer transition flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase text-[10px]">
                    {doc.documentType.replace('_', ' ')}
                  </span>
                  <span>{doc.uploadDate}</span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 transition line-clamp-1">
                  {doc.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mt-2 leading-relaxed">
                  {doc.plainSummary[0] || doc.keyTakeaway}
                </p>
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {doc.redFlags.length > 0 ? (
                  <span className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>{doc.redFlags.length} Flagged</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-600 font-medium">Safe</span>
                )}

                <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition">
                  <span>Explain</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
