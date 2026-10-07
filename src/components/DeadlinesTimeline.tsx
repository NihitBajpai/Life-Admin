import React, { useState } from 'react';
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  Clock,
  Bell,
  BellRing,
  RotateCcw,
  Trash2,
  AlertCircle,
  Sparkles,
  Send,
  Check,
  Calendar,
} from 'lucide-react';
import { DeadlineItem, UserSettings } from '../types';
import { triggerReminderNotification } from '../services/api';

interface DeadlinesTimelineProps {
  deadlines: DeadlineItem[];
  onToggleComplete: (id: string) => void;
  onSnooze: (id: string, days: number) => void;
  onDeleteDeadline: (id: string) => void;
  onAddDeadline: (item: Omit<DeadlineItem, 'id'>) => void;
  onUpdateDeadline: (id: string, updates: Partial<DeadlineItem>) => void;
  settings: UserSettings;
}

export const DeadlinesTimeline: React.FC<DeadlinesTimelineProps> = ({
  deadlines,
  onToggleComplete,
  onSnooze,
  onDeleteDeadline,
  onAddDeadline,
  onUpdateDeadline,
  settings,
}) => {
  const [filter, setFilter] = useState<'30days' | '60days' | 'all' | 'completed'>('30days');
  const [showAddModal, setShowAddModal] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  // New deadline form state
  const [newTitle, setNewTitle] = useState('');
  const [newDueDate, setNewDueDate] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDocTitle, setNewDocTitle] = useState('Manual Entry');
  const [newUrgency, setNewUrgency] = useState<'high' | 'medium' | 'low'>('high');

  // Filter deadlines by date logic
  const now = new Date('2026-10-07T00:00:00Z'); // using synchronized current time
  const filteredDeadlines = deadlines.filter((item) => {
    if (filter === 'completed') return item.completed;
    if (item.completed) return false;

    const due = new Date(item.dueDate + 'T00:00:00Z');
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (filter === '30days') return diffDays <= 30;
    if (filter === '60days') return diffDays <= 60;
    return true;
  });

  const handleTestDispatch = async (item: DeadlineItem) => {
    try {
      setDispatchStatus(`Testing delivery for "${item.title}"...`);
      const res = await triggerReminderNotification({
        title: item.title,
        dueDate: item.dueDate,
        urgency: item.urgency,
        channel: 'in_app',
      });
      onUpdateDeadline(item.id, { lastDeliveryStatus: 'Delivered' });
      setDispatchStatus(`✅ ${res.message} (Delivery Ref: ${res.deliveryId})`);
      setTimeout(() => setDispatchStatus(null), 4000);
    } catch (err: any) {
      setDispatchStatus(`Failed to send test notification: ${err.message}`);
    }
  };

  const handleCreateDeadline = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDueDate) return;

    onAddDeadline({
      title: newTitle,
      dueDate: newDueDate,
      description: newDescription || 'Custom reminder set by user.',
      documentTitle: newDocTitle || 'Manual Entry',
      urgency: newUrgency,
      completed: false,
      remindAt30Days: true,
      remindAt7Days: true,
      remindAt1Day: true,
      lastDeliveryStatus: 'Scheduled',
    });

    setNewTitle('');
    setNewDueDate('');
    setNewDescription('');
    setShowAddModal(false);
  };

  const getUrgencyBadge = (urgency: 'high' | 'medium' | 'low') => {
    switch (urgency) {
      case 'high':
        return 'text-rose-700 dark:text-rose-400 font-semibold';
      case 'medium':
        return 'text-amber-700 dark:text-amber-400 font-semibold';
      default:
        return 'text-blue-700 dark:text-blue-400 font-medium';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-indigo-600" />
            <span>Deadlines & Reminder Engine</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-extracted from your policies and contracts. Never get hit with a late fee or surprise auto-renewal.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Deadline</span>
        </button>
      </div>

      {/* Dispatch notification test banner */}
      {dispatchStatus && (
        <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200 text-xs flex items-center justify-between animate-in fade-in">
          <span>{dispatchStatus}</span>
          <button onClick={() => setDispatchStatus(null)} className="text-indigo-500 hover:text-indigo-700 text-xs font-bold">
            ✕
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium overflow-x-auto">
        <button
          onClick={() => setFilter('30days')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            filter === '30days'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Next 30 Days
        </button>
        <button
          onClick={() => setFilter('60days')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            filter === '60days'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Next 60 Days
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            filter === 'all'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          All Deadlines ({deadlines.filter((d) => !d.completed).length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition ${
            filter === 'completed'
              ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          Completed ({deadlines.filter((d) => d.completed).length})
        </button>
      </div>

      {/* Deadlines Timeline List */}
      <div className="space-y-3">
        {filteredDeadlines.length === 0 ? (
          <div className="p-10 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 text-xs">
            No deadlines found for this timeframe. Upload a document or tap "Add Custom Deadline" above.
          </div>
        ) : (
          filteredDeadlines.map((item) => {
            const due = new Date(item.dueDate + 'T00:00:00Z');
            const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            return (
              <div
                key={item.id}
                className={`p-4 rounded-2xl border transition bg-white dark:bg-slate-900 ${
                  item.completed
                    ? 'border-slate-200 dark:border-slate-800 opacity-60'
                    : diffDays <= 5
                    ? 'border-rose-200 dark:border-rose-900/60 shadow-xs'
                    : 'border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onToggleComplete(item.id)}
                      className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition ${
                        item.completed
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-700 hover:border-indigo-600'
                      }`}
                      title={item.completed ? 'Mark as incomplete' : 'Mark as done'}
                    >
                      {item.completed && <Check className="w-4 h-4 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.documentTitle}
                        </span>
                        <span>·</span>
                        <span className={getUrgencyBadge(item.urgency)}>{item.urgency} urgency</span>
                        {item.daysNoticeRequired ? (
                          <>
                            <span>·</span>
                            <span>{item.daysNoticeRequired}d notice required</span>
                          </>
                        ) : null}
                      </div>

                      <h3
                        className={`text-sm font-bold mt-1 ${
                          item.completed
                            ? 'line-through text-slate-400'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Reminder Intervals Checklist */}
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] text-slate-500">
                        <span className="font-medium">Active alerts:</span>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.remindAt30Days}
                            onChange={(e) =>
                              onUpdateDeadline(item.id, { remindAt30Days: e.target.checked })
                            }
                            className="rounded text-indigo-600 focus:ring-0"
                          />
                          <span>30d before</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.remindAt7Days}
                            onChange={(e) =>
                              onUpdateDeadline(item.id, { remindAt7Days: e.target.checked })
                            }
                            className="rounded text-indigo-600 focus:ring-0"
                          />
                          <span>7d before</span>
                        </label>
                        <label className="flex items-center gap-1 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.remindAt1Day}
                            onChange={(e) =>
                              onUpdateDeadline(item.id, { remindAt1Day: e.target.checked })
                            }
                            className="rounded text-indigo-600 focus:ring-0"
                          />
                          <span>1d before</span>
                        </label>

                        <span className="text-slate-400">·</span>
                        <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                          <BellRing className="w-3 h-3 text-emerald-500" />
                          <span>Status: {item.lastDeliveryStatus || 'Scheduled'}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Due Date & Action Buttons */}
                  <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{item.dueDate}</span>
                      </div>
                      <div
                        className={`text-[11px] font-semibold mt-0.5 ${
                          diffDays < 0
                            ? 'text-slate-400'
                            : diffDays <= 3
                            ? 'text-rose-600 font-bold animate-pulse'
                            : diffDays <= 14
                            ? 'text-amber-600'
                            : 'text-indigo-600'
                        }`}
                      >
                        {diffDays < 0 ? 'Overdue' : diffDays === 0 ? 'Due Today!' : `in ${diffDays} days`}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleTestDispatch(item)}
                        className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 text-[11px] text-slate-700 dark:text-slate-300 font-medium transition"
                        title="Simulate push / in-app notification dispatch"
                      >
                        Test Alert
                      </button>
                      <button
                        onClick={() => onSnooze(item.id, 3)}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white"
                        title="Snooze 3 days"
                      >
                        <Clock className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteDeadline(item.id)}
                        className="p-1 rounded-md text-slate-400 hover:text-rose-600"
                        title="Delete deadline"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Custom Deadline Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Add Custom Life Admin Deadline
            </h3>
            <form onSubmit={handleCreateDeadline} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Reminder Title
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Broadband contract renewal / Car insurance due"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Urgency
                  </label>
                  <select
                    value={newUrgency}
                    onChange={(e) => setNewUrgency(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="high">High Urgency</option>
                    <option value="medium">Medium Urgency</option>
                    <option value="low">Low Urgency</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Document / Service Reference
                </label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. JioFiber / Star Health / Landlord agreement"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notes & Action Guidance
                </label>
                <textarea
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g. Give 15 days notice to avoid extra month liability"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Save Deadline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
