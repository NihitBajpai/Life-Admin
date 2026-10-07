import React, { useState } from 'react';
import {
  FilePenLine,
  Send,
  Copy,
  Check,
  Mail,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCw,
} from 'lucide-react';
import { ActionDraft, ActionDraftType, AppDocument, UserSettings } from '../types';
import { generateActionDraftWithAI } from '../services/api';

interface ActionAssistantProps {
  documents: AppDocument[];
  initialDoc?: AppDocument | null;
  initialCustomTitle?: string;
  initialCustomDetails?: string;
  initialDraftType?: ActionDraftType;
  settings: UserSettings;
}

export const ActionAssistant: React.FC<ActionAssistantProps> = ({
  documents,
  initialDoc,
  initialCustomTitle,
  initialCustomDetails,
  initialDraftType = 'cancellation_email',
  settings,
}) => {
  const [selectedDocId, setSelectedDocId] = useState<string>(initialDoc ? initialDoc.id : 'custom');
  const [customTitle, setCustomTitle] = useState<string>(initialCustomTitle || '');
  const [providerName, setProviderName] = useState<string>(initialDoc ? initialDoc.providerName : '');
  const [draftType, setDraftType] = useState<ActionDraftType>(initialDraftType);
  const [tone, setTone] = useState<'polite_firm' | 'formal_legal' | 'direct'>('polite_firm');
  const [issueDetails, setIssueDetails] = useState<string>(
    initialCustomDetails ||
      (initialDoc && initialDoc.redFlags[0]
        ? initialDoc.redFlags[0].explanation
        : 'Requesting immediate cancellation before auto-renewal charge.')
  );
  const [senderName, setSenderName] = useState('Account Holder');
  const [accountNumber, setAccountNumber] = useState('[MY_POLICY_OR_ACCOUNT_NO]');

  const [generatedDraft, setGeneratedDraft] = useState<ActionDraft | null>(null);
  const [editedSubject, setEditedSubject] = useState('');
  const [editedBody, setEditedBody] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync when document selection changes
  const handleSelectDoc = (docId: string) => {
    setSelectedDocId(docId);
    if (docId === 'custom') {
      setCustomTitle('');
      setProviderName('');
      setIssueDetails('');
    } else {
      const doc = documents.find((d) => d.id === docId);
      if (doc) {
        setCustomTitle(doc.title);
        setProviderName(doc.providerName);
        setIssueDetails(
          doc.redFlags[0]
            ? doc.redFlags[0].explanation
            : `Resolving contract terms under ${doc.title}.`
        );
      }
    }
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setIsGenerating(true);

    const titleToUse =
      selectedDocId === 'custom' ? customTitle || 'Institutional Service' : customTitle;

    try {
      const result = await generateActionDraftWithAI({
        documentTitle: titleToUse,
        providerName: providerName || 'Customer Service Dept',
        draftType,
        issueDetails: issueDetails || 'Cancel auto-renewal immediately without penalty.',
        userTone: tone,
        senderName,
        accountNumber,
        currency: settings.currency,
      });

      setGeneratedDraft(result);
      setEditedSubject(result.subject);
      setEditedBody(result.body);
    } catch (err: any) {
      setError(err?.message || 'Failed to generate draft.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    const fullText = `Subject: ${editedSubject}\n\n${editedBody}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenEmail = () => {
    const mailto = `mailto:${encodeURIComponent(
      generatedDraft?.recipientHint || ''
    )}?subject=${encodeURIComponent(editedSubject)}&body=${encodeURIComponent(editedBody)}`;
    window.location.href = mailto;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FilePenLine className="w-6 h-6 text-indigo-600" />
          <span>Action Assistant: 1-Tap AI Resolution Drafts</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Don't waste hours fighting corporate bureaucracy. Generate legally backed cancellation emails, refund demands, and dispute letters in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form Controls */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs space-y-4">
          <form onSubmit={handleGenerate} className="space-y-3.5 text-xs">
            {/* Draft Type Picker */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Resolution Letter Type
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'cancellation_email', label: 'Cancellation Email', desc: 'Stop auto-renewals & memberships' },
                  { id: 'dispute_letter', label: 'Dispute Letter', desc: 'Challenge unfair fees & deposit deductions' },
                  { id: 'refund_request', label: 'Refund Request', desc: 'Demand money back for wrong charges' },
                  { id: 'complaint_letter', label: 'Formal Complaint', desc: 'Escalate service failures to grievance team' },
                  { id: 'renewal_negotiation', label: 'Renewal Negotiation', desc: 'Counter-offer rent or seek loyalty discounts' },
                ].map((typeItem) => (
                  <button
                    key={typeItem.id}
                    type="button"
                    onClick={() => setDraftType(typeItem.id as ActionDraftType)}
                    className={`p-2.5 rounded-xl border text-left transition ${
                      draftType === typeItem.id
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/60 text-indigo-950 dark:text-white'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold">{typeItem.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {typeItem.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Context Selector */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Link to Document or Enter Custom
              </label>
              <select
                value={selectedDocId}
                onChange={(e) => handleSelectDoc(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="custom">+ Custom / Enter details manually</option>
                {documents.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.title} ({doc.providerName})
                  </option>
                ))}
              </select>
            </div>

            {selectedDocId === 'custom' && (
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject / Service Provider
                </label>
                <input
                  type="text"
                  required
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="e.g. Cult.fit Gym / Landlord Rajiv Mehta / Airtel Telecom"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            {/* Tone Selector */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tone of Letter
              </label>
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                {[
                  { id: 'polite_firm', label: 'Polite & Firm' },
                  { id: 'formal_legal', label: 'Formal Legal' },
                  { id: 'direct', label: 'Succinct Direct' },
                ].map((toneItem) => (
                  <button
                    key={toneItem.id}
                    type="button"
                    onClick={() => setTone(toneItem.id as any)}
                    className={`py-1.5 rounded-lg text-center transition ${
                      tone === toneItem.id
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {toneItem.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Context / Problem Details */}
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Problem Details / Traps to Resolve
              </label>
              <textarea
                rows={3}
                value={issueDetails}
                onChange={(e) => setIssueDetails(e.target.value)}
                placeholder="Describe what happened: e.g. Unrequested ₹199 pack added, or landlord deducting 1 month painting without cause..."
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && (
              <div className="p-2.5 rounded-lg bg-rose-50 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold shadow-xs transition"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isGenerating ? 'Drafting with Gemini...' : 'Generate Action Draft'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Editable Preview & Email Buttons */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex flex-col justify-between space-y-4">
          {generatedDraft ? (
            <div className="space-y-4 text-xs">
              {/* Leverage Points Box */}
              {generatedDraft.keyLeveragePoints.length > 0 && (
                <div className="p-3.5 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-950 dark:text-indigo-200">
                  <div className="font-bold flex items-center gap-1.5 text-xs mb-1">
                    <Scale className="w-4 h-4 text-indigo-600" />
                    <span>Your Legal & Consumer Leverage:</span>
                  </div>
                  <ul className="space-y-1 text-[11px] pl-4 list-disc text-slate-700 dark:text-slate-300">
                    {generatedDraft.keyLeveragePoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Subject */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subject Line:
                </label>
                <input
                  type="text"
                  value={editedSubject}
                  onChange={(e) => setEditedSubject(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Body */}
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Letter Body (Editable):
                </label>
                <textarea
                  rows={12}
                  value={editedBody}
                  onChange={(e) => setEditedBody(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-3 text-xs font-mono text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] text-slate-500">
                  Target: {generatedDraft.recipientHint}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-50 text-slate-700 dark:text-slate-300 font-semibold transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>

                  <button
                    onClick={handleOpenEmail}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Open in Email</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[360px] flex flex-col items-center justify-center text-center p-6 text-slate-400 text-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-3">
                <Mail className="w-6 h-6" />
              </div>
              <span className="font-semibold text-slate-700 dark:text-slate-300 text-sm">
                Ready to Draft Resolution
              </span>
              <p className="max-w-xs mt-1 text-slate-500">
                Pick a resolution letter type on the left and tap "Generate Action Draft" to create an editable, legally sound message with mailto links.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
