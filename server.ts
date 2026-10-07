import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// High limit for base64 camera photos and PDFs
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Server-side Gemini client with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Sensitive data redactor before AI ingestion
function redactSensitiveData(text: string): string {
  if (!text) return '';
  return text
    // 13-16 digit credit card numbers
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, '[REDACTED_CARD_NUMBER]')
    // US SSN pattern
    .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[REDACTED_SSN]')
    // Indian Aadhaar pattern (12 digits)
    .replace(/\b\d{4}\s\d{4}\s\d{4}\b/g, '[REDACTED_AADHAAR]')
    // Indian PAN card pattern (5 letters, 4 digits, 1 letter)
    .replace(/\b[A-Z]{5}\d{4}[A-Z]\b/gi, '[REDACTED_TAX_ID]')
    // Bank account numbers (9 to 18 digits preceded by keywords)
    .replace(/(?:account|a\/c|acct)[\s:#]+(\d{9,18})/gi, 'account: [REDACTED_ACCT_NUMBER]');
}

// Resilient Gemini invoker with exponential backoff for transient 503/429 spikes
async function callGeminiWithRetry(params: any, retries = 3): Promise<any> {
  let lastError: any;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      lastError = err;
      const isTransient =
        err?.status === 503 ||
        err?.status === 429 ||
        err?.message?.includes('503') ||
        err?.message?.includes('429') ||
        err?.message?.includes('high demand') ||
        err?.message?.includes('UNAVAILABLE') ||
        err?.message?.includes('RESOURCE_EXHAUSTED');

      if (isTransient && attempt < retries - 1) {
        const delay = Math.pow(2, attempt) * 1000 + Math.random() * 500;
        console.warn(`Transient Gemini issue (attempt ${attempt + 1}/${retries}). Retrying in ${Math.round(delay)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw lastError;
}

// Health check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Life Admin Autopilot', timestamp: new Date().toISOString() });
});

// Document Analysis Endpoint
app.post('/api/analyze-document', async (req: Request, res: Response) => {
  try {
    const {
      text,
      fileBase64,
      mimeType = 'image/jpeg',
      title = 'Uploaded Document',
      typeHint = 'other',
      currency = '₹',
      language = 'en',
    } = req.body;

    if (!text && !fileBase64) {
      return res.status(400).json({ error: 'Please provide either document text or a document file.' });
    }

    const sanitizedText = text ? redactSensitiveData(text) : '';

    const systemPrompt = `You are "Life Admin Autopilot", a hyper-competent fintech and legal explainer engine.
Your purpose: Help regular people (young professionals, freelancers, families, students) understand confusing documents (insurance policies, bills, rent/lease contracts, loan terms, subscriptions, warranties) in 10 SECONDS.

CRITICAL RULES:
1. Translate legal and corporate jargon into crystal-clear plain human language.
2. The 5-line summary must be exactly 5 bullet points, simple words, highly actionable.
3. Hunt aggressively for RED FLAGS: hidden fees, auto-renewal traps, duplicate charges, unfair penalties, room-rent capping, proportional deductions, steep notice periods.
4. Extract all strict calendar deadlines and due dates.
5. List "What's NOT covered / watch out for" exclusions clearly.
6. Estimate any money savings potential in currency ${currency}.
7. If the language requested is 'hi', provide the plainSummary and redFlags explanations in clear, accessible Hindi (or Hinglish), while keeping titles bilingual. Otherwise provide in crisp English.`;

    const userPrompt = `Analyze this document. Document Name: "${title}", Category Hint: "${typeHint}".
Language: ${language}. Currency: ${currency}.
${sanitizedText ? `Document Extracted Text:\n"""\n${sanitizedText}\n"""` : 'Document is provided in the attached file/image.'}

Return a valid JSON object matching the required schema.`;

    const contents: any[] = [];
    if (fileBase64) {
      contents.push({
        inlineData: {
          mimeType: mimeType,
          data: fileBase64.replace(/^data:[^;]+;base64,/, ''),
        },
      });
    }
    contents.push({ text: userPrompt });

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            documentType: {
              type: Type.STRING,
              description: 'insurance, bill, rent_agreement, loan, subscription, warranty, other',
            },
            providerName: { type: Type.STRING },
            plainSummary: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactly 5 lines of plain-language summary without jargon',
            },
            keyFacts: {
              type: Type.OBJECT,
              properties: {
                amounts: { type: Type.ARRAY, items: { type: Type.STRING } },
                dates: { type: Type.ARRAY, items: { type: Type.STRING } },
                coverage: { type: Type.ARRAY, items: { type: Type.STRING } },
                limits: { type: Type.ARRAY, items: { type: Type.STRING } },
                penalties: { type: Type.ARRAY, items: { type: Type.STRING } },
                noticePeriods: { type: Type.ARRAY, items: { type: Type.STRING } },
              },
            },
            notCovered: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "What is NOT covered or major exclusions and watch-outs",
            },
            redFlags: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  severity: { type: Type.STRING, description: 'low, medium, or high' },
                  clauseQuote: { type: Type.STRING, description: 'Exact quote or reference from doc' },
                },
                required: ['title', 'explanation', 'severity'],
              },
            },
            suggestedActions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  deadline: { type: Type.STRING },
                  actionType: { type: Type.STRING, description: 'cancel, dispute, renew, calendar, negotiate' },
                },
                required: ['title', 'description'],
              },
            },
            extractedDeadlines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  dueDate: { type: Type.STRING, description: 'YYYY-MM-DD or standard readable date' },
                  daysNoticeRequired: { type: Type.INTEGER },
                  description: { type: Type.STRING },
                  urgency: { type: Type.STRING, description: 'high, medium, low' },
                },
                required: ['title', 'dueDate'],
              },
            },
            estimatedSavingsPotential: {
              type: Type.NUMBER,
              description: 'Estimated numeric savings amount in user currency',
            },
            keyTakeaway: {
              type: Type.STRING,
              description: 'One punchy sentence bottom line for the user',
            },
          },
          required: [
            'title',
            'documentType',
            'providerName',
            'plainSummary',
            'keyFacts',
            'notCovered',
            'redFlags',
            'suggestedActions',
            'extractedDeadlines',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyzing document:', error);
    res.status(500).json({
      error: 'Failed to analyze document',
      details: error?.message || 'Gemini processing error',
    });
  }
});

// Grounded Document Q&A Endpoint
app.post('/api/ask-document', async (req: Request, res: Response) => {
  try {
    const { documentContext, question, documentTitle } = req.body;

    if (!documentContext || !question) {
      return res.status(400).json({ error: 'Document context and question are required.' });
    }

    const systemPrompt = `You are a strict, grounded AI document assistant for the document "${documentTitle || 'Uploaded Document'}".
CRITICAL GROUNDING RULES:
1. Answer the user's question STRICTLY and SOLELY using the facts and clauses present in the provided document context.
2. If the user's question asks about something that is NOT mentioned, NOT covered, or ambiguous in this document, you MUST explicitly state:
"This information is not specified in the uploaded document."
3. Do NOT make outside assumptions, do not invent clauses, and do not offer speculative general advice without explicitly noting it is not in the document.
4. Keep answers concise, clear, and cite the relevant section or fact where applicable.`;

    const userPrompt = `Document Context:
"""
${redactSensitiveData(documentContext)}
"""

User Question: "${question}"`;

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.2, // low temperature for strict grounding
      },
    });

    res.json({ answer: response.text || 'No answer generated.' });
  } catch (error: any) {
    console.error('Error answering document question:', error);
    res.status(500).json({
      error: 'Failed to answer question',
      details: error?.message || 'Gemini processing error',
    });
  }
});

// Action Assistant Draft Generator
app.post('/api/generate-action-draft', async (req: Request, res: Response) => {
  try {
    const {
      documentTitle,
      providerName,
      draftType, // 'cancellation_email' | 'complaint_letter' | 'refund_request' | 'dispute_letter' | 'renewal_negotiation'
      issueDetails,
      userTone = 'polite_firm', // 'polite_firm' | 'formal_legal' | 'direct'
      senderName = 'Account Holder',
      accountNumber = '[MY_ACCOUNT_NUMBER]',
      currency = '₹',
    } = req.body;

    const systemPrompt = `You are the "Life Admin Action Assistant". You draft sharp, legally informed, and highly persuasive correspondence on behalf of consumers dealing with institutions (insurance companies, landlords, telecom/utilities, gyms, subscription vendors).

Draft Type: ${draftType}
Tone: ${userTone} (polite_firm: civil but resolute; formal_legal: mentions consumer protection and contract rights; direct: succinct, no fluff)
Currency: ${currency}

Produce:
1. An irresistible, clear Subject line
2. A ready-to-send Body with placeholders clearly bracketed like [Date], [Policy Number], etc.
3. Recommended recipient email or department (e.g. "grievance-officer@provider.com", "billing-support@...")
4. 2-3 key leverage points for why the consumer will win this case.`;

    const userPrompt = `Document: "${documentTitle}"
Provider: "${providerName || 'Provider'}"
Draft Type: ${draftType}
Sender: "${senderName}"
Account/Reference: "${accountNumber}"
Context & Problem: "${issueDetails || 'Disputing unfair fee and requesting immediate correction.'}"`;

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            subject: { type: Type.STRING },
            body: { type: Type.STRING },
            recipientHint: { type: Type.STRING },
            keyLeveragePoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['subject', 'body', 'recipientHint', 'keyLeveragePoints'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error generating action draft:', error);
    res.status(500).json({
      error: 'Failed to generate draft',
      details: error?.message || 'Gemini processing error',
    });
  }
});

// Bank Statement / Subscriptions Watchdog Analyzer
app.post('/api/analyze-statement', async (req: Request, res: Response) => {
  try {
    const { statementText, currency = '₹' } = req.body;

    if (!statementText) {
      return res.status(400).json({ error: 'Statement text or CSV content is required.' });
    }

    const sanitized = redactSensitiveData(statementText);

    const systemPrompt = `You are the "Subscription & Charges Watchdog" for Life Admin Autopilot.
Analyze bank statement rows or pasted transactions.
Find:
1. Recurring monthly/annual subscription charges (OTT, gyms, SaaS, cloud storage, broadband).
2. Sneaky price increases (e.g. charge went from ₹649 to ₹799).
3. Duplicate charges (e.g. paying for two cloud storage services, duplicate bill charges on same day).
4. Unused or high-risk subscriptions with auto-renewal traps.
5. Calculate potential monthly savings in currency ${currency}.`;

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: sanitized,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            detectedSubscriptions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  frequency: { type: Type.STRING, description: 'monthly or annual' },
                  category: { type: Type.STRING },
                  status: {
                    type: Type.STRING,
                    description: 'active, price_hiked, duplicate, unused_risk',
                  },
                  riskNote: { type: Type.STRING },
                  lastChargedDate: { type: Type.STRING },
                  suggestedAction: { type: Type.STRING },
                },
                required: ['name', 'amount', 'frequency', 'status', 'riskNote'],
              },
            },
            totalMonthlySpend: { type: Type.NUMBER },
            potentialMonthlySavings: { type: Type.NUMBER },
            insights: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: [
            'detectedSubscriptions',
            'totalMonthlySpend',
            'potentialMonthlySavings',
            'insights',
          ],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json({ success: true, data: parsed });
  } catch (error: any) {
    console.error('Error analyzing statement:', error);
    res.status(500).json({
      error: 'Failed to analyze statement',
      details: error?.message || 'Gemini processing error',
    });
  }
});

// Multi-turn Gemini Chatbot Endpoint
app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages, documentSummaryContext } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const systemInstruction = `You are "Autopilot Legal & Policy Copilot", a high-level consumer protection advisor for Life Admin Autopilot.
Your role:
- Help users analyze, dispute, and navigate bills, insurance policies, rent agreements, subscription traps, and deadlines.
- Answer user queries in clear, approachable, jargon-free advice.
- When relevant, cite consumer rights standards (like fair wear and tear for security deposits, proportional deduction caveats in health insurance, and notice requirements).
- Be supportive, concise, and structured with bullet points.
${documentSummaryContext ? `\nUser's Current Stored Documents Context:\n"""\n${redactSensitiveData(documentSummaryContext)}\n"""` : ''}`;

    const formattedContents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: redactSensitiveData(m.content) }],
    }));

    const response = await callGeminiWithRetry({
      model: 'gemini-3.8-flash',
      contents: formattedContents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({
      role: 'assistant',
      content: response.text || 'I could not generate a response. Please try again.',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    const isDemandError =
      error?.message?.includes('high demand') ||
      error?.message?.includes('503') ||
      error?.status === 503;
    if (isDemandError) {
      return res.json({
        role: 'assistant',
        content:
          'The AI model is experiencing a temporary surge in traffic. Please retry in a few moments, or review the fine-print clauses highlighted in your Document Vault.',
        timestamp: new Date().toISOString(),
      });
    }
    res.status(500).json({
      error: 'Failed to process chat message',
      details: error?.message || 'Gemini processing error',
    });
  }
});

// Reminder delivery simulation / trigger
app.post('/api/send-reminder-notification', (req: Request, res: Response) => {
  const { title, dueDate, urgency, channel = 'in_app' } = req.body;
  const deliveryId = 'notif_' + Math.random().toString(36).substring(2, 9);
  res.json({
    success: true,
    deliveryId,
    status: 'Delivered',
    channel,
    timestamp: new Date().toISOString(),
    message: `Reminder for "${title}" scheduled for ${dueDate} has been dispatched successfully via ${channel}.`,
  });
});

// Vite middleware mounting in development or static serving in production
async function startServer() {
  const http = await import('http');
  const server = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : { server },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Life Admin Autopilot server running on port ${PORT}`);
  });
}

startServer();
