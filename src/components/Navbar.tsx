import React, { useState } from 'react';
import {
  ShieldCheck,
  Zap,
  Globe,
  Coins,
  User,
  ExternalLink,
  Info,
  CheckCircle2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { UserProfile, UserSettings } from '../types';
import { PWAInstallButton } from './PWAInstallButton';

interface NavbarProps {
  user: UserProfile;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onOpenAuth: () => void;
  onOpenSettings: () => void;
  onOpenUpgrade: () => void;
  onShowLanding: () => void;
  onOpenChat: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  settings,
  onUpdateSettings,
  onOpenAuth,
  onOpenSettings,
  onOpenUpgrade,
  onShowLanding,
  onOpenChat,
}) => {
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onShowLanding}
              className="flex items-center gap-2.5 text-left group"
              title="Return to Home / Overview"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div>
                <span className="font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5 text-sm sm:text-base">
                  Life Admin Autopilot
                </span>
                <span className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  Plain-language policies, bills & contracts
                </span>
              </div>
            </button>

            {/* Privacy Trust Badge */}
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs text-emerald-800 dark:text-emerald-300 hover:text-emerald-950 font-medium transition"
              title="Learn about our privacy promise"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Zero-Sale Privacy</span>
            </button>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Currency Selector */}
            <div className="relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-medium">
              <button
                onClick={() => onUpdateSettings({ currency: '₹' })}
                className={`px-2 py-1 rounded-md transition ${
                  settings.currency === '₹'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Indian Rupee"
              >
                ₹ INR
              </button>
              <button
                onClick={() => onUpdateSettings({ currency: '$' })}
                className={`px-2 py-1 rounded-md transition ${
                  settings.currency === '$'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="US Dollar"
              >
                $ USD
              </button>
            </div>

            {/* Language Selector */}
            <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-xs font-medium">
              <button
                onClick={() => onUpdateSettings({ language: 'en' })}
                className={`px-2 py-1 rounded-md transition ${
                  settings.language === 'en'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                EN
              </button>
              <button
                onClick={() => onUpdateSettings({ language: 'hi' })}
                className={`px-2 py-1 rounded-md transition ${
                  settings.language === 'hi'
                    ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-indigo-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                हिन्दी
              </button>
            </div>

            {/* Ask Copilot Button */}
            <button
              onClick={onOpenChat}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 font-semibold text-xs transition border border-indigo-200/60 dark:border-indigo-800"
              title="Open Gemini Legal & Policy Copilot"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden sm:inline">Ask Copilot</span>
              <span className="sm:hidden">Copilot</span>
            </button>

            {/* PWA Install */}
            <PWAInstallButton />

            {/* Plan indicator */}
            {user.plan === 'free' ? (
              <button
                onClick={onOpenUpgrade}
                className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:text-amber-300 hover:opacity-80 transition"
              >
                <span>Free Plan</span>
                <span className="text-[10px] text-amber-600">({user.documentsUsedThisMonth}/{user.maxMonthlyFreeDocs})</span>
              </button>
            ) : (
              <button
                onClick={onOpenUpgrade}
                className="hidden md:flex items-center gap-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300"
              >
                <Zap className="w-3.5 h-3.5 fill-current" />
                <span>Premium Active</span>
              </button>
            )}

            {/* User Profile */}
            <button
              onClick={onOpenSettings}
              className="flex items-center gap-2 p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
              title="Account & Settings"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden xl:inline text-xs font-medium text-slate-700 dark:text-slate-200 max-w-[120px] truncate">
                {user.name}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Privacy Promise Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Our Privacy Guarantee</h3>
                <p className="text-xs text-slate-500">Your documents are strictly private</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">Client & Server Pre-Redaction: </span>
                  Credit card numbers, Aadhaar/SSN IDs, and bank account sequences are redacted before any AI processing.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">Zero Data Selling: </span>
                  We do not sell, rent, or monetize your documents or financial behavior to insurers, advertisers, or third parties.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">Instant Data Deletion: </span>
                  You can purge individual documents or tap "Delete Everything" in the Vault to permanently wipe all stored data at any second.
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">Disclaimer: </span>
                  This tool provides plain-language explanations and administrative reminders. It does not replace certified legal, tax, or actuarial advice.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold hover:opacity-90 transition"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </>
  );
};
