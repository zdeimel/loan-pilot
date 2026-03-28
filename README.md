# LoanPilot

> **TurboTax for mortgages** — a consumer-friendly, guided mortgage application experience with a full loan officer dashboard.

LoanPilot is a production-quality Next.js frontend that makes mortgage applications feel simple, intelligent, and reassuring. Built with a TurboTax-style step-by-step flow, AI assistant, URLA-compliant data model, and a full loan officer CRM dashboard.

---

## Product Concept

The mortgage process is fragmented and intimidating. LoanPilot reimagines it as a guided, conversational experience:

1. **Borrowers** complete a structured step-by-step application with plain-English guidance
2. **Documents** are uploaded and verified with AI-assisted extraction
3. **Pre-qualification results** show affordability, matched products, and next steps
4. **Loan officers** manage their full pipeline via a polished CRM dashboard

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Components | Custom shadcn-style UI components |
| Forms | React Hook Form + Zod |
| State | Zustand (persisted) |
| Charts | Recharts |
| Animations | CSS keyframes via Tailwind |
| Mock Data | Static seed data in `/src/lib/mock-data` |

---

## Routes & Pages

| Route | Description |
|-------|-------------|
| `/` | Marketing landing page |
| `/how-it-works` | Product transparency / process explainer |
| `/apply` | Application start / loan type selection |
| `/apply/[step]` | TurboTax-style guided step (12 steps) |
| `/results` | Pre-qualification results with loan product matching |
| `/dashboard` | Loan officer overview / pipeline dashboard |
| `/dashboard/borrowers` | Borrower list with search and status filters |
| `/dashboard/borrowers/[id]` | Full borrower profile with tabs |
| `/dashboard/scenarios` | Side-by-side loan product scenario calculator |
| `/dashboard/documents` | Document management center |
| `/dashboard/messages` | Borrower-LO messaging with AI drafting |
| `/settings` | Loan officer profile and preferences |

---

## Application Flow Steps

The borrower application is broken into 12 guided steps, each with validation, "why we ask" context, and autosave:

1. `loan-goal` — Purchase / Refinance / Pre-approval / Cash-out
2. `personal-info` — Name, DOB, contact, address, marital status
3. `co-borrower` — Solo or joint application
4. `employment` — Current employer, income, employment type
5. `other-income` — Rental, pension, alimony, etc.
6. `assets` — Checking, savings, retirement, investment accounts
7. `liabilities` — Debts with DTI live calculation
8. `real-estate` — Other properties owned
9. `property` — Subject property details, type, use, purchase price
10. `down-payment` — Funds to close, gift funds
11. `declarations` — URLA yes/no declarations
12. `review` — Full summary with edit links, then submit

---

## Component Structure

```
src/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout with Inter font
│   ├── globals.css               # Tailwind base + custom utilities
│   ├── page.tsx                  # Landing page
│   ├── how-it-works/
│   ├── apply/
│   │   ├── page.tsx              # Loan type selection
│   │   └── [step]/page.tsx       # Dynamic step router
│   ├── results/page.tsx          # Pre-qual results
│   ├── dashboard/
│   │   ├── page.tsx              # LO overview
│   │   ├── borrowers/
│   │   │   ├── page.tsx          # Pipeline table
│   │   │   └── [id]/page.tsx     # Borrower detail tabs
│   │   ├── scenarios/page.tsx    # Loan comparison calculator
│   │   ├── documents/page.tsx    # Document center
│   │   └── messages/page.tsx     # Messaging center
│   └── settings/page.tsx
├── components/
│   ├── ui/                       # Base UI components (Button, Card, Badge, etc.)
│   ├── shared/
│   │   ├── navbar.tsx            # Multi-variant navigation
│   │   └── ai-assistant-widget.tsx  # Floating AI chat
│   └── application/
│       ├── step-layout.tsx       # Shared step wrapper (progress, nav buttons)
│       ├── progress-sidebar.tsx  # Desktop step sidebar
│       └── steps/               # Individual step components
│           ├── loan-goal.tsx
│           ├── personal-info.tsx
│           ├── co-borrower.tsx
│           ├── employment.tsx
│           ├── assets.tsx
│           ├── liabilities.tsx
│           ├── property.tsx
│           ├── declarations.tsx
│           ├── review.tsx
│           └── generic.tsx      # Stub for unimplemented steps
├── lib/
│   ├── types/index.ts            # Full TypeScript data model (URLA-aligned)
│   ├── mock-data/index.ts        # Sample borrowers, applications, LO data
│   ├── store/applicationStore.ts # Zustand store with persistence
│   └── utils.ts                  # Formatters, helpers, mock qual engine
```

---

## Data Model

Based on URLA (Fannie Mae Form 1003) concepts:

- `LoanApplication` — Top-level application container
- `BorrowerPersonalInfo` — Name, DOB, SSN, contact, address, citizenship
- `Employment` — Employer, income, start date, employment type
- `OtherIncome` — Rental, pension, alimony, SS, disability
- `Asset` — Checking, savings, retirement, stocks, gift funds
- `Liability` — Auto, student, credit card, mortgage, child support
- `RealEstateOwned` — Other properties with mortgage and rental details
- `SubjectProperty` — The target property with type, use, and price
- `LoanDetails` — Purpose, amount, down payment, product, term
- `Declarations` — URLA yes/no questions
- `QualificationResult` — Score, affordability range, matched products

---

## Mock Data

Seed data in `/src/lib/mock-data/index.ts` includes:

- **Sarah Mitchell** — Purchase application, 72% complete, conventional 30-yr
- **Marcus Thompson** — Refinance, fully submitted
- **Priya Patel** — FHA pre-approval, just started
- **David Chen** — Loan officer with full pipeline
- Pre-qualification result for Sarah with qualification score, products, and insights

---

## Running Locally

```bash
cd loan-pilot
npm install
npm run dev
```

Then open [http://localhost:3000](http://localhost:3000).

**Key demo flows:**
1. `/` → landing page with full marketing copy
2. `/apply` → select loan type → walk through application steps
3. `/results` → see pre-qualification results and loan product matches
4. `/dashboard` → loan officer pipeline overview
5. `/dashboard/borrowers/app-001` → full borrower profile with AI insights

---

## Future Integrations

Integration points are marked with comments throughout the codebase. Key areas:

| Feature | Integration Point |
|---------|------------------|
| Authentication | Replace dummy auth in `navbar.tsx` with Auth.js or Supabase Auth |
| Database | Replace mock data with Supabase/Postgres via Prisma |
| Document OCR | Integrate AWS Textract or Google Document AI in document upload |
| AI Assistant | Connect to Claude API for real responses |
| Credit Pull | Integrate with Experian/Equifax/TransUnion API |
| Loan Product Pricing | Connect to Optimal Blue, Polly, or lender API |
| LOS Integration | Webhook bridge to Encompass, BytePro, or other LOS |
| E-Sign | Integrate DocuSign or HelloSign for disclosure signing |
| Notifications | Push notifications via Resend/SendGrid + FCM |

---

## Design System

- **Primary color:** `pilot-600` (#2563eb — blue)
- **Background:** `slate-50`
- **Card radius:** `rounded-2xl`
- **Shadows:** Custom `shadow-card`, `shadow-card-hover`, `shadow-elevated`
- **Typography:** Inter (variable font)
- **Animations:** `animate-fade-in`, `animate-slide-up`, `animate-slide-in-right`
- **Components:** Fully custom shadcn-inspired component library

---

## License

Internal / prototype. Not for production use without backend integration, security audit, and regulatory compliance review.
