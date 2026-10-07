import React from 'react';
import { X, CheckCircle2, Zap, ShieldCheck } from 'lucide-react';
import { UserProfile, UserSettings } from '../types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  settings: UserSettings;
  onPlanUpdated: (plan: 'free' | 'premium') => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  user,
  settings,
  onPlanUpdated,
}) => {
  if (!isOpen) return null;

  const isPremium = user.plan === 'premium';
  const priceDisplay = settings.currency === '₹' ? '₹149' : '$4.99';

  const handleTogglePlan = () => {
    if (isPremium) {
      onPlanUpdated('free');
    } else {
      onPlanUpdated('premium');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-600 fill-current" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {isPremium ? 'Your Premium Membership' : 'Upgrade to Autopilot Premium'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          <div className="text-center py-2 space-y-1">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {priceDisplay}
              <span className="text-xs font-normal text-slate-400">/month</span>
            </div>
            <p className="text-slate-500">
              One caught late fee or auto-renewal pays for an entire year of Autopilot.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2.5">
            <div className="font-bold text-indigo-950 dark:text-indigo-200">
              Everything in Premium includes:
            </div>
            <ul className="space-y-2 text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Unlimited document uploads</strong> (PDFs, paper photos, policies)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Bank statement & transactions watchdog</strong> for hidden hikes</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>1-Tap AI Action Assistant:</strong> Ready-to-send dispute & cancellation drafts</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span><strong>Multi-channel deadline alerts:</strong> 30, 7, and 1-day reminders</span>
              </li>
            </ul>
          </div>

          <button
            onClick={handleTogglePlan}
            className={`w-full py-3 rounded-xl font-bold text-xs transition shadow-md ${
              isPremium
                ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25'
            }`}
          >
            {isPremium ? 'Switch Back to Free Starter' : `Activate Premium for ${priceDisplay}/month`}
          </button>
        </div>
      </div>
    </div>
  );
};
