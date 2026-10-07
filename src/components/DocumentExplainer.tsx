import React, { useState } from 'react';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Sparkles,
  Send,
  HelpCircle,
  ShieldAlert,
  ArrowLeft,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  FilePenLine,
  TrendingUp,
  Lock,
} from 'lucide-react';
import { AppDocument, UserSettings } from '../types';
import { askDocumentQuestionWithAI } from '../services/api';

interface DocumentExplainerProps {
  document: AppDocument;
  onBack: () => void;
  onOpenActionDraft: (doc: AppDocument, defaultType?: any) => void;
  onAddDeadlineToTracker: (doc: AppDocument) => void;
  settings: UserSettings;
}

export const DocumentExplainer: React.FC<DocumentExplainerProps> = ({
  document,
  onBack,
  onOpenActionDraft,
  onAddDeadlineToTracker,
  settings,
}) => {
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState<Array<{ q: string; a: string; time: string }>>([
    {
      q: 'What is the most dangerous clause in this document?',
      a: document.redFlags.length > 0
        ? `The biggest risk is "${document.redFlags[0].title}": ${document.redFlags[0].explanation}`
        : 'No high-risk clauses were flagged in this document.',
      time: 'Just now',
    },
  ]);
  const [isAsking, setIsAsking] = useState(false);
  const [copiedQuote, setCopiedQuote] = useState<string | null>(null);

  const handleAskQuestion = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!question.trim() || isAsking) return;

    const currentQ = question;
    setQuestion('');
    setIsAsking(true);

    // Build context string from document data
    const docContext = `Document: ${document.title}
Provider: ${document.providerName}
Summary: ${document.plainSummary.join('\n')}
Key Facts:
Amounts: ${document.keyFacts.amounts.join(', ')}
Dates: ${document.keyFacts.dates.join(', ')}
Coverage: ${document.keyFacts.coverage.join(', ')}
Limits: ${document.keyFacts.limits.join(', ')}
Penalties: ${document.keyFacts.penalties.join(', ')}
Notice Periods: ${document.keyFacts.noticePeriods.join(', ')}
Exclusions / Not Covered: ${document.notCovered.join(', ')}
Red Flags:
${document.redFlags.map((rf) => `- ${rf.title} (${rf.severity}): ${rf.explanation} [Quote: ${rf.clauseQuote || 'N/A'}]`).join('\n')}
Raw Extracted Content:
${document.rawTextPreview || ''}`;

    try {
      const answer = await askDocumentQuestionWithAI({
        documentTitle: document.title,
        documentContext: docContext,
        question: currentQ,
      });

      setQaHistory((prev) => [
        ...prev,
        {
          q: currentQ,
          a: answer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err: any) {
      setQaHistory((prev) => [
        ...prev,
        {
          q: currentQ,
          a: 'Error retrieving answer: ' + (err?.message || 'Connection failure'),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsAsking(false);
    }
  };

  const copyClause = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuote(text);
    setTimeout(() => setCopiedQuote(null), 2000);
  };

  const getSeverityBadge = (severity: 'low' | 'medium' | 'high') => {
    switch (severity) {
      case 'high':
        return 'text-rose-700 dark:text-rose-400 font-semibold';
      case 'medium':
        return 'text-amber-700 dark:text-amber-400 font-semibold';
      default:
        return 'text-blue-700 dark:text-blue-400 font-medium';
    }
  };

  const suggestedQuestions = [
    'What happens if I miss the deadline?',
    'Are there any penalties or hidden fees?',
    'What is NOT covered under this contract?',
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenActionDraft(document)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-semibold transition"
          >
            <FilePenLine className="w-3.5 h-3.5" />
            <span>Draft Action Letter</span>
          </button>
        </div>
      </div>

      {/* Document Header Card */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider text-[10px]">
                {document.documentType.replace('_', ' ')}
              </span>
              <span>·</span>
              <span>{document.providerName}</span>
              <span>·</span>
              <span>Uploaded {document.uploadDate}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              {document.title}
            </h1>
          </div>

          {document.estimatedSavingsPotential ? (
            <div className="sm:text-right shrink-0">
              <div className="text-[11px] text-slate-500 font-medium">Potential Savings Identified</div>
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {settings.currency} {document.estimatedSavingsPotential.toLocaleString()}
              </div>
            </div>
          ) : null}
        </div>

        {document.keyTakeaway && (
          <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">Bottom Line: </span>
            {document.keyTakeaway}
          </div>
        )}
      </div>

      {/* 1. 5-Line Plain-Language Summary */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              5-Line Plain-Language Summary
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">No corporate legal jargon</span>
        </div>

        <div className="space-y-3">
          {document.plainSummary.map((line, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{line}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Red Flags & Hidden Traps (Crucial!) */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Flagged Risks & Sneaky Traps ({document.redFlags.length})
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">Severity ratings based on financial harm</span>
        </div>

        {document.redFlags.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Zero critical traps or red flags detected in this document.</span>
          </div>
        ) : (
          <div className="space-y-3">
            {document.redFlags.map((flag, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {flag.title}
                  </span>
                  <span className={`text-xs capitalize ${getSeverityBadge(flag.severity)}`}>
                    {flag.severity} Risk
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {flag.explanation}
                </p>

                {flag.clauseQuote && (
                  <div className="p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-400 flex items-start justify-between gap-2">
                    <span className="line-clamp-2">"{flag.clauseQuote}"</span>
                    <button
                      onClick={() => copyClause(flag.clauseQuote || '')}
                      className="text-slate-400 hover:text-slate-600 shrink-0 p-1"
                      title="Copy clause quote"
                    >
                      {copiedQuote === flag.clauseQuote ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Key Facts Grid */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">
          Structured Key Facts
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Amounts */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white block mb-2">Amounts & Deductibles</span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300">
              {document.keyFacts.amounts.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-indigo-500">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dates & Deadlines */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white block mb-2">Dates & Renewal Timelines</span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300">
              {document.keyFacts.dates.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-indigo-500">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Coverage & Inclusions */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white block mb-2">Coverage & Benefits</span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300">
              {document.keyFacts.coverage.map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-emerald-500">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Limits & Notice Periods */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-900 dark:text-white block mb-2">Limits & Notice Periods</span>
            <ul className="space-y-1 text-slate-600 dark:text-slate-300">
              {document.keyFacts.limits.concat(document.keyFacts.noticePeriods).map((item, i) => (
                <li key={i} className="flex items-start gap-1.5">
                  <span className="text-amber-500">·</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 4. What is NOT Covered / Watch Outs */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600" />
          <span>What's NOT Covered / Watch Out For</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {document.notCovered.map((item, i) => (
            <div
              key={i}
              className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-amber-900 dark:text-amber-200 flex items-start gap-2"
            >
              <span className="font-bold text-amber-600">✕</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Suggested Actions */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3">
          Recommended Next Steps
        </h2>
        <div className="space-y-2.5">
          {document.suggestedActions.map((action, i) => (
            <div
              key={i}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
            >
              <div>
                <span className="font-bold text-slate-900 dark:text-white block">{action.title}</span>
                <span className="text-slate-600 dark:text-slate-300 mt-0.5 block">{action.description}</span>
                {action.deadline && (
                  <span className="text-[11px] text-rose-600 dark:text-rose-400 font-semibold mt-1 block">
                    Target Date: {action.deadline}
                  </span>
                )}
              </div>
              <button
                onClick={() => onOpenActionDraft(document, action.actionType)}
                className="shrink-0 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
              >
                Draft Resolution
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 6. Grounded Document Q&A Assistant */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Ask a Question About This Document
              </h2>
              <span className="text-xs text-slate-500">
                Grounded strictly in this document's text. No outside hallucinations.
              </span>
            </div>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">Grounded Mode</span>
        </div>

        {/* Suggested Quick Questions */}
        <div className="flex flex-wrap gap-1.5">
          {suggestedQuestions.map((qText, i) => (
            <button
              key={i}
              onClick={() => {
                setQuestion(qText);
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:text-indigo-600 text-slate-600 dark:text-slate-300 transition"
            >
              {qText}
            </button>
          ))}
        </div>

        {/* Chat History */}
        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
          {qaHistory.map((item, idx) => (
            <div key={idx} className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                <span className="font-bold text-slate-800 dark:text-slate-200">You:</span>
                <span>{item.q}</span>
                <span className="text-[10px] text-slate-400">· {item.time}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 leading-relaxed">
                {item.a}
              </div>
            </div>
          ))}

          {isAsking && (
            <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-xs text-indigo-600 dark:text-indigo-300 flex items-center gap-2 animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Checking document clauses and terms...</span>
            </div>
          )}
        </div>

        {/* Query Input */}
        <form onSubmit={handleAskQuestion} className="flex items-center gap-2 pt-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. Can I cancel before month 6 without penalty?"
            className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!question.trim() || isAsking}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
