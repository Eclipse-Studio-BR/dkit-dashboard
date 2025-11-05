# dKit Partners Dashboard

## Overview
A dark-themed partner dashboard for managing affiliate tracking, payouts, and performance metrics across decentralized finance protocols (THORChain, Maya Protocol, Chainflip).

## Project Status
**Current Phase**: ✅ MVP Complete - Production Ready
- ✅ Schema & data models defined
- ✅ Dark theme design system configured with purple accents
- ✅ All React components and pages built with shadcn/ui
- ✅ Backend API implementation complete
- ✅ Integration & testing complete
- ✅ Security: bcrypt password hashing implemented
- ✅ Time-range filtering functional
- ✅ Form hydration working correctly
- 🚀 Ready for deployment

## Architecture

### Tech Stack
- **Framework**: React + TypeScript with Wouter routing
- **Styling**: Tailwind CSS with dark gradient theme
- **UI Components**: shadcn/ui (Sidebar, Forms, Cards, Charts)
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for time-series visualization
- **Data Fetching**: TanStack Query v5
- **Backend**: Express.js with session-based authentication
- **Storage**: In-memory storage (MemStorage pattern)
- **Security**: bcryptjs for password hashing

### Key Features
1. **Authentication**: Email/password with bcrypt hashing, session-based auth
2. **Onboarding**: 3-step wizard (Project basics, Bitcoin payout address, Tracking IDs)
3. **Dashboard**: 
   - KPIs with hide/reveal (Total Volume, Affiliate Fees with BTC equivalent)
   - Purple gradient time-series chart with metric toggle (Fees/Volume)
   - Time range filtering (1D/7D/1M/3M/All)
   - Top Routes cards with percentage changes
   - Latest Transactions table
4. **Wallet**: Bitcoin payout address management with masking/reveal/copy
5. **Settings**: Project details and tracking IDs configuration
6. **Support**: FAQ and contact information

### Data Model
```typescript
User: { id, email, password (bcrypt hashed), role, projectId }
Project: { id, name, logoUrl?, dappUrl, btcAddress?, thorName?, mayaName?, chainflipAddress? }
MetricPoint: { id, projectId, t, volumeUsd, feesUsd, trades }
Transaction: { id, projectId, ts, route, usdNotional, feeUsd, status, txHash, chain }
```

## Design System

### Color Palette
- **Background**: Deep charcoal gradient (#0f0f11 → #151518)
- **Accent**: Bright purple (#a855f7) for charts, highlights, active states
- **Text**: Off-white primary, muted gray secondary/tertiary
- **Status**: Green for positive/completed, red for negative/terminated
- **Cards**: Elevated backgrounds with subtle borders

### Typography
- **Font**: Inter
- **Hierarchy**: Bold titles (24px), medium headings (16px), tabular numbers for metrics
- **KPIs**: Large bold numbers with smaller muted labels

### Components
- **Sidebar**: shadcn sidebar in icon-collapsible mode with purple active state
- **KPI Cards**: Hide/reveal functionality with animated Eye icons
- **Chart**: Purple gradient area chart with tooltips and grid lines
- **Tables**: Transaction table with status indicators and hover states
- **Forms**: Inline validation with proper error messages

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account with project (hashes password with bcrypt)
- `POST /api/auth/login` - Authenticate user (compares with bcrypt)
- `POST /api/auth/logout` - Destroy session
- `GET /api/auth/me` - Get current user

### Data
- `GET /api/me` - Current user and project data
- `PATCH /api/project` - Update project details
- `GET /api/metrics?from=ISO&to=ISO` - Time-series metrics filtered by date range
- `GET /api/transactions` - Latest transactions

## Security Features
- **Password Hashing**: All passwords hashed with bcryptjs (cost factor 10)
- **Session Management**: Express session with secret key
- **Protected Routes**: All /api/* routes require authentication
- **Password Exclusion**: Password field never sent to frontend

## Development Notes
- All components use shadcn/ui patterns with proper accessibility
- Form validation uses Zod schemas from shared/schema.ts
- Forms hydrate using React Hook Form `values` prop for existing data
- Charts use purple accent (#a855f7) with gradient fills
- Time-range filtering sends ISO date params to backend
- Mock data seeded for 30 days of metrics and 4-8 transactions
- Responsive design: sidebar collapses to icons, charts adapt

## Recent Changes (2025-11-05)

### Initial Build
- Defined complete schema with User, Project, MetricPoint, Transaction models
- Configured dark theme with deep charcoal gradient background
- Built all UI components and pages with shadcn/ui primitives
- Replaced custom sidebar with shadcn Sidebar component (icon-collapsible mode)

### Backend Implementation
- Implemented in-memory storage with MemStorage pattern
- Created all API endpoints with proper session authentication
- Added bcrypt password hashing for security
- Seeded 30 days of mock metrics data and sample transactions

### Integration & Polish
- Connected frontend to backend APIs using React Query
- Implemented time-range filtering with ISO date params
- Fixed form hydration using `values` prop for wallet and settings
- Tested complete user journey: register → onboarding → dashboard → wallet/settings
- Achieved architect approval for production readiness

## Operational Notes
- **Session Secret**: Managed via SESSION_SECRET environment variable
- **Mock Data**: Currently seeds 30 days (can extend to 90/365 for longer ranges)
- **Password Security**: bcrypt cost factor 10 (can tune for production load)
- **In-Memory Storage**: Data resets on server restart (expected for MVP)

## Next Steps for Production
1. Extend metrics seeding to 90-day/365-day windows for differentiated analytics
2. Execute end-to-end smoke test in deployed environment
3. Consider persistent storage (PostgreSQL) for production data
4. Add session secret rotation strategy
5. Implement proper logging and monitoring
6. Add rate limiting for API endpoints
