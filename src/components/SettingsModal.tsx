import React, { useState } from 'react';
import {
  X,
  User,
  Bell,
  Coins,
  Globe,
  Download,
  Trash2,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile, UserSettings, AppDocument, DeadlineItem, SubscriptionItem } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onUpdateUser: (user: Partial<UserProfile>) => void;
  onExportData: () => void;
  onDeleteAccount: () => void;
  onOpenUpgrade: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  settings,
  onUpdateSettings,
  onUpdateUser,
  onExportData,
  onDeleteAccount,
  onOpenUpgrade,
}) => {
  const [userName, setUserName] = useState(user.name);
  const [userEmail, setUserEmail] = useState(user.email);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({ name: userName, email: userEmail });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Settings & Preferences</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {/* 1. Profile & Membership Plan */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-600" />
                <span>Account Profile</span>
              </span>

              {user.plan === 'premium' ? (
                <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Premium Active</span>
                </span>
              ) : (
                <button
                  onClick={onOpenUpgrade}
                  className="text-amber-600 dark:text-amber-400 font-bold hover:underline"
                >
                  Upgrade to Premium ({settings.currency}149/mo) →
                </button>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-500 mb-1">Full Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Email</label>
                  <input
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400">
                  Documents parsed: {user.documentsUsedThisMonth} of {user.plan === 'free' ? user.maxMonthlyFreeDocs : '∞'}
                </span>
                <button
                  type="submit"
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
                >
                  {savedSuccess ? 'Saved!' : 'Save Profile'}
                </button>
              </div>
            </form>
          </div>

          {/* 2. Currency & Language */}
          <div className="space-y-3">
            <span className="font-bold text-slate-900 dark:text-white block">
              Regional & Language Preferences
            </span>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-500 mb-1">Preferred Currency</label>
                <select
                  value={settings.currency}
                  onChange={(e) => onUpdateSettings({ currency: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="₹">₹ INR (Indian Rupee)</option>
                  <option value="$">$ USD (US Dollar)</option>
                  <option value="€">€ EUR (Euro)</option>
                  <option value="£">£ GBP (British Pound)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 mb-1">Explanations Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => onUpdateSettings({ language: e.target.value as any })}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-xs text-slate-900 dark:text-white"
                >
                  <option value="en">English (Global)</option>
                  <option value="hi">हिन्दी (Hindi / Hinglish)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 3. Notification Timing & Delivery Channels */}
          <div className="space-y-3">
            <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span>Deadline Reminder Timing</span>
            </span>

            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2.5">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300">Alert at 30 days before cutoff</span>
                <input
                  type="checkbox"
                  checked={settings.remind30Days}
                  onChange={(e) => onUpdateSettings({ remind30Days: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300">Alert at 7 days before cutoff</span>
                <input
                  type="checkbox"
                  checked={settings.remind7Days}
                  onChange={(e) => onUpdateSettings({ remind7Days: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-slate-700 dark:text-slate-300">Alert at 1 day before cutoff</span>
                <input
                  type="checkbox"
                  checked={settings.remind1Day}
                  onChange={(e) => onUpdateSettings({ remind1Day: e.target.checked })}
                  className="rounded text-indigo-600 focus:ring-0"
                />
              </label>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <button
                type="button"
                onClick={() => onUpdateSettings({ inAppNotifications: !settings.inAppNotifications })}
                className={`p-2 rounded-xl border transition ${
                  settings.inAppNotifications
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-600'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                In-App
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ pushNotifications: !settings.pushNotifications })}
                className={`p-2 rounded-xl border transition ${
                  settings.pushNotifications
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-600'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                PWA Push
              </button>
              <button
                type="button"
                onClick={() => onUpdateSettings({ emailNotifications: !settings.emailNotifications })}
                className={`p-2 rounded-xl border transition ${
                  settings.emailNotifications
                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 font-semibold text-indigo-600'
                    : 'border-slate-200 text-slate-500'
                }`}
              >
                Email
              </button>
            </div>
          </div>

          {/* 4. Data Export & Account Actions */}
          <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="font-bold text-slate-900 dark:text-white block">
              Data Management & Privacy
            </span>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={onExportData}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Data (JSON)</span>
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-semibold transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Reset & Delete Account</span>
              </button>
            </div>
          </div>

          {/* Disclaimer Banner */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-500 leading-relaxed">
            <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">Legal Disclaimer:</span>
            Life Admin Autopilot is an AI-powered personal productivity and explainer tool. It does not provide certified legal, tax, or financial advice. Always verify crucial terms directly with your respective provider.
          </div>
        </div>

        {/* Delete Confirm Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto" />
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">Confirm Account Reset?</h4>
              <p className="text-xs text-slate-500">
                This will wipe your profile, all analyzed documents, and active deadlines from this browser.
              </p>
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onDeleteAccount();
                    setShowDeleteConfirm(false);
                    onClose();
                  }}
                  className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-semibold"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
