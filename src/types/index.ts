export type DocumentType =
  | 'insurance'
  | 'bill'
  | 'rent_agreement'
  | 'loan'
  | 'subscription'
  | 'warranty'
  | 'other';

export type Severity = 'low' | 'medium' | 'high';

export interface KeyFacts {
  amounts: string[];
  dates: string[];
  coverage: string[];
  limits: string[];
  penalties: string[];
  noticePeriods: string[];
}

export interface RedFlag {
  title: string;
  explanation: string;
  severity: Severity;
  clauseQuote?: string;
}

export interface SuggestedAction {
  title: string;
  description: string;
  deadline?: string;
  actionType?: 'cancel' | 'dispute' | 'renew' | 'calendar' | 'negotiate' | 'refund';
}

export interface DeadlineItem {
  id: string;
  documentId?: string;
  documentTitle: string;
  title: string;
  dueDate: string; // YYYY-MM-DD
  daysNoticeRequired?: number;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  completed: boolean;
  snoozedUntil?: string;
  remindAt30Days: boolean;
  remindAt7Days: boolean;
  remindAt1Day: boolean;
  lastDeliveryStatus?: 'Delivered' | 'Scheduled' | 'Snoozed';
}

export interface AppDocument {
  id: string;
  title: string;
  documentType: DocumentType;
  providerName: string;
  uploadDate: string;
  expiryDate?: string;
  plainSummary: string[];
  keyFacts: KeyFacts;
  notCovered: string[];
  redFlags: RedFlag[];
  suggestedActions: SuggestedAction[];
  extractedDeadlines: Array<{
    title: string;
    dueDate: string;
    daysNoticeRequired?: number;
    description: string;
    urgency: 'high' | 'medium' | 'low';
  }>;
  estimatedSavingsPotential?: number;
  keyTakeaway?: string;
  tags: string[];
  rawTextPreview?: string;
  fileDataUrl?: string;
  fileName?: string;
  fileSize?: string;
}

export interface SubscriptionItem {
  id: string;
  name: string;
  amount: number;
  frequency: 'monthly' | 'annual';
  category: string;
  status: 'active' | 'price_hiked' | 'duplicate' | 'unused_risk';
  riskNote: string;
  renewalDate: string;
  suggestedAction?: string;
  providerUrl?: string;
}

export interface ActionDraft {
  subject: string;
  body: string;
  recipientHint: string;
  keyLeveragePoints: string[];
}

export type ActionDraftType =
  | 'cancellation_email'
  | 'complaint_letter'
  | 'refund_request'
  | 'dispute_letter'
  | 'renewal_negotiation';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  plan: 'free' | 'premium';
  documentsUsedThisMonth: number;
  maxMonthlyFreeDocs: number;
  avatarUrl?: string;
}

export interface UserSettings {
  currency: '₹' | '$' | '€' | '£';
  language: 'en' | 'hi';
  remindersEnabled: boolean;
  remind30Days: boolean;
  remind7Days: boolean;
  remind1Day: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
  theme: 'light' | 'dark' | 'system';
}
