import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  FileText,
  AlertTriangle,
  Lock,
  X,
  Sparkles,
  CheckCircle2,
  FileCode,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { AppDocument, DocumentType, UserSettings } from '../types';
import { analyzeDocumentWithAI } from '../services/api';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDocumentAdded: (doc: AppDocument) => void;
  settings: UserSettings;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onDocumentAdded,
  settings,
}) => {
  const [activeMode, setActiveMode] = useState<'file' | 'camera' | 'paste' | 'sample'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');
  const [documentTitle, setDocumentTitle] = useState<string>('');
  const [categoryHint, setCategoryHint] = useState<DocumentType>('insurance');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    if (!documentTitle) {
      setDocumentTitle(file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const loadSampleDocument = (sampleKey: 'health' | 'broadband' | 'rent') => {
    if (sampleKey === 'health') {
      setDocumentTitle('Star Care Comprehensive Health Policy');
      setCategoryHint('insurance');
      setPastedText(`STAR CARE COMPREHENSIVE HEALTH POLICY
Policy Number: SC-882910-2025
Insured: Primary + Spouse
Sum Insured: INR 10,00,000
Deductible: INR 25,000 per policy period
Inception: 12-Nov-2025 | Expiry: 12-Nov-2026
Room Rent Limit: 1% of Sum Insured per day. Proportional deduction applies to all associated medical expenses if exceeded.
Waiting Period for Pre-Existing Diseases: 36 consecutive months.
Co-payment: 20% on reimbursement claims at non-network hospitals.
Pre-authorization notification: 48 hours for planned, 24 hours for emergency.`);
    } else if (sampleKey === 'broadband') {
      setDocumentTitle('Airtel Fiber & Mobile Postpaid Bill');
      setCategoryHint('bill');
      setPastedText(`BHARTI AIRTEL LIMITED - POSTPAID & FIBER INVOICE
Account No: 9028192019
Invoice No: DEL-2026-10-9921
Bill Date: 01-Oct-2026 | Due Date: 12-Oct-2026
Previous Balance: 0.00 | Payments: 0.00
Charges:
- Fiber Broadband 300 Mbps: INR 1,899.00
- VAS: Cloud Gaming Booster: INR 199.00
- Taxes (GST @ 18%): INR 377.64
TOTAL DUE: INR 2,475.64 (Rounded: INR 2,476)
Late Payment Fee: INR 250 on dues paid post 12-Oct-2026.
Cancellation: Requires 15 days written notice before cycle close.`);
    } else {
      setDocumentTitle('Apartment 402 Lease Agreement');
      setCategoryHint('rent_agreement');
      setPastedText(`LEAVE AND LICENSE AGREEMENT
Between: Rajiv Mehta (Licensor) and Tenant (Licensee)
Premises: Flat No. 402, Greenview Heights
Term: 11 Months commencing 15-Jan-2026 and terminating 14-Dec-2026.
Monthly License Fee: INR 32,000 payable on or before 5th of each month. Late fee INR 500/day.
Security Deposit: INR 1,00,000 interest-free refundable.
Lock-in Period: 6 months.
Notice Period: 60 calendar days written notice.
Deduction: One month license fee (INR 32,000) shall be deducted for painting and sanitization upon vacation.
Escalation: 10% on renewal.`);
    }
    setActiveMode('paste');
  };

  const handleStartAnalysis = async () => {
    if (!selectedFile && !pastedText.trim()) {
      setError('Please upload a file, snap a photo, or paste document text.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setAnalysisStep('Redacting sensitive account & card numbers...');

    try {
      setTimeout(() => setAnalysisStep('Scanning clauses & policy terms with Gemini...'), 1200);
      setTimeout(() => setAnalysisStep('Detecting hidden fees, deadlines, and traps...'), 2600);

      const mimeType = selectedFile ? selectedFile.type : 'text/plain';

      const analysisResult = await analyzeDocumentWithAI({
        text: pastedText || undefined,
        fileBase64: fileBase64 || undefined,
        mimeType: mimeType,
        title: documentTitle || selectedFile?.name || 'Uploaded Document',
        typeHint: categoryHint,
        currency: settings.currency,
        language: settings.language,
      });

      const newDoc: AppDocument = {
        id: 'doc-' + Date.now(),
        title: analysisResult.title || documentTitle || 'New Document',
        documentType: (analysisResult.documentType as DocumentType) || categoryHint,
        providerName: analysisResult.providerName || 'Detected Provider',
        uploadDate: new Date().toISOString().split('T')[0],
        expiryDate: analysisResult.extractedDeadlines?.[0]?.dueDate || undefined,
        plainSummary: analysisResult.plainSummary || [],
        keyFacts: analysisResult.keyFacts || {
          amounts: [],
          dates: [],
          coverage: [],
          limits: [],
          penalties: [],
          noticePeriods: [],
        },
        notCovered: analysisResult.notCovered || [],
        redFlags: analysisResult.redFlags || [],
        suggestedActions: analysisResult.suggestedActions || [],
        extractedDeadlines: analysisResult.extractedDeadlines || [],
        estimatedSavingsPotential: analysisResult.estimatedSavingsPotential || 0,
        keyTakeaway: analysisResult.keyTakeaway || '',
        tags: [
          analysisResult.documentType || categoryHint,
          analysisResult.providerName || 'Auto-Extracted',
        ],
        rawTextPreview: pastedText || selectedFile?.name || '',
        fileName: selectedFile?.name,
        fileSize: selectedFile ? (selectedFile.size / 1024).toFixed(0) + ' KB' : undefined,
      };

      onDocumentAdded(newDoc);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Failed to analyze document. Please check your network or try pasting text.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Upload & Analyze Document</h3>
              <p className="text-xs text-slate-500">10-second plain language explainer with trapped risk detection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isAnalyzing}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {/* Privacy pre-redaction notice banner */}
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs">
            <Lock className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>
              <strong>Private & Redacted:</strong> Sensitive identifiers (card numbers, SSN, PAN, Aadhaar) are masked automatically before AI processing.
            </span>
          </div>

          {/* Mode Switcher */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-medium">
            <button
              onClick={() => setActiveMode('file')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeMode === 'file'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>File / PDF</span>
            </button>
            <button
              onClick={() => {
                setActiveMode('camera');
                cameraInputRef.current?.click();
              }}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeMode === 'camera'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Camera</span>
            </button>
            <button
              onClick={() => setActiveMode('paste')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeMode === 'paste'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Paste Text</span>
            </button>
            <button
              onClick={() => setActiveMode('sample')}
              className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition ${
                activeMode === 'sample'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Samples</span>
            </button>
          </div>

          {/* Hidden inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".pdf,image/png,image/jpeg,image/webp"
            className="hidden"
          />
          <input
            type="file"
            ref={cameraInputRef}
            onChange={handleFileChange}
            accept="image/*"
            capture="environment"
            className="hidden"
          />

          {/* Mode 1: File Dropzone */}
          {activeMode === 'file' && (
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 rounded-2xl p-6 text-center cursor-pointer transition bg-slate-50/50 dark:bg-slate-800/30 group"
            >
              {selectedFile ? (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950 text-indigo-600 flex items-center justify-center mb-2">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-sm text-slate-900 dark:text-white truncate max-w-xs">
                    {selectedFile.name}
                  </span>
                  <span className="text-xs text-slate-500 mt-0.5">
                    {(selectedFile.size / 1024).toFixed(1)} KB · Ready to scan
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      setFileBase64('');
                    }}
                    className="mt-3 text-xs text-rose-600 hover:underline font-medium"
                  >
                    Remove file
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-600 group-hover:bg-indigo-50 transition flex items-center justify-center mb-2">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                    Click to browse or drag & drop document
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Accepts PDF, JPG, PNG (Scans, policies, bills, leases)
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Camera Capture */}
          {activeMode === 'camera' && (
            <div
              onClick={() => cameraInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-500 transition bg-slate-50 dark:bg-slate-800/30"
            >
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="font-semibold text-sm text-slate-900 dark:text-white">
                  Tap to Open Camera & Snap Document
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Position the bill or contract under good lighting
                </span>
              </div>
            </div>
          )}

          {/* Mode 3: Paste Text */}
          {activeMode === 'paste' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Paste Document or Contract Clauses:
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste confusing clauses, fine print, rental terms, or policy summaries here..."
                rows={5}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-3 text-xs font-mono text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
              />
            </div>
          )}

          {/* Mode 4: Quick Samples */}
          {activeMode === 'sample' && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                Test immediately with realistic confusing contracts:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => loadSampleDocument('health')}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/50 transition group"
                >
                  <span className="font-semibold text-xs text-slate-900 dark:text-white block group-hover:text-indigo-600">
                    Health Policy
                  </span>
                  <span className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    ₹10L sum insured with room-rent 1% trap
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleDocument('broadband')}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/50 transition group"
                >
                  <span className="font-semibold text-xs text-slate-900 dark:text-white block group-hover:text-indigo-600">
                    Broadband Bill
                  </span>
                  <span className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    Unrequested gaming pack + promo hike
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => loadSampleDocument('rent')}
                  className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-400 bg-slate-50 dark:bg-slate-800/50 transition group"
                >
                  <span className="font-semibold text-xs text-slate-900 dark:text-white block group-hover:text-indigo-600">
                    Rent Agreement
                  </span>
                  <span className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                    60-day notice + 1-month painting deduction
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* Form Meta: Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Label (Optional)
              </label>
              <input
                type="text"
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                placeholder="e.g. Star Health 2026 Policy"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Document Category
              </label>
              <select
                value={categoryHint}
                onChange={(e) => setCategoryHint(e.target.value as DocumentType)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              >
                <option value="insurance">Insurance Policy</option>
                <option value="bill">Utility / Phone / Internet Bill</option>
                <option value="rent_agreement">Rent / Lease Agreement</option>
                <option value="loan">Loan / Credit Terms</option>
                <option value="subscription">Subscription Terms</option>
                <option value="warranty">Product Warranty</option>
                <option value="other">Other Contract / Legal Notice</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading state bar */}
          {isAnalyzing && (
            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-2 animate-pulse">
              <div className="flex items-center justify-between text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span>{analysisStep || 'Analyzing Document...'}</span>
                </span>
                <span className="text-[11px] text-indigo-500">Gemini 3.8 Flash</span>
              </div>
              <div className="w-full h-1.5 bg-indigo-200 dark:bg-indigo-800 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 animate-progress rounded-full w-3/4 transition-all duration-500" />
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            disabled={isAnalyzing}
            className="px-3.5 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleStartAnalysis}
            disabled={isAnalyzing || (!selectedFile && !pastedText.trim())}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs hover:shadow-indigo-500/25 transition active:scale-95"
          >
            <span>{isAnalyzing ? 'Analyzing...' : 'Generate 10-Sec Explainer'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
