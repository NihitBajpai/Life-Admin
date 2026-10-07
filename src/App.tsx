import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav, NavTab } from './components/BottomNav';
import { Dashboard } from './components/Dashboard';
import { DocumentExplainer } from './components/DocumentExplainer';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { DeadlinesTimeline } from './components/DeadlinesTimeline';
import { SubscriptionWatchdog } from './components/SubscriptionWatchdog';
import { ActionAssistant } from './components/ActionAssistant';
import { DocumentVault } from './components/DocumentVault';
import { LandingPage } from './components/LandingPage';
import { SettingsModal } from './components/SettingsModal';
import { UpgradeModal } from './components/UpgradeModal';
import { AuthModal } from './components/AuthModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ChatAdvisor } from './components/ChatAdvisor';
import { Bot, Sparkles } from 'lucide-react';

import {
  AppDocument,
  DeadlineItem,
  SubscriptionItem,
  UserProfile,
  UserSettings,
  ActionDraftType,
} from './types';
import {
  SEED_DOCUMENTS,
  SEED_DEADLINES,
  SEED_SUBSCRIPTIONS,
} from './data/seedData';

const DEFAULT_USER: UserProfile = {
  id: 'usr-1',
  name: 'Alex Rivera',
  email: 'alex.rivera@gmail.com',
  plan: 'free',
  documentsUsedThisMonth: 1,
  maxMonthlyFreeDocs: 3,
};

const DEFAULT_SETTINGS: UserSettings = {
  currency: '₹',
  language: 'en',
  remindersEnabled: true,
  remind30Days: true,
  remind7Days: true,
  remind1Day: true,
  emailNotifications: true,
  pushNotifications: true,
  inAppNotifications: true,
  theme: 'light',
};

