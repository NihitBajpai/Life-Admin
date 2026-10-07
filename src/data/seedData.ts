import { AppDocument, DeadlineItem, SubscriptionItem } from '../types';

export const SEED_DOCUMENTS: AppDocument[] = [
  {
    id: 'doc-seed-1',
    title: 'Star Care Comprehensive Health Policy',
    documentType: 'insurance',
    providerName: 'Star Care Assurance Ltd',
    uploadDate: '2026-10-01',
    expiryDate: '2026-11-12',
    tags: ['Health', 'Insurance', 'Hospitalization', 'TPA'],
    keyTakeaway: 'Great ₹10 Lakh sum insured, but contains an aggressive room rent cap that penalizes total doctor fees if exceeded.',
    plainSummary: [
      'Covers emergency and planned hospitalization up to ₹10,00,000 for you and your spouse.',
      'You must pay the first ₹25,000 deductible out-of-pocket every policy year before claims kick in.',
      'Pre-existing conditions (like hypertension or diabetes) are completely excluded for the first 36 continuous months.',
      'Room rent is strictly capped at 1% (₹10,000/day); booking an executive suite triggers severe proportional cuts on your entire bill!',
      'Annual renewal is due on 12 Nov 2026; paying on time preserves your ₹2,50,000 accrued No-Claim Bonus discount.',
    ],
    keyFacts: {
      amounts: ['₹10,00,000 Sum Insured', '₹25,000 Annual Deductible', '₹18,450 Premium Paid'],
      dates: ['Start: 12 Nov 2025', 'Expiry: 12 Nov 2026', 'Grace Period: 30 days post expiry'],
      coverage: ['Inpatient care', 'Day-care procedures (140+ surgeries)', '60-day pre & 90-day post hospitalization'],
      limits: ['Room Rent: Max ₹10,000/day (1%)', 'ICU: Max ₹20,000/day (2%)', 'Cataract Surgery: ₹40,000 cap per eye'],
      penalties: ['20% co-payment applied automatically for treatment at non-empaneled hospitals', 'Forfeiture of NCB on delayed renewal'],
      noticePeriods: ['Cashless pre-auth: 48 hours prior', 'Emergency admission: 24 hours from admission'],
    },
    notCovered: [
      'Pre-existing illnesses during the first 36 months of continuous active coverage.',
      'Outpatient (OPD) doctor consultations, general pharmacy bills, and routine health checks.',
      'Alternative medicine (Ayurveda/Homeopathy) outside government-recognized institutions.',
      'Vitamins, tonics, and external medical devices unless integral to surgery.',
    ],
    redFlags: [
      {
        title: 'Proportional Deduction Penalty Clause',
        explanation: 'If you choose a hospital room above ₹10,000/day (e.g. ₹15,000/day), the insurer will cut 33% off ALL surgical, diagnostic, and doctor consultation fees, not just the room rent gap.',
        severity: 'high',
        clauseQuote: 'Clause 4.2: If the Insured occupies a room category higher than 1% of Sum Insured, the Company will apply proportional deduction to all associated medical expenses.',
      },
      {
        title: '3-Year Pre-Existing Disease Lockout',
        explanation: 'You cannot claim for any condition you had prior to signing until November 2028.',
        severity: 'high',
        clauseQuote: 'Section B.3: A mandatory waiting period of 36 months shall apply for all pre-existing conditions.',
      },
      {
        title: '20% Non-Network Co-Payment',
        explanation: 'If you get admitted in a hospital outside their network, you must pay 1/5th of the entire bill yourself.',
        severity: 'medium',
        clauseQuote: 'Endorsement 7: A 20% co-pay shall be levied on all claims settled on a reimbursement basis at non-network hospitals.',
      },
    ],
    suggestedActions: [
      {
        title: 'Instruct Hospital Desk on Room Limit',
        description: 'Always specify standard single private room at or under ₹10,000/day to prevent proportional deduction penalties.',
        actionType: 'calendar',
      },
      {
        title: 'Renew Before 12 Nov 2026',
        description: 'Pay renewal premium 7 days in advance to lock in ₹2,50,000 accumulated No-Claim Bonus (NCB).',
        deadline: '2026-11-12',
        actionType: 'renew',
      },
      {
        title: 'Request Co-pay Waiver Endorsement',
        description: 'Draft a message to your insurance agent asking for a quote to eliminate the 20% non-network co-pay clause.',
        actionType: 'negotiate',
      },
    ],
    extractedDeadlines: [
      {
        title: 'Policy Renewal & NCB Preservation Due',
        dueDate: '2026-11-12',
        daysNoticeRequired: 7,
        description: 'Payment required to avoid policy lapse and loss of 36-month waiting period credit.',
        urgency: 'high',
      },
    ],
    estimatedSavingsPotential: 12500,
    rawTextPreview: `STAR CARE COMPREHENSIVE HEALTH POLICY
Policy Number: SC-882910-2025
Insured: Primary + Spouse
Sum Insured: INR 10,00,000
Deductible: INR 25,000 per policy period
Inception: 12-Nov-2025 | Expiry: 12-Nov-2026
Room Rent Limit: 1% of Sum Insured per day. Proportional deduction applies to all associated medical expenses if exceeded.
Waiting Period for Pre-Existing Diseases: 36 consecutive months.
Co-payment: 20% on reimbursement claims at non-network hospitals.
Pre-authorization notification: 48 hours for planned, 24 hours for emergency.`,
  },
  {
    id: 'doc-seed-2',
    title: 'Airtel Fiber & Postpaid Family Bundle Bill',
    documentType: 'bill',
    providerName: 'Bharti Airtel Telecommunications',
    uploadDate: '2026-10-02',
    expiryDate: '2026-10-12',
    tags: ['Telecom', 'Broadband', 'Mobile', 'Recurring'],
    keyTakeaway: 'Bill total is ₹2,476; includes an unrequested ₹199 gaming pack and a ₹200 silent plan hike post promotional expiry.',
    plainSummary: [
      'Total amount payable is ₹2,476 for 300 Mbps broadband + two postpaid SIM connections.',
      'Your broadband base plan silently increased by ₹200 this month because introductory pricing expired.',
      'A "Cloud Gaming & OTT Pack" for ₹199/month was added to line #2 without explicit SMS confirmation.',
      'A late payment penalty of ₹250 + 2% monthly interest will be applied if not cleared by 12 Oct.',
      'Due date is 12 Oct 2026 (in 5 days). Paying now avoids late penalties and broadband throttling.',
    ],
    keyFacts: {
      amounts: ['Total Due: ₹2,476', 'Broadband: ₹1,899', 'Cloud Gaming Add-on: ₹199', 'Late Fee: ₹250', 'GST (18%): ₹378'],
      dates: ['Bill Date: 01 Oct 2026', 'Due Date: 12 Oct 2026', 'Next Cycle: 01 Nov 2026'],
      coverage: ['300 Mbps unlimited optical fiber', 'Unlimited local/STD calling', '150GB pooled postpaid mobile data'],
      limits: ['Broadband Fair Usage Policy: 3,333 GB per billing cycle', '100 free SMS per day'],
      penalties: ['₹250 late payment surcharge after 12 Oct', 'Service suspension after 7 days overdue'],
      noticePeriods: ['15 days written notice required prior to next billing date for plan downgrade or cancellation'],
    },
    notCovered: [
      'International roaming charges (billed as separate pay-as-you-go).',
      'In-app purchases on third-party OTT applications.',
      'Router relocation or technician home visits for premises re-wiring (₹500 visit fee).',
    ],
    redFlags: [
      {
        title: 'Unrequested ₹199/mo Cloud Gaming Add-On',
        explanation: 'Line #2 shows an activated "Airtel Cloud Gaming Pack" costing ₹199 + 18% GST that you never requested.',
        severity: 'high',
        clauseQuote: 'VAS Breakdown: Cloud Gaming Booster (Line 9876543210) - INR 199.00',
      },
      {
        title: 'Post-Promotional Plan Price Escalation',
        explanation: 'The 6-month introductory ₹200 broadband discount has expired, raising your base bill without email warning.',
        severity: 'medium',
        clauseQuote: 'Plan Charges: Airtel Xstream Fiber 300M (Standard Commercial Rate) - INR 1,899.00',
      },
      {
        title: 'Steep ₹250 Late Payment Surcharge',
        explanation: 'Missing payment by even 1 day incurs a flat ₹250 penalty plus 24% annualized interest.',
        severity: 'medium',
        clauseQuote: 'Payment Terms: Late fee of INR 250 shall be levied on any unpaid balance as of 23:59 hrs on due date.',
      },
    ],
    suggestedActions: [
      {
        title: 'Dispute ₹199 Gaming Add-On via Action Assistant',
        description: 'Send our pre-drafted refund request to Airtel billing for automatic reversal of unauthorized VAS charges.',
        actionType: 'refund',
      },
      {
        title: 'Pay ₹2,476 Before Oct 12',
        description: 'Clear the invoice to avoid ₹250 late fee and preserve uninterrupted fiber connection.',
        deadline: '2026-10-12',
        actionType: 'calendar',
      },
      {
        title: 'Negotiate Annual Loyalty Discount',
        description: 'Request a retention plan discount or switch to annual advance payment for 15% discount.',
        actionType: 'negotiate',
      },
    ],
    extractedDeadlines: [
      {
        title: 'Airtel Telecom & Fiber Payment Due Date',
        dueDate: '2026-10-12',
        daysNoticeRequired: 1,
        description: 'Pay before midnight to prevent ₹250 surcharge and service disruption.',
        urgency: 'high',
      },
    ],
    estimatedSavingsPotential: 2820,
    rawTextPreview: `BHARTI AIRTEL LIMITED - POSTPAID & FIBER INVOICE
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
Cancellation: Requires 15 days written notice before cycle close.`,
  },
  {
    id: 'doc-seed-3',
    title: 'Residential 11-Month Apartment Lease Agreement',
    documentType: 'rent_agreement',
    providerName: 'Landlord: Rajiv Mehta / Greenview Apts',
    uploadDate: '2026-09-28',
    expiryDate: '2026-12-14',
    tags: ['Rent', 'Lease', 'Landlord', 'Security Deposit', 'Notice'],
    keyTakeaway: 'Requires strict 60-day written notice (deadline Oct 15) and has an unfair 1-month mandatory painting deduction.',
    plainSummary: [
      'Monthly rent is ₹32,000 due by the 5th of each month, with ₹1,00,000 refundable security deposit.',
      'You are bound by a 6-month lock-in period; moving out early forfeits your entire ₹1,00,000 deposit.',
      'You MUST give exactly 60 days advance written notice before moving out; verbal notice is completely void.',
      'If you renew for another 11 months, rent automatically increases by 10% (an extra ₹3,200 every month).',
      'Landlord included a clause deducting 1 full month of rent (₹32,000) for "repainting", regardless of actual wall condition.',
    ],
    keyFacts: {
      amounts: ['Monthly Rent: ₹32,000', 'Security Deposit: ₹1,00,000', 'Maintenance: ₹4,200/month', 'Late fee: ₹500/day after 5th'],
      dates: ['Commencement: 15 Jan 2026', 'Expiry: 14 Dec 2026', '60-day Notice Cutoff: 15 Oct 2026'],
      coverage: ['Apartment 402, Greenview Heights (2BHK)', 'One covered basement car parking slot'],
      limits: ['Purely residential use only', 'No structural modifications or wall drilling without written consent'],
      penalties: ['Total deposit forfeiture if vacated within 6-month lock-in', '₹500 per day penalty for late rent'],
      noticePeriods: ['60 calendar days formal written notice prior to vacation required by either party'],
    },
    notCovered: [
      'Society clubhouse membership fees (tenant to pay directly to HOA).',
      'Internal plumbing repairs beyond the first 15 days of occupancy.',
      'Major AC compressor replacement caused by electrical voltage fluctuations.',
    ],
    redFlags: [
      {
        title: 'Unfair Mandatory 1-Month Painting Deduction',
        explanation: 'Clause 9 mandates deducting ₹32,000 from your security deposit for repainting even if walls have zero damage beyond standard fair wear and tear.',
        severity: 'high',
        clauseQuote: 'Clause 9: The Licensor shall deduct one month of license fee towards repainting and cleaning expenses at the time of final refund.',
      },
      {
        title: 'Strict 60-Day Notice Trap',
        explanation: 'Notice must be provided 60 full days before 14 Dec (by 15 Oct). If you notify on 16 Oct, you are legally liable for an extra full month of rent.',
        severity: 'high',
        clauseQuote: 'Clause 12: Notice of vacation must be served in writing minimum 60 days prior to expiry. Delayed notice shall extend liability by 30 days.',
      },
      {
        title: 'Aggressive 10% Annual Rent Escalation',
        explanation: 'Standard metro residential escalations are 5-7%. A 10% bump increases your annual rent burden by ₹38,400.',
        severity: 'medium',
        clauseQuote: 'Clause 3: Should the agreement be renewed for a further term, the monthly license fee shall automatically escalate by 10%.',
      },
    ],
    suggestedActions: [
      {
        title: 'Submit 60-Day Vacation Notice by Oct 15',
        description: 'Send formal written notice via email and WhatsApp to the landlord by 15 Oct 2026 to guarantee your full deposit refund.',
        deadline: '2026-10-15',
        actionType: 'calendar',
      },
      {
        title: 'Dispute Painting Deduction with Action Assistant',
        description: 'Use our dispute letter draft to challenge the mandatory ₹32,000 deduction using consumer tenancy fair-wear-and-tear standards.',
        actionType: 'dispute',
      },
      {
        title: 'Counter-Offer 5% Rent Escalation',
        description: 'If you want to stay, send a renewal negotiation letter offering 5% escalation instead of the landlord’s 10%.',
        actionType: 'negotiate',
      },
    ],
    extractedDeadlines: [
      {
        title: '60-Day Move-Out Written Notice Deadline',
        dueDate: '2026-10-15',
        daysNoticeRequired: 60,
        description: 'Must notify Rajiv Mehta in writing to prevent penalty and extra rent liability.',
        urgency: 'high',
      },
      {
        title: 'Lease Agreement Expiry & Deposit Return',
        dueDate: '2026-12-14',
        daysNoticeRequired: 0,
        description: 'Handover inspection and full ₹1,00,000 security deposit reconciliation.',
        urgency: 'medium',
      },
    ],
    estimatedSavingsPotential: 32000,
    rawTextPreview: `LEAVE AND LICENSE AGREEMENT
Between: Rajiv Mehta (Licensor) and Tenant (Licensee)
Premises: Flat No. 402, Greenview Heights
Term: 11 Months commencing 15-Jan-2026 and terminating 14-Dec-2026.
Monthly License Fee: INR 32,000 payable on or before 5th of each month. Late fee INR 500/day.
Security Deposit: INR 1,00,000 interest-free refundable.
Lock-in Period: 6 months.
Notice Period: 60 calendar days written notice.
Deduction: One month license fee (INR 32,000) shall be deducted for painting and sanitization upon vacation.
Escalation: 10% on renewal.`,
  },
];

