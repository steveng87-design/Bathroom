# Bathroom Quote Saver.AI - Product Requirements Document

## Overview
AI-powered bathroom renovation quoting application for Australian contractors. Generates accurate quotes, professional PDF proposals, and legally compliant contracts.

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

### 4. Email Service
- SendGrid integration for quote delivery
- PDF attachments
- **Fixed (Dec 2025)**: Professional email template without emojis

### 5. Frontend Email Body (Share feature)
- **Fixed (Dec 2025)**: Clean professional text without emojis
- Simple format: "Dear [Client], Please find the attached scope of works..."

### 6. Project Management
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
- `/api/quotes/request` - Generate AI quote
- `/api/quotes/{id}` - Get quote
- `/api/quotes/{id}/generate-proposal` - Generate proposal PDF
- `/api/quotes/{id}/generate-quote-summary` - Generate summary PDF
- `/api/contracts/generate` - Generate contract
- `/api/contracts/list` - List contracts
- `/api/contracts/{id}/approve` - Approve contract
- `/api/suppliers/{component}` - Get material suppliers

## Recent Bug Fixes (December 2025)

### Fixed Issues
1. **Contract PDF HTML Tags** - Replaced HTML `<b>` tags with ReportLab ParagraphStyle for proper bold rendering
2. **Quote PDF HTML Tags in Tables** - Removed `<b>` tags from table cells, using TableStyle for styling instead
3. **Measurement Formatting** - Added mm-to-m conversion and `.2f` formatting for room dimensions
4. **Backend Email Content** - Rewrote email template with professional language, removed emojis
5. **Frontend Email Body** - Cleaned up share email text, removed all emojis, simplified to professional format

## Upcoming Tasks

### P1 - Multi-Area Quote Review
Test and validate multi-area quoting system for accuracy and seamless operation

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

## Test Coverage
- Test file: `/app/backend/tests/test_pdf_and_email_fixes.py`
- 13 tests covering quote generation, PDF formatting, contract generation, email service
