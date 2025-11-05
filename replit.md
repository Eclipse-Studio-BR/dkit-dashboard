# dKiT Partners Dashboard

## Overview
A dark-themed partner dashboard for managing affiliate tracking, payouts, and performance metrics across decentralized finance protocols (THORChain, Maya Protocol, Chainflip).

## Project Status
**Current Phase**: MVP Development - Frontend Complete
- ✅ Schema & data models defined
- ✅ Dark theme design system configured
- ✅ All React components and pages built
- ⏳ Backend API implementation pending
- ⏳ Integration & testing pending

## Architecture

### Tech Stack
- **Framework**: React + TypeScript with Wouter routing
- **Styling**: Tailwind CSS with dark theme
- **UI Components**: shadcn/ui
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts for time-series visualization
- **Data Fetching**: TanStack Query
- **Backend**: Express.js with in-memory storage

### Key Features
1. **Authentication**: Email/password registration and login
2. **Onboarding**: 3-step wizard (Project basics, Bitcoin payout address, Tracking IDs)
3. **Dashboard**: KPIs, purple-accent time-series chart, top routes, latest transactions
4. **Wallet**: Bitcoin payout address management with masking/reveal
5. **Settings**: Project details and tracking IDs configuration
6. **Support**: FAQ and contact information

### Data Model
```typescript
User: { id, email, password, role, projectId }
Project: { id, name, logoUrl?, dappUrl, btcAddress?, thorName?, mayaName?, chainflipAddress? }
MetricPoint: { id, projectId, t, volumeUsd, feesUsd, trades }
Transaction: { id, projectId, ts, route, usdNotional, feeUsd, status, txHash, chain }
```

## Design System

### Color Palette
- **Background**: Deep charcoal gradient (#0f0f11 → #151518)
- **Accent**: Bright purple (#a855f7) for charts, highlights, active states
- **Text**: Off-white primary, muted gray secondary
- **Status**: Green for positive/completed, red for negative/terminated

### Typography
- **Font**: Inter
- **Hierarchy**: Bold titles, tabular numbers for metrics, clear label/value distinction

### Components
- Sidebar navigation with purple pill active state
- KPI cards with hide/reveal functionality
- Purple gradient area chart with tooltips
- Transaction table with status indicators
- Form inputs with inline validation

## API Endpoints (Pending Implementation)

### Authentication
- `POST /api/auth/register` - Create account with project
- `POST /api/auth/login` - Authenticate user

### Data
- `GET /api/me` - Current user and project data
- `PATCH /api/project` - Update project details
- `GET /api/metrics?from=&to=&granularity=` - Time-series metrics
- `GET /api/transactions?limit=` - Latest transactions

## Development Notes
- All components use shadcn/ui patterns with proper accessibility
- Form validation uses Zod schemas from shared/schema.ts
- Charts use purple accent (#a855f7) with gradient fills
- Responsive: sidebar, chart, tables adapt to mobile
- Empty states guide users to add tracking IDs

## Recent Changes (2025-01-05)
- Defined complete schema with User, Project, MetricPoint, Transaction models
- Configured dark theme with deep charcoal gradient background
- Built all UI components: KpiCard, MetricToggle, TimeRangeTabs, TimeSeriesChart, TransactionsTable, TopRoutes, AddressBadge
- Created all pages: Login, Onboarding (3 steps), Dashboard, Wallet, Settings, Support
- Implemented AppLayout with sidebar navigation
- Added ProtectedRoute wrapper for authentication
- Set up routing with wouter

## Next Steps
1. Implement backend storage and API endpoints
2. Add session management and authentication
3. Seed mock data for metrics and transactions
4. Connect frontend to backend APIs
5. Test complete user flow
6. Deploy application