export const SEED_DEADLINES: DeadlineItem[] = [
  {
    id: 'dl-1',
    documentId: 'doc-seed-2',
    documentTitle: 'Airtel Fiber & Postpaid Bill',
    title: 'Airtel Fiber & Telecom Due Date',
    dueDate: '2026-10-12',
    daysNoticeRequired: 1,
    description: 'Avoid ₹250 penalty and broadband speed throttling.',
    urgency: 'high',
    completed: false,
    remindAt30Days: false,
    remindAt7Days: true,
    remindAt1Day: true,
    lastDeliveryStatus: 'Delivered',
  },
  {
    id: 'dl-2',
    documentId: 'doc-seed-3',
    documentTitle: 'Apartment Lease Agreement',
    title: '60-Day Move-Out Notice Cutoff',
    dueDate: '2026-10-15',
    daysNoticeRequired: 60,
    description: 'Send formal written email to landlord to preserve security deposit.',
    urgency: 'high',
    completed: false,
    remindAt30Days: true,
    remindAt7Days: true,
    remindAt1Day: true,
    lastDeliveryStatus: 'Scheduled',
  },
  {
    id: 'dl-3',
    documentId: 'doc-seed-1',
    documentTitle: 'Star Care Health Policy',
    title: 'Health Insurance Annual Renewal',
    dueDate: '2026-11-12',
    daysNoticeRequired: 7,
    description: 'Renew before expiry to retain ₹2.5 Lakh No-Claim Bonus and waiting period.',
    urgency: 'high',
    completed: false,
    remindAt30Days: true,
    remindAt7Days: true,
    remindAt1Day: true,
    lastDeliveryStatus: 'Scheduled',
  },
  {
    id: 'dl-4',
    documentTitle: 'Custom Life Admin Task',
    title: 'Gym Membership Auto-Renewal Cancellation',
    dueDate: '2026-10-25',
    daysNoticeRequired: 30,
    description: 'Cult.fit requires 30 days prior notice to cancel recurring ₹2,499 auto-debit.',
    urgency: 'medium',
    completed: false,
    remindAt30Days: true,
    remindAt7Days: true,
    remindAt1Day: true,
    lastDeliveryStatus: 'Scheduled',
  },
  {
    id: 'dl-5',
    documentId: 'doc-seed-3',
    documentTitle: 'Apartment Lease Agreement',
    title: 'Lease Expiry & Security Deposit Settlement',
    dueDate: '2026-12-14',
    daysNoticeRequired: 15,
    description: 'Physical inspection walkthrough and claim deposit back.',
    urgency: 'medium',
    completed: false,
    remindAt30Days: true,
    remindAt7Days: true,
    remindAt1Day: true,
    lastDeliveryStatus: 'Scheduled',
  },
];

