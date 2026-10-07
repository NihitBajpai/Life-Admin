import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Bot,
  User,
  Sparkles,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  ChevronDown,
  FileText,
} from 'lucide-react';
import { AppDocument, UserSettings } from '../types';
import { sendChatMessage } from '../services/api';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface ChatAdvisorProps {
  isOpen: boolean;
  onClose: () => void;
  documents: AppDocument[];
  settings: UserSettings;
}

export const ChatAdvisor: React.FC<ChatAdvisorProps> = ({
  isOpen,
  onClose,
  documents,
  settings,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      role: 'assistant',
      content: `Hello! I am your **Autopilot Legal & Policy Copilot**. I can help you analyze fine print, navigate lease disputes, dispute sneaky broadband charges, and understand insurance room rent capping.

How can I help you today? You can ask about your uploaded documents or general contract rights!`,
      timestamp: 'Just now',
    },
  ]);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  if (!isOpen) return null;

  const starterPrompts = [
    'How do I challenge an unfair painting deduction on rent?',
    'What is proportional deduction in health insurance?',
    'Can my telecom operator add a gaming pack without consent?',
    'What notice period do I legally need to cancel my gym?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsSending(true);

    // Provide context summary of user's stored documents if any exist
    const docSummaryContext = documents
      .map(
        (d) =>
          `[${d.title} (${d.documentType})]: Provider: ${d.providerName}. Summary: ${d.plainSummary.join(' ')}. Red flags: ${d.redFlags.map((rf) => rf.title + ' - ' + rf.explanation).join('; ')}`
      )
      .join('\n\n');

    try {
      const serverHistory = newHistory.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await sendChatMessage({
        messages: serverHistory,
        documentSummaryContext: docSummaryContext,
      });

      const assistantMsg: ChatMessage = {
        id: 'bot-' + Date.now(),
        role: 'assistant',
        content: res.content,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: 'bot-err-' + Date.now(),
        role: 'assistant',
        content:
          'Sorry, I encountered an error connecting to Gemini: ' +
          (err?.message || 'Please check your connection and try again.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: 'msg-reset',
        role: 'assistant',
        content: 'Conversation history cleared. Ask me anything about your policies, bills, or tenant rights!',
        timestamp: 'Just now',
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl h-[90vh] max-h-[750px] rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-800/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Autopilot Legal & Policy Copilot
                </h3>
                <span className="text-[10px] text-emerald-600 font-semibold px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60">
                  Gemini Flash
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Multi-turn consumer rights & fine-print advisor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleClearHistory}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
              title="Clear conversation history"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
              title="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-1.5 ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white shadow-xs rounded-tr-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>

                <div
                  className={`flex items-center justify-between text-[10px] pt-1 opacity-75 ${
                    msg.role === 'user' ? 'text-indigo-100' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.role === 'assistant' && (
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:opacity-100 p-0.5 ml-2"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <Check className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-500 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                <span>Reviewing contract clauses and standards...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Starter Prompts */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[10px] text-slate-400 block mb-1">Common questions:</span>
            <div className="flex flex-wrap gap-1.5">
              {starterPrompts.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(p)}
                  className="text-[11px] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-indigo-400 text-slate-600 dark:text-slate-300 transition text-left"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fine print, late fees, rent clauses, or dispute rights..."
              className="flex-1 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3.5 py-2.5 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold flex items-center gap-1.5 transition shrink-0"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1.5 px-1">
            <span>Context-aware of your {documents.length} stored documents</span>
            <span>Educational advice · Not legal counsel</span>
          </div>
        </div>
      </div>
    </div>
  );
};
