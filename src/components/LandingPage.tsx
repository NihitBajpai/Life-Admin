import React, { useState } from 'react';
import {
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  CalendarClock,
  Sparkles,
  FilePenLine,
  HelpCircle,
  TrendingUp,
  Download,
  Receipt,
  FileText,
  AlertTriangle,
} from 'lucide-react';
import { UserSettings } from '../types';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenUpgrade: () => void;
  settings: UserSettings;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterApp,
  onOpenUpgrade,
  settings,
}) => {
  const [waitlistEmail, setWaitlistEmail] = useState('');
  const [waitlistJoined, setWaitlistJoined] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (waitlistEmail.trim()) {
      setWaitlistJoined(true);
      setTimeout(() => setWaitlistJoined(false), 5000);
      setWaitlistEmail('');
    }
  };

  const faqs = [
    {
      q: 'Is this legally binding advice or an explainer tool?',
      a: 'Life Admin Autopilot is an AI-powered document explainer and consumer productivity assistant. It translates confusing corporate text into plain language, flags hidden traps, and sets calendar reminders. It does not replace certified legal or actuarial counsel.',
    },
    {
      q: 'How does client-side and server-side redaction protect my privacy?',
      a: 'Before any text reaches our language model, sensitive identifiers like 16-digit credit cards, Indian PAN/Aadhaar IDs, and US SSNs are masked automatically. We never sell your personal data to insurance brokers or advertisers.',
    },
    {
      q: 'Can I scan bills with my smartphone camera?',
      a: 'Yes! Life Admin Autopilot is a mobile-first Progressive Web App (PWA). You can tap "Camera" on any phone to photograph a paper policy, broadband invoice, or rental agreement and get an instant breakdown in 10 seconds.',
    },
    {
      q: 'How do the deadline reminders work?',
      a: 'The engine extracts due dates, cancellation cutoff dates, and notice requirements directly from your document clauses. You can receive in-app alerts, email notifications, and mobile push notifications at 30, 7, and 1 day before.',
    },
  ];

  return (
    <div className="space-y-16 py-8 px-4 sm:px-6 max-w-6xl mx-auto animate-in fade-in duration-300">
      {/* 1. Hero Section */}
      <section className="text-center space-y-6 max-w-3xl mx-auto pt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Mobile-First PWA · AI Document Radar</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
          Understand every bill, policy and contract in{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-400">
            10 seconds.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          People don't read insurance fine print, phone bills, or lease agreements — so they overpay, miss cancellation deadlines, and get hit by sneaky hidden fees.
          Life Admin Autopilot turns confusing paperwork into crystal-clear plain English.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Launch Autopilot App</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="#how-it-works"
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition text-center"
          >
            How It Works
          </a>
        </div>

        {/* Live Social Proof / Metrics */}
        <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pre-seeded with 3 realistic contracts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero-Sale Privacy Guarantee</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Installable as Native PWA</span>
          </div>
        </div>
      </section>

      {/* 2. 3-Step How It Works */}
      <section id="how-it-works" className="space-y-8 scroll-mt-20">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            How It Works
          </h2>
          <p className="text-xs text-slate-500">
            From confusing corporate paperwork to crystal clear action in 3 steps
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 flex items-center justify-center font-bold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Snap or Upload
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Upload a PDF or snap a photo with your mobile camera. Private numbers like credit cards and national IDs are masked before processing.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 flex items-center justify-center font-bold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Understand in 10 Sec
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Receive an exact 5-line plain summary, structured key facts, an exclusions list, and flagged traps rated by financial severity.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-indigo-700 flex items-center justify-center font-bold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Never Miss a Deadline
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Renewals, cancellation notice cutoffs, and dispute letters are automated with timely 30, 7, and 1-day reminders.
            </p>
          </div>
        </div>
      </section>

      {/* 3. Features Grid */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Designed for the Paperwork You Hate Most
          </h2>
          <p className="text-xs text-slate-500">
            For young professionals, busy families, freelancers, and students
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Red Flag & Hidden Fee Hunter
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Catch room-rent capping, proportional deductions, unrequested gaming packs, and 1-month painting penalties before you sign or pay.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
              <CalendarClock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Deadline & Reminder Engine
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Auto-extracts notice periods (like 60-day lease move-out deadlines) so you never forfeit security deposits or lose No-Claim bonuses.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Subscription Watchdog
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Audit bank statements to discover ghost subscriptions, duplicate cloud storage, and silent post-promo price increases.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <FilePenLine className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              1-Tap AI Action Assistant
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Generates ready-to-send dispute letters, cancellation emails, and refund claims backed by consumer protection leverage points.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Grounded Document Q&A
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Ask anything about your contract with strict grounding. If a condition isn't in the text, the AI will explicitly tell you.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">
              Privacy First & Local Storage
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Your documents are kept private on your device. Easily purge everything anytime with our 1-click Delete Everything button.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Privacy Promise Section */}
      <section className="rounded-2xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-emerald-950 dark:text-emerald-100">
              Our Ironclad Privacy Promise
            </h3>
            <p className="text-xs text-emerald-800 dark:text-emerald-300">
              We know contracts contain private financial details. Here is how we protect you:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-emerald-900 dark:text-emerald-200 pt-2">
          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">Pre-Redaction Engine</span>
            <span>Credit card numbers, bank account sequences, and national IDs are masked before processing.</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">Zero Data Selling</span>
            <span>We never sell or distribute your document information to brokers, insurers, or data vendors.</span>
          </div>

          <div className="p-3.5 rounded-xl bg-white/70 dark:bg-slate-900/80 border border-emerald-100 dark:border-emerald-900/40 space-y-1">
            <span className="font-bold text-slate-900 dark:text-white block">Total Data Deletion</span>
            <span>A single tap on "Delete Everything" wipes all documents, deadlines, and history from your browser.</span>
          </div>
        </div>
      </section>

      {/* 5. Pricing Table */}
      <section className="space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
            Transparent, Simple Pricing
          </h2>
          <p className="text-xs text-slate-500">
            Save more on your first caught fine print trap than the cost of a full year
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {/* Free Tier */}
          <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-4">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Free Starter</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {settings.currency} 0
              </div>
              <span className="text-xs text-slate-400">Free forever for basic personal admin</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>3 document explanations per month</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Basic deadline calendar reminders</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>10-second plain language summaries</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Camera scan & PDF upload</span>
              </li>
            </ul>

            <button
              onClick={onEnterApp}
              className="w-full py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-xs text-slate-800 dark:text-white transition"
            >
              Get Started Free
            </button>
          </div>

          {/* Premium Tier */}
          <div className="p-6 rounded-2xl border-2 border-indigo-600 bg-white dark:bg-slate-900 shadow-xl space-y-4 relative">
            <div className="absolute -top-3 right-5 px-3 py-0.5 rounded-full bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider">
              Most Popular
            </div>

            <div>
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Premium Autopilot</span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
                {settings.currency} {settings.currency === '₹' ? '149' : '4.99'}
                <span className="text-xs font-normal text-slate-400">/month</span>
              </div>
              <span className="text-xs text-slate-400">Cancel anytime with 1 tap</span>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-900 dark:text-white">Unlimited document analyses</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Bank statement & transactions watchdog</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>1-Tap Action Assistant (dispute & refund drafts)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Priority multi-channel deadline alerts (In-App, Push, Email)</span>
              </li>
            </ul>

            <button
              onClick={onOpenUpgrade}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-semibold text-xs text-white shadow-md transition"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      </section>

      {/* 6. FAQ Section */}
      <section className="space-y-6 max-w-2xl mx-auto">
        <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h2>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs space-y-1.5"
            >
              <h4 className="font-bold text-slate-900 dark:text-white">{faq.q}</h4>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7. Waitlist / Quick Launch CTA */}
      <section className="p-8 rounded-2xl bg-gradient-to-tr from-slate-900 to-indigo-950 text-white text-center space-y-4 max-w-3xl mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold">
          Take Back Control of Your Life Admin Today
        </h3>
        <p className="text-xs text-slate-300 max-w-md mx-auto">
          Join thousands of young professionals and families who never miss another renewal or pay an unverified fee.
        </p>

        <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row items-center justify-center gap-2 max-w-md mx-auto pt-2">
          <input
            type="email"
            value={waitlistEmail}
            onChange={(e) => setWaitlistEmail(e.target.value)}
            placeholder="Enter your email for monthly tips..."
            className="w-full sm:flex-1 rounded-xl bg-white/10 border border-white/20 px-3.5 py-2.5 text-xs text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-400"
          />
          <button
            type="submit"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white text-indigo-950 font-bold text-xs hover:bg-indigo-50 transition shrink-0"
          >
            {waitlistJoined ? 'Joined!' : 'Join Updates'}
          </button>
        </form>

        <div className="pt-2">
          <button
            onClick={onEnterApp}
            className="text-xs text-indigo-300 hover:text-white font-semibold underline underline-offset-4"
          >
            Or open the app now with sample documents →
          </button>
        </div>
      </section>
    </div>
  );
};
