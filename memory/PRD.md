# Bathroom Quote Saver.AI - Product Requirements Document

## Overview
AI-powered bathroom renovation quoting application for Australian contractors. Generates accurate quotes, professional PDF proposals, legally compliant contracts, and tax invoices for progress claims.

## Core Features

### 1. AI Quote Generation
- Uses OpenAI GPT-4o for intelligent cost estimation
- Component-based pricing (demolition, framing, plumbing, electrical, plastering, waterproofing, tiling, fit-off)
- Room measurements with automatic area calculations
- Client information management
- Learning system for personalized pricing adjustments

### 2. PDF Generation
- Professional proposal PDFs with company branding
- Quote summary PDFs with cost breakdowns
- Combined proposal packages
- **Fixed (Dec 2025)**: Proper measurement formatting with mm-to-m conversion
- **Fixed (Dec 2025)**: Removed HTML tags from table cells - uses TableStyle for bold text

### 3. Contract Generation System
- Sequential contract numbering
- Customizable payment schedules (default: 10/40/30/20%)
- NSW-compliant terms and conditions
- Digital signature support
- **Fixed (Dec 2025)**: Bold text rendering using ReportLab ParagraphStyle

### 4. Invoicing System (NEW - Dec 2025)
- **Progress Claims UI**: Click on contract payment stages to generate invoices
- **Sequential Numbering**: INV-YYYY-NNN format (e.g., INV-2026-001)
- **Professional Tax Invoice PDF**: GST breakdown, bank transfer details
- **Invoice Status Tracking**: Draft → Sent → Paid/Partial/Overdue
- **Partial Payment Support**: Track multiple payments against one invoice
- **Email Delivery**: Send invoice PDFs to clients
- **Dashboard Stats**: Total invoices, Sent, Paid, Outstanding amounts

### 5. Email Service
- SendGrid integration for quote and invoice delivery
- PDF attachments
- **Fixed (Dec 2025)**: Professional email template without emojis

### 6. Frontend Email Body (Share feature)
- **Fixed (Dec 2025)**: Clean professional text without emojis
- Simple format: "Dear [Client], Please find the attached scope of works..."

### 7. Project Management
- Save and organize projects by category
- Load previous quotes for editing
- Project history and tracking

## Technical Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI
- **Backend**: Python FastAPI
- **Database**: MongoDB
- **AI**: OpenAI GPT-4o via emergentintegrations
- **PDF**: ReportLab library
- **Email**: SendGrid

## API Endpoints

### Quotes
- `/api/quotes/request` - Generate AI quote
- `/api/quotes/{id}` - Get quote
- `/api/quotes/{id}/generate-proposal` - Generate proposal PDF
- `/api/quotes/{id}/generate-quote-summary` - Generate summary PDF

### Contracts
- `/api/contracts/generate` - Generate contract
- `/api/contracts/list` - List contracts
- `/api/contracts/{id}/approve` - Approve contract
- `/api/contracts/{id}/invoice-status` - Get invoice status for payment stages

### Invoices (NEW)
- `/api/invoices/create-from-stage` - Create invoice from contract payment stage
- `/api/invoices/create-manual` - Create manual invoice
- `/api/invoices/list` - List all invoices
- `/api/invoices/{id}` - Get specific invoice
- `/api/invoices/{id}/pdf` - Download invoice PDF
- `/api/invoices/{id}/status` - Update invoice status
- `/api/invoices/{id}/send` - Send invoice via email
- `/api/invoices/{id}/record-payment` - Record partial payment
- `/api/invoices/next-number` - Get next invoice number
- `/api/invoices/by-contract/{id}` - Get invoices for a contract

### Other
- `/api/suppliers/{component}` - Get material suppliers

## Recent Updates (December 2025)

### New Feature: Invoicing System
- Complete invoice management for progress claims
- Click-to-invoice from contract payment stages
- Professional tax invoice PDFs with GST breakdown
- Bank transfer payment details
- Invoice status tracking and payment recording

### Bug Fixes
1. **Contract PDF HTML Tags** - Replaced HTML `<b>` tags with ReportLab ParagraphStyle
2. **Quote PDF HTML Tags in Tables** - Removed `<b>` tags from table cells
3. **Measurement Formatting** - Added mm-to-m conversion and `.2f` formatting
4. **Backend Email Content** - Professional language, removed emojis
5. **Frontend Email Body** - Clean text without emojis

## Upcoming Tasks

### P1 - Bank Details Configuration
Configure environment variables for bank details to appear on invoices:
- BANK_NAME
- BANK_ACCOUNT_NAME
- BANK_BSB
- BANK_ACCOUNT_NUMBER

### P1 - Multi-Area Quote Review
Test and validate multi-area quoting system for accuracy

### P1 - Advanced Supplier Pricing
- Parse supplier PDF price lists
- Web scraping for real-time pricing (e.g., Bunnings)
- Dynamic pricing engine for AI

## Technical Debt

### Critical Refactoring Needed
- **App.js** (5000+ lines) - Break into smaller components:
  - ContractGenerator.js
  - SavedContractsView.js
  - ProfilePage.js
  - QuoteForm.js
  - QuoteResults.js
  - InvoicesView.js

## Test Coverage
- `/app/backend/tests/test_pdf_and_email_fixes.py` - 13 tests
- `/app/backend/tests/test_invoice_system.py` - 17 tests

## Environment Variables Required
```
# Database
MONGO_URL=mongodb://localhost:27017
DB_NAME=bathroom_quote_db

# Email (Optional)
SENDGRID_API_KEY=your_key
SENDER_EMAIL=noreply@yourdomain.com

# Bank Details for Invoices (Optional)
BANK_NAME=Commonwealth Bank
BANK_ACCOUNT_NAME=Your Business Name
BANK_BSB=XXX-XXX
BANK_ACCOUNT_NUMBER=XXXXXXXX
```

## Mocked Functionality
- **Email Sending**: When SendGrid not configured, invoices are marked as "sent" but not actually emailed
- **Bank Details**: Placeholder values shown on invoice PDFs when env vars not configured