export const SEED_SUBSCRIPTIONS: SubscriptionItem[] = [
  {
    id: 'sub-1',
    name: 'Netflix Premium 4K',
    amount: 799,
    frequency: 'monthly',
    category: 'Entertainment',
    status: 'price_hiked',
    riskNote: 'Sneaky price increase! Plan jumped from ₹649 to ₹799/month without clear user prompt.',
    renewalDate: '2026-10-18',
    suggestedAction: 'Downgrade to Standard 1080p (₹499) to save ₹300/month.',
  },
  {
    id: 'sub-2',
    name: 'Cult.fit Elite Gym',
    amount: 2499,
    frequency: 'monthly',
    category: 'Fitness',
    status: 'unused_risk',
    riskNote: 'Auto-renews every month. Zero gym check-ins detected in past 42 days.',
    renewalDate: '2026-10-25',
    suggestedAction: 'Pause membership for 60 days or cancel with 1-click draft.',
  },
  {
    id: 'sub-3',
    name: 'Google One 2TB Cloud Storage',
    amount: 650,
    frequency: 'monthly',
    category: 'Cloud Storage',
    status: 'duplicate',
    riskNote: 'Duplicate cloud charge: You already receive 1TB OneDrive via your Microsoft 365 bundle.',
    renewalDate: '2026-11-04',
    suggestedAction: 'Downgrade Google One to 100GB (₹130/mo) and save ₹520/month.',
  },
  {
    id: 'sub-4',
    name: 'Spotify Premium Duo',
    amount: 149,
    frequency: 'monthly',
    category: 'Music',
    status: 'active',
    riskNote: 'Active daily usage. Healthy price-to-value ratio.',
    renewalDate: '2026-10-29',
  },
  {
    id: 'sub-5',
    name: 'Disney+ Hotstar Super',
    amount: 299,
    frequency: 'monthly',
    category: 'Entertainment',
    status: 'unused_risk',
    riskNote: 'Only accessed once during cricket tournament. Auto-renewing every month.',
    renewalDate: '2026-11-09',
    suggestedAction: 'Cancel recurring auto-renewal before next billing cycle.',
  },
  {
    id: 'sub-6',
    name: 'Airtel Cloud Gaming VAS Add-on',
    amount: 199,
    frequency: 'monthly',
    category: 'Telecom Add-on',
    status: 'duplicate',
    riskNote: 'Unauthorized VAS pack detected on broadband bill invoice.',
    renewalDate: '2026-10-12',
    suggestedAction: 'Dispute immediately via Action Assistant for full credit refund.',
  },
];
