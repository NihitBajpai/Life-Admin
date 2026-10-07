import { ActionDraft, ActionDraftType, AppDocument } from '../types';

export interface DocumentAnalysisResponse {
  title: string;
  documentType: AppDocument['documentType'];
  providerName: string;
  plainSummary: string[];
  keyFacts: AppDocument['keyFacts'];
  notCovered: string[];
  redFlags: AppDocument['redFlags'];
  suggestedActions: AppDocument['suggestedActions'];
  extractedDeadlines: AppDocument['extractedDeadlines'];
  estimatedSavingsPotential?: number;
  keyTakeaway?: string;
}

export async function analyzeDocumentWithAI(params: {
  text?: string;
  fileBase64?: string;
  mimeType?: string;
  title?: string;
  typeHint?: string;
  currency?: string;
  language?: string;
}): Promise<DocumentAnalysisResponse> {
  const response = await fetch('/api/analyze-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Analysis failed' }));
    throw new Error(err.details || err.error || 'Failed to analyze document');
  }

  const result = await response.json();
  return result.data;
}

export async function askDocumentQuestionWithAI(params: {
  documentContext: string;
  question: string;
  documentTitle?: string;
}): Promise<string> {
  const response = await fetch('/api/ask-document', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Q&A failed' }));
    throw new Error(err.details || err.error || 'Failed to answer question');
  }

  const result = await response.json();
  return result.answer;
}

export async function generateActionDraftWithAI(params: {
  documentTitle: string;
  providerName?: string;
  draftType: ActionDraftType;
  issueDetails: string;
  userTone: 'polite_firm' | 'formal_legal' | 'direct';
  senderName?: string;
  accountNumber?: string;
  currency?: string;
}): Promise<ActionDraft> {
  const response = await fetch('/api/generate-action-draft', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Draft failed' }));
    throw new Error(err.details || err.error || 'Failed to generate action draft');
  }

  const result = await response.json();
  return result.data;
}

export async function analyzeStatementWithAI(params: {
  statementText: string;
  currency?: string;
}): Promise<{
  detectedSubscriptions: any[];
  totalMonthlySpend: number;
  potentialMonthlySavings: number;
  insights: string[];
}> {
  const response = await fetch('/api/analyze-statement', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Statement analysis failed' }));
    throw new Error(err.details || err.error || 'Failed to analyze statement');
  }

  const result = await response.json();
  return result.data;
}

export async function triggerReminderNotification(params: {
  title: string;
  dueDate: string;
  urgency: string;
  channel?: 'in_app' | 'email' | 'push';
}): Promise<{
  deliveryId: string;
  status: string;
  message: string;
  timestamp: string;
}> {
  const response = await fetch('/api/send-reminder-notification', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    throw new Error('Failed to dispatch notification');
  }

  return response.json();
}

export async function sendChatMessage(params: {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  documentSummaryContext?: string;
}): Promise<{
  role: 'assistant';
  content: string;
  timestamp: string;
}> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: 'Chat failed' }));
    throw new Error(err.details || err.error || 'Failed to process chat message');
  }

  return response.json();
}