export default function App() {
  // Load initial state from localStorage or seeds
  const [documents, setDocuments] = useState<AppDocument[]>(() => {
    const saved = localStorage.getItem('la_documents');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return SEED_DOCUMENTS;
  });

  const [deadlines, setDeadlines] = useState<DeadlineItem[]>(() => {
    const saved = localStorage.getItem('la_deadlines');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return SEED_DEADLINES;
  });

  const [subscriptions, setSubscriptions] = useState<SubscriptionItem[]>(() => {
    const saved = localStorage.getItem('la_subscriptions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return SEED_SUBSCRIPTIONS;
  });

  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('la_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_USER;
  });

  const [settings, setSettings] = useState<UserSettings>(() => {
    const saved = localStorage.getItem('la_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return DEFAULT_SETTINGS;
  });

  // Navigation and active view
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [selectedDocument, setSelectedDocument] = useState<AppDocument | null>(null);
  const [showLandingPage, setShowLandingPage] = useState<boolean>(false);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Action Assistant Pre-fills
  const [actionDoc, setActionDoc] = useState<AppDocument | null>(null);
  const [actionCustomTitle, setActionCustomTitle] = useState<string>('');
  const [actionCustomDetails, setActionCustomDetails] = useState<string>('');
  const [actionDraftType, setActionDraftType] = useState<ActionDraftType>('cancellation_email');

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('la_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('la_deadlines', JSON.stringify(deadlines));
  }, [deadlines]);

  useEffect(() => {
    localStorage.setItem('la_subscriptions', JSON.stringify(subscriptions));
  }, [subscriptions]);

  useEffect(() => {
    localStorage.setItem('la_user', JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    localStorage.setItem('la_settings', JSON.stringify(settings));
  }, [settings]);

  // Document Handlers
  const handleDocumentAdded = (newDoc: AppDocument) => {
    setDocuments((prev) => [newDoc, ...prev]);
    setUser((prev) => ({
      ...prev,
      documentsUsedThisMonth: prev.documentsUsedThisMonth + 1,
    }));

    // Auto-extract deadlines and add to tracker
    if (newDoc.extractedDeadlines && newDoc.extractedDeadlines.length > 0) {
      const newDeadlines: DeadlineItem[] = newDoc.extractedDeadlines.map((ed, idx) => ({
        id: `dl-${Date.now()}-${idx}`,
        documentId: newDoc.id,
        documentTitle: newDoc.title,
        title: ed.title,
        dueDate: ed.dueDate,
        daysNoticeRequired: ed.daysNoticeRequired || 7,
        description: ed.description || 'Auto-extracted from policy clauses.',
        urgency: ed.urgency || 'medium',
        completed: false,
        remindAt30Days: true,
        remindAt7Days: true,
        remindAt1Day: true,
        lastDeliveryStatus: 'Scheduled',
      }));
      setDeadlines((prev) => [...newDeadlines, ...prev]);
    }

    setSelectedDocument(newDoc);
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setDeadlines((prev) => prev.filter((dl) => dl.documentId !== id));
    if (selectedDocument?.id === id) {
      setSelectedDocument(null);
    }
  };

  const handleDeleteAllData = () => {
    setDocuments([]);
    setDeadlines([]);
    setSubscriptions([]);
    setSelectedDocument(null);
    localStorage.removeItem('la_documents');
    localStorage.removeItem('la_deadlines');
    localStorage.removeItem('la_subscriptions');
  };

  // Deadline Handlers
  const handleToggleDeadlineComplete = (id: string) => {
    setDeadlines((prev) =>
      prev.map((dl) => (dl.id === id ? { ...dl, completed: !dl.completed } : dl))
    );
  };

  const handleSnoozeDeadline = (id: string, days: number) => {
    setDeadlines((prev) =>
      prev.map((dl) => {
        if (dl.id === id) {
          const currentDue = new Date(dl.dueDate);
          currentDue.setDate(currentDue.getDate() + days);
          return {
            ...dl,
            dueDate: currentDue.toISOString().split('T')[0],
            lastDeliveryStatus: 'Snoozed',
          };
        }
        return dl;
      })
    );
  };

  const handleDeleteDeadline = (id: string) => {
    setDeadlines((prev) => prev.filter((dl) => dl.id !== id));
  };

  const handleAddDeadline = (item: Omit<DeadlineItem, 'id'>) => {
    const newDl: DeadlineItem = {
      ...item,
      id: `dl-${Date.now()}`,
    };
    setDeadlines((prev) => [newDl, ...prev]);
  };

  const handleUpdateDeadline = (id: string, updates: Partial<DeadlineItem>) => {
    setDeadlines((prev) =>
      prev.map((dl) => (dl.id === id ? { ...dl, ...updates } : dl))
    );
  };

  // Subscription Handlers
  const handleAddSubscription = (sub: Omit<SubscriptionItem, 'id'>) => {
    const newSub: SubscriptionItem = {
      ...sub,
      id: `sub-${Date.now()}`,
    };
    setSubscriptions((prev) => [newSub, ...prev]);
  };

  const handleDeleteSubscription = (id: string) => {
    setSubscriptions((prev) => prev.filter((s) => s.id !== id));
  };

  // Action Assistant Trigger
  const handleOpenActionDraft = (
    docOrTitle: AppDocument | string,
    actionTypeOrDetails?: any,
    draftTypeHint?: ActionDraftType
  ) => {
    if (typeof docOrTitle === 'object') {
      setActionDoc(docOrTitle);
      setActionCustomTitle('');
      setActionCustomDetails('');
      if (actionTypeOrDetails) {
        if (actionTypeOrDetails === 'dispute') setActionDraftType('dispute_letter');
        else if (actionTypeOrDetails === 'refund') setActionDraftType('refund_request');
        else if (actionTypeOrDetails === 'cancel') setActionDraftType('cancellation_email');
        else if (actionTypeOrDetails === 'negotiate') setActionDraftType('renewal_negotiation');
        else setActionDraftType('cancellation_email');
      }
    } else {
      setActionDoc(null);
      setActionCustomTitle(docOrTitle);
      setActionCustomDetails(actionTypeOrDetails || '');
      setActionDraftType(draftTypeHint || 'cancellation_email');
    }
    setActiveTab('actions');
    setSelectedDocument(null);
  };

  const handleExportData = () => {
    const exportObject = {
      exportDate: new Date().toISOString(),
      user,
      settings,
      documents,
      deadlines,
      subscriptions,
    };
    const blob = new Blob([JSON.stringify(exportObject, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `life-admin-autopilot-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleNavSelect = (tab: NavTab) => {
    if (tab === 'upload') {
      setIsUploadModalOpen(true);
      return;
    }
    setActiveTab(tab);
    setSelectedDocument(null);
    setShowLandingPage(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased">
      {/* Offline Alert Indicator */}
      <OfflineIndicator />

      {/* Top Navbar */}
      <Navbar
        user={user}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
        onShowLanding={() => setShowLandingPage(true)}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Main Body */}
      <main className="flex-1 pb-20 sm:pb-24">
        {showLandingPage ? (
          <LandingPage
            onEnterApp={() => setShowLandingPage(false)}
            onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
            settings={settings}
          />
        ) : selectedDocument ? (
          <DocumentExplainer
            document={selectedDocument}
            onBack={() => setSelectedDocument(null)}
            onOpenActionDraft={(doc, actionType) => handleOpenActionDraft(doc, actionType)}
            onAddDeadlineToTracker={(doc) => {
              setActiveTab('deadlines');
              setSelectedDocument(null);
            }}
            settings={settings}
          />
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <Dashboard
                documents={documents}
                deadlines={deadlines}
                subscriptions={subscriptions}
                onSelectDocument={(doc) => setSelectedDocument(doc)}
                onOpenUpload={() => setIsUploadModalOpen(true)}
                onNavigateToDeadlines={() => setActiveTab('deadlines')}
                onNavigateToWatchdog={() => setActiveTab('watchdog')}
                onNavigateToActions={() => setActiveTab('actions')}
                onNavigateToVault={() => setActiveTab('vault')}
                settings={settings}
              />
            )}

            {activeTab === 'deadlines' && (
              <DeadlinesTimeline
                deadlines={deadlines}
                onToggleComplete={handleToggleDeadlineComplete}
                onSnooze={handleSnoozeDeadline}
                onDeleteDeadline={handleDeleteDeadline}
                onAddDeadline={handleAddDeadline}
                onUpdateDeadline={handleUpdateDeadline}
                settings={settings}
              />
            )}

            {activeTab === 'watchdog' && (
              <SubscriptionWatchdog
                subscriptions={subscriptions}
                onAddSubscription={handleAddSubscription}
                onDeleteSubscription={handleDeleteSubscription}
                onOpenActionDraft={(title, details, draftType) =>
                  handleOpenActionDraft(title, details, draftType)
                }
                settings={settings}
              />
            )}

            {activeTab === 'actions' && (
              <ActionAssistant
                documents={documents}
                initialDoc={actionDoc}
                initialCustomTitle={actionCustomTitle}
                initialCustomDetails={actionCustomDetails}
                initialDraftType={actionDraftType}
                settings={settings}
              />
            )}

            {activeTab === 'vault' && (
              <DocumentVault
                documents={documents}
                onSelectDocument={(doc) => setSelectedDocument(doc)}
                onDeleteDocument={handleDeleteDocument}
                onDeleteAllData={handleDeleteAllData}
                onOpenUploadModal={() => setIsUploadModalOpen(true)}
                settings={settings}
              />
            )}
          </>
        )}
      </main>

      {/* Mobile-first Bottom Navigation Bar */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={handleNavSelect}
        upcomingCount={deadlines.filter((d) => !d.completed).length}
      />

      {/* Modals */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDocumentAdded={handleDocumentAdded}
        settings={settings}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        user={user}
        settings={settings}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
        onUpdateUser={(newUser) => setUser((prev) => ({ ...prev, ...newUser }))}
        onExportData={handleExportData}
        onDeleteAccount={handleDeleteAllData}
        onOpenUpgrade={() => {
          setIsSettingsModalOpen(false);
          setIsUpgradeModalOpen(true);
        }}
      />

      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        user={user}
        settings={settings}
        onPlanUpdated={(newPlan) => setUser((prev) => ({ ...prev, plan: newPlan }))}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(profile) => setUser((prev) => ({ ...prev, ...profile }))}
      />

      {/* Floating Chat Copilot Trigger Button */}
      <button
        onClick={() => setIsChatOpen(true)}
        className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-30 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xl shadow-indigo-600/30 active:scale-95 transition group"
        title="Chat with Autopilot Legal & Policy Copilot"
      >
        <Bot className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        <span className="hidden sm:inline">Ask Policy Copilot</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
      </button>

      {/* Multi-turn Gemini Chatbot */}
      <ChatAdvisor
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        documents={documents}
        settings={settings}
      />
    </div>
  );
}
