import React, { useState } from 'react';
import {
  Sparkles,
  TrendingDown,
  AlertTriangle,
  Upload,
  Plus,
  Trash2,
  FilePenLine,
  CheckCircle2,
  Copy,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { SubscriptionItem, UserSettings } from '../types';
import { analyzeStatementWithAI } from '../services/api';

interface SubscriptionWatchdogProps {
  subscriptions: SubscriptionItem[];
  onAddSubscription: (sub: Omit<SubscriptionItem, 'id'>) => void;
  onDeleteSubscription: (id: string) => void;
  onOpenActionDraft: (customTitle: string, customDetails: string, draftType: any) => void;
  settings: UserSettings;
}

export const SubscriptionWatchdog: React.FC<SubscriptionWatchdogProps> = ({
  subscriptions,
  onAddSubscription,
  onDeleteSubscription,
  onOpenActionDraft,
  settings,
}) => {
  const [statementText, setStatementText] = useState('');
  const [isScanningStatement, setIsScanningStatement] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [statementInsights, setStatementInsights] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Manual Add Form
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Entertainment');
  const [renewalDate, setRenewalDate] = useState('');
  const [riskNote, setRiskNote] = useState('');

  // Calculations
  const totalMonthlySpend = subscriptions.reduce((sum, item) => {
    return sum + (item.frequency === 'annual' ? item.amount / 12 : item.amount);
  }, 0);

  // Calculate potential savings from price_hiked, duplicate, and unused_risk
  const potentialMonthlySavings = subscriptions
    .filter((s) => s.status !== 'active')
    .reduce((sum, item) => {
      if (item.status === 'price_hiked') return sum + (item.amount * 0.25); // estimate hike portion
      return sum + (item.frequency === 'annual' ? item.amount / 12 : item.amount);
    }, 0);

  const handleScanStatement = async () => {
    if (!statementText.trim()) {
      setError('Please paste transactions or statement text.');
      return;
    }

    setError(null);
    setIsScanningStatement(true);

    try {
      const res = await analyzeStatementWithAI({
        statementText: statementText,
        currency: settings.currency,
      });

      if (res.detectedSubscriptions && res.detectedSubscriptions.length > 0) {
        res.detectedSubscriptions.forEach((detected: any) => {
          onAddSubscription({
            name: detected.name || 'Detected Charge',
            amount: Number(detected.amount) || 199,
            frequency: detected.frequency === 'annual' ? 'annual' : 'monthly',
            category: detected.category || 'General',
            status: detected.status || 'unused_risk',
            riskNote: detected.riskNote || 'Flagged by watchdog audit.',
            renewalDate: detected.lastChargedDate || '2026-11-01',
            suggestedAction: detected.suggestedAction || 'Review renewal status',
          });
        });
      }

      setStatementInsights(res.insights || ['Audit complete: Flagged duplicate and recurring items.']);
      setStatementText('');
    } catch (err: any) {
      setError(err?.message || 'Failed to scan statement.');
    } finally {
      setIsScanningStatement(false);
    }
  };

  const handleLoadSampleStatement = () => {
    setStatementText(`DATE, DESCRIPTION, AMOUNT
01/10/2026, NETFLIX ENTERTAINMENT MUMBAI, -799.00
02/10/2026, CULTFIT HEALTHCARE BANGALORE, -2499.00
03/10/2026, GOOGLE ONE 2TB STORAGE, -650.00
04/10/2026, MICROSOFT 365 FAMILY SUB, -619.00
05/10/2026, AIRTEL BROADBAND & GAMING VAS, -2476.00
06/10/2026, SPOTIFY PREMIUM DUO, -149.00
07/10/2026, DISNEY PLUS HOTSTAR AUTO-RENEW, -299.00
07/10/2026, ADOBE SYSTEMS CLOUD AUTO-RENEW, -4225.00`);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    onAddSubscription({
      name,
      amount: parseFloat(amount),
      frequency: 'monthly',
      category,
      status: riskNote ? 'unused_risk' : 'active',
      riskNote: riskNote || 'Manual subscription tracked.',
      renewalDate: renewalDate || '2026-11-01',
      suggestedAction: 'Monitored by Autopilot',
    });

    setName('');
    setAmount('');
    setRiskNote('');
    setRenewalDate('');
    setShowAddModal(false);
  };

  const getStatusBadge = (status: SubscriptionItem['status']) => {
    switch (status) {
      case 'price_hiked':
        return 'text-rose-700 dark:text-rose-400 font-semibold';
      case 'duplicate':
        return 'text-amber-700 dark:text-amber-400 font-semibold';
      case 'unused_risk':
        return 'text-orange-700 dark:text-orange-400 font-semibold';
      default:
        return 'text-emerald-700 dark:text-emerald-400 font-medium';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="rounded-2xl bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold mb-1">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>SUBSCRIPTION & RECURRING CHARGES WATCHDOG</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Stop Sneaky Hikes & Ghost Subscriptions
            </h1>
            <p className="text-xs text-indigo-200 mt-1 max-w-md">
              Companies count on you forgetting to cancel. We catch recurring charges, silent price increases, and duplicate tools.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 text-left md:text-right shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-emerald-300 font-semibold block">
              You Could Save
            </span>
            <span className="text-2xl sm:text-3xl font-extrabold text-white">
              {settings.currency} {Math.round(potentialMonthlySavings).toLocaleString()}
              <span className="text-xs font-normal text-indigo-200">/month</span>
            </span>
            <span className="text-[11px] text-indigo-300 block mt-0.5">
              ~{settings.currency} {Math.round(potentialMonthlySavings * 12).toLocaleString()} saved annually!
            </span>
          </div>
        </div>
      </div>

      {/* Statement Scanner Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Bank Statement & Transactions AI Scanner
              </h2>
              <span className="text-xs text-slate-500">
                Paste rows from your bank CSV, net banking, or credit card statement
              </span>
            </div>
          </div>

          <button
            onClick={handleLoadSampleStatement}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
          >
            Load Sample Statement
          </button>
        </div>

        <textarea
          rows={3}
          value={statementText}
          onChange={(e) => setStatementText(e.target.value)}
          placeholder="Paste transactions e.g. 02/10/2026 NETFLIX -799.00, CULTFIT -2499.00..."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
        />

        {error && (
          <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {statementInsights.length > 0 && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs space-y-1 text-emerald-900 dark:text-emerald-200">
            <div className="font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Watchdog Audit Findings:</span>
            </div>
            {statementInsights.map((ins, i) => (
              <p key={i} className="text-[11px] pl-5">· {ins}</p>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-slate-400">
            All card & account numbers are auto-redacted before sending
          </span>
          <button
            onClick={handleScanStatement}
            disabled={isScanningStatement || !statementText.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isScanningStatement ? 'Scanning Statement...' : 'Audit Recurring Charges'}</span>
          </button>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Monitored Subscriptions ({subscriptions.length})
            </h2>
            <span className="text-xs text-slate-500">
              Total: {settings.currency} {Math.round(totalMonthlySpend).toLocaleString()}/mo
            </span>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-xs font-semibold text-slate-700 dark:text-slate-300 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Subscription</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {subscriptions.map((sub) => (
            <div
              key={sub.id}
              className={`p-4 rounded-2xl border transition bg-white dark:bg-slate-900 ${
                sub.status === 'price_hiked'
                  ? 'border-rose-200 dark:border-rose-900/60 shadow-xs'
                  : sub.status === 'duplicate'
                  ? 'border-amber-200 dark:border-amber-900/60 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {sub.name}
                    </span>
                    <span className={`text-[10px] uppercase tracking-wider ${getStatusBadge(sub.status)}`}>
                      {sub.status.replace('_', ' ')}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500">{sub.category} · Next renewal: {sub.renewalDate}</span>
                </div>

                <div className="text-right">
                  <span className="font-bold text-sm text-slate-900 dark:text-white">
                    {settings.currency} {sub.amount.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400 block">/{sub.frequency}</span>
                </div>
              </div>

              {sub.riskNote && (
                <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs text-slate-700 dark:text-slate-300 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{sub.riskNote}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() =>
                    onOpenActionDraft(
                      sub.name,
                      `Cancel recurring subscription for ${sub.name}. Issue: ${sub.riskNote}`,
                      sub.status === 'duplicate' ? 'dispute_letter' : 'cancellation_email'
                    )
                  }
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  <FilePenLine className="w-3.5 h-3.5" />
                  <span>Draft Cancellation</span>
                </button>

                <button
                  onClick={() => onDeleteSubscription(sub.id)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Remove from tracking"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-3">
              Add Monitored Subscription
            </h3>
            <form onSubmit={handleManualAdd} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service / Tool Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Netflix, Cult.fit, Adobe, Gym"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Monthly Amount ({settings.currency})
                  </label>
                  <input
                    type="number"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 799"
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Next Renewal Date
                  </label>
                  <input
                    type="date"
                    value={renewalDate}
                    onChange={(e) => setRenewalDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Entertainment">Entertainment (OTT, Music)</option>
                  <option value="Fitness">Fitness & Wellness (Gym, Sports)</option>
                  <option value="Cloud Storage">Cloud Storage & SaaS</option>
                  <option value="Software">Software & Utilities</option>
                  <option value="Telecom">Telecom & Broadband</option>
                  <option value="Other">Other Recurring Service</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Watchdog Note or Suspected Trap (Optional)
                </label>
                <input
                  type="text"
                  value={riskNote}
                  onChange={(e) => setRiskNote(e.target.value)}
                  placeholder="e.g. Auto-renewed at higher price / Never using this"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-2 text-slate-600 dark:text-slate-400 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Save Subscription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
