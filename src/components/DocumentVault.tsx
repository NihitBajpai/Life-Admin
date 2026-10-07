import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Archive,
  Search,
  Filter,
  Trash2,
  FileText,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
  AlertOctagon,
  X,
  Tag,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-react';
import { AppDocument, DocumentType, UserSettings } from '../types';

interface DocumentVaultProps {
  documents: AppDocument[];
  onSelectDocument: (doc: AppDocument) => void;
  onDeleteDocument: (id: string) => void;
  onDeleteAllData: () => void;
  onOpenUploadModal: () => void;
  settings: UserSettings;
}

type SearchScope = 'all' | 'title' | 'tags' | 'content';

interface SearchMatchInfo {
  matchedField: 'title' | 'tag' | 'provider' | 'summary' | 'red_flag' | 'key_fact' | 'exclusion' | 'raw_text';
  snippet: string;
}

export const DocumentVault: React.FC<DocumentVaultProps> = ({
  documents,
  onSelectDocument,
  onDeleteDocument,
  onDeleteAllData,
  onOpenUploadModal,
  settings,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchScope, setSearchScope] = useState<SearchScope>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showPurgeModal, setShowPurgeModal] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' or 'Ctrl+K' / 'Cmd+K' to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' && document.activeElement !== searchInputRef.current && (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA')) ||
          ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Quick suggested search filters for common contractual pain points
  const suggestedKeywords = [
    'Room Rent',
    'Penalty',
    'Notice',
    'Deposit',
    'Hidden Fee',
    'Auto-Renew',
    'Deductible',
  ];

  // Helper to extract matches for highlight snippet preview
  const getMatchInfo = (doc: AppDocument, query: string, scope: SearchScope): SearchMatchInfo | null => {
    if (!query.trim()) return null;
    const q = query.toLowerCase();

    // 1. Title / Provider
    if (scope === 'all' || scope === 'title') {
      if (doc.title.toLowerCase().includes(q)) {
        return { matchedField: 'title', snippet: `Title: ${doc.title}` };
      }
      if (doc.providerName.toLowerCase().includes(q)) {
        return { matchedField: 'provider', snippet: `Provider: ${doc.providerName}` };
      }
    }

    // 2. Tags
    if (scope === 'all' || scope === 'tags') {
      const matchedTag = doc.tags.find((t) => t.toLowerCase().includes(q));
      if (matchedTag) {
        return { matchedField: 'tag', snippet: `Tag: #${matchedTag}` };
      }
    }

    // 3. Content keywords (plainSummary, redFlags, keyFacts, notCovered, rawText)
    if (scope === 'all' || scope === 'content') {
      // Red flags
      const matchedFlag = doc.redFlags.find(
        (rf) =>
          rf.title.toLowerCase().includes(q) ||
          rf.explanation.toLowerCase().includes(q) ||
          (rf.clauseQuote && rf.clauseQuote.toLowerCase().includes(q))
      );
      if (matchedFlag) {
        return {
          matchedField: 'red_flag',
          snippet: `Red Flag: ${matchedFlag.title} — ${matchedFlag.clauseQuote ? `"${matchedFlag.clauseQuote}"` : matchedFlag.explanation}`,
        };
      }

      // Plain Summary
      const matchedSummary = doc.plainSummary.find((s) => s.toLowerCase().includes(q));
      if (matchedSummary) {
        return { matchedField: 'summary', snippet: `Summary: ${matchedSummary}` };
      }

      // Key Facts amounts/limits/penalties/coverage
      const allFacts = [
        ...doc.keyFacts.amounts,
        ...doc.keyFacts.dates,
        ...doc.keyFacts.coverage,
        ...doc.keyFacts.limits,
        ...doc.keyFacts.penalties,
        ...doc.keyFacts.noticePeriods,
      ];
      const matchedFact = allFacts.find((f) => f.toLowerCase().includes(q));
      if (matchedFact) {
        return { matchedField: 'key_fact', snippet: `Key Fact: ${matchedFact}` };
      }

      // Not covered / exclusions
      const matchedExclusion = doc.notCovered.find((e) => e.toLowerCase().includes(q));
      if (matchedExclusion) {
        return { matchedField: 'exclusion', snippet: `Exclusion: ${matchedExclusion}` };
      }

      // Raw text preview
      if (doc.rawTextPreview && doc.rawTextPreview.toLowerCase().includes(q)) {
        const idx = doc.rawTextPreview.toLowerCase().indexOf(q);
        const start = Math.max(0, idx - 30);
        const end = Math.min(doc.rawTextPreview.length, idx + 70);
        return {
          matchedField: 'raw_text',
          snippet: `Fine Print: ...${doc.rawTextPreview.substring(start, end).trim()}...`,
        };
      }
    }

    return null;
  };

  // Perform search and filtering
  const searchResults = useMemo(() => {
    return documents
      .map((doc) => {
        const match = searchQuery.trim() ? getMatchInfo(doc, searchQuery, searchScope) : null;
        const matchesCategory = typeFilter === 'all' || doc.documentType === typeFilter;

        const isMatch = !searchQuery.trim() || match !== null;

        return {
          doc,
          match,
          visible: isMatch && matchesCategory,
        };
      })
      .filter((item) => item.visible);
  }, [documents, searchQuery, searchScope, typeFilter]);

  const getDocTypeIcon = (type: DocumentType) => {
    switch (type) {
      case 'insurance':
        return '🛡️';
      case 'bill':
        return '🧾';
      case 'rent_agreement':
        return '🏠';
      case 'loan':
        return '💳';
      case 'subscription':
        return '🔄';
      case 'warranty':
        return '📦';
      default:
        return '📄';
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Archive className="w-6 h-6 text-indigo-600" />
            <span>Document Vault</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your private document repository. Search deep across document titles, tags, and contract content keywords.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setShowPurgeModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/60 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-semibold transition"
            title="Permanently wipe all documents and local data"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Everything</span>
          </button>

          <button
            onClick={onOpenUploadModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition"
          >
            <span>+ Upload Document</span>
          </button>
        </div>
      </div>

      {/* GLOBAL SEARCH BAR SECTION */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xs space-y-3">
        {/* Main Search Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search across titles, tags, fines, notice periods, or clause keywords (e.g. 'room rent', 'deposit', '199')..."
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/60 pl-10 pr-24 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition"
          />

          <div className="absolute right-3 flex items-center gap-1.5">
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px] font-mono text-slate-400">
              /
            </kbd>
          </div>
        </div>

        {/* Search Scopes & Quick Filter Pills */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1">
          {/* Scope Selector */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-medium self-start">
            <span className="text-[11px] text-slate-400 px-1.5">Scope:</span>
            {[
              { id: 'all', label: 'All Fields' },
              { id: 'title', label: 'Titles' },
              { id: 'tags', label: 'Tags' },
              { id: 'content', label: 'Content Keywords' },
            ].map((sc) => (
              <button
                key={sc.id}
                onClick={() => setSearchScope(sc.id as SearchScope)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  searchScope === sc.id
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {sc.label}
              </button>
            ))}
          </div>

          {/* Quick Keyword Suggestions */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-500">
            <span className="shrink-0 text-slate-400">Try:</span>
            {suggestedKeywords.map((kw) => (
              <button
                key={kw}
                onClick={() => {
                  setSearchQuery(kw);
                  setSearchScope('all');
                }}
                className={`px-2 py-0.5 rounded-md border transition whitespace-nowrap ${
                  searchQuery.toLowerCase() === kw.toLowerCase()
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 text-slate-600 dark:text-slate-400'
                }`}
              >
                {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Search Status & Active Query Bar */}
        {searchQuery.trim() && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800 text-slate-500">
            <span>
              Showing {searchResults.length} of {documents.length} document{documents.length !== 1 ? 's' : ''} matching "<strong>{searchQuery}</strong>" in <em>{searchScope}</em>
            </span>
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
              }}
              className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Document Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-medium">
        {[
          { id: 'all', label: 'All Documents' },
          { id: 'insurance', label: 'Insurance' },
          { id: 'bill', label: 'Bills' },
          { id: 'rent_agreement', label: 'Rent & Lease' },
          { id: 'loan', label: 'Loans' },
          { id: 'subscription', label: 'Subscriptions' },
          { id: 'warranty', label: 'Warranties' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setTypeFilter(cat.id)}
            className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
              typeFilter === cat.id
                ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Documents Results List */}
      <div className="space-y-3">
        {searchResults.length === 0 ? (
          <div className="p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 text-xs space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                No documents found matching "{searchQuery}"
              </p>
              <p className="text-slate-400 mt-1">
                Try searching for broader keywords like "penalty", "insurance", "fee", or check your category filter.
              </p>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setSearchScope('all');
              }}
              className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-indigo-100 transition"
            >
              Clear Search & Show All Documents
            </button>
          </div>
        ) : (
          searchResults.map(({ doc, match }) => (
            <div
              key={doc.id}
              onClick={() => onSelectDocument(doc)}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-indigo-500 shadow-xs cursor-pointer transition group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="text-2xl p-2 rounded-xl bg-slate-50 dark:bg-slate-800/80 shrink-0">
                    {getDocTypeIcon(doc.documentType)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400 capitalize">
                        {doc.documentType.replace('_', ' ')}
                      </span>
                      <span>·</span>
                      <span>{doc.providerName}</span>
                      {doc.expiryDate && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                            <Calendar className="w-3 h-3 text-indigo-500" />
                            <span>Expiry: {doc.expiryDate}</span>
                          </span>
                        </>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition mt-0.5">
                      {doc.title}
                    </h3>

                    {doc.keyTakeaway && (
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-1 mt-1">
                        {doc.keyTakeaway}
                      </p>
                    )}

                    {/* MATCH SNIPPET PREVIEW (if search query active) */}
                    {match && (
                      <div className="mt-2 p-2 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 text-[11px] text-indigo-950 dark:text-indigo-200 flex items-start gap-1.5 animate-in fade-in">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">
                          <strong>Match found in {match.matchedField.replace('_', ' ')}:</strong> {match.snippet}
                        </span>
                      </div>
                    )}

                    {/* Tags and Red Flag Counter */}
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                      {doc.redFlags.length > 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 dark:text-rose-400">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{doc.redFlags.length} flagged traps</span>
                        </span>
                      )}
                      {doc.tags.map((tag, i) => (
                        <span
                          key={i}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSearchQuery(tag);
                            setSearchScope('tags');
                          }}
                          className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-indigo-600 cursor-pointer"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Meta & Actions */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 dark:border-slate-800">
                  {doc.estimatedSavingsPotential ? (
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-medium">Potential Savings</span>
                      <div className="text-sm font-bold text-emerald-600">
                        {settings.currency} {doc.estimatedSavingsPotential.toLocaleString()}
                      </div>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteDocument(doc.id);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="p-1.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Everything Purge Modal */}
      {showPurgeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto mb-3">
              <AlertOctagon className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Permanent Data Deletion
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
              This will permanently delete all uploaded documents, extracted summaries, saved deadlines, and subscription records from your device. This cannot be undone.
            </p>

            <div className="flex items-center justify-center gap-2 mt-5">
              <button
                onClick={() => setShowPurgeModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteAllData();
                  setShowPurgeModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition"
              >
                Yes, Delete Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
