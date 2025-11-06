# dKit Partners Dashboard

## Overview
A dark-themed partner dashboard for managing affiliate tracking, payouts, and performance metrics across decentralized finance protocols (THORChain, Maya Protocol, Chainflip).

## Project Status
**Current Phase**: ✅ MVP Complete - Production Ready
- ✅ Schema & data models defined
- ✅ Yellow accent theme (#FFE224) with iOS 17 frosted glass aesthetics
- ✅ All React components and pages built with shadcn/ui
- ✅ Backend API implementation complete
- ✅ Integration & testing complete
- ✅ Security: bcrypt password hashing, secure logo uploads
- ✅ Time-range filtering functional
- ✅ Form hydration working correctly
- ✅ Logo upload feature with object storage
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
   - 3 KPI cards with hide/reveal and independent timeframes (Total Volume, Affiliate Fees, Transactions)
   - Each KPI has timeframe selector (1D/7D/1M/3M/All), defaults to "All"
   - Yellow gradient time-series chart with metric toggle (Fees/Volume)
   - Time range filtering (1D/7D/1M/3M/All)
   - Top Routes cards with real crypto logos (BTC, ETH, SOL, RUNE)
   - Latest Transactions table with swap pairs, status indicators, explorer links
4. **Wallet**: Bitcoin payout address management with masking/reveal/copy
5. **Settings**: Project details, tracking IDs, and logo upload
6. **Logo Upload**: Secure file upload to Google Cloud Storage with per-project isolation
7. **Support**: FAQ and contact information

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
- `PATCH /api/project` - Update project details (with logo URL validation)
- `GET /api/metrics?from=ISO&to=ISO` - Time-series metrics filtered by date range
- `GET /api/transactions` - Latest transactions

### Object Storage
- `POST /api/upload-url` - Get presigned URL for logo upload (auth required)
- `GET /objects/:objectPath` - Serve uploaded files (auth required, path validated)

## Security Features
- **Password Hashing**: All passwords hashed with bcryptjs (cost factor 10)
- **Session Management**: Express session with secret key
- **Protected Routes**: All /api/* routes require authentication
- **Password Exclusion**: Password field never sent to frontend
- **Logo Upload Security**:
  - Per-project namespace isolation (`/objects/projects/<projectId>/logos/<uuid>`)
  - Path sanitization (blocks `..` traversal attacks)
  - Strict pattern matching with UUID validation
  - Regex injection prevention (escaped projectId)
  - Authenticated file access only
  - MIME type allowlist on client (PNG, JPG, SVG, WebP)

## Development Notes
- All components use shadcn/ui patterns with proper accessibility
- Form validation uses Zod schemas from shared/schema.ts
- Forms hydrate using React Hook Form `values` prop for existing data
- Charts use purple accent (#a855f7) with gradient fills
- Time-range filtering sends ISO date params to backend
- Mock data seeded for 30 days of metrics and 4-8 transactions
- Responsive design: sidebar collapses to icons, charts adapt

## Recent Changes (2025-11-06)

### Enhanced KPI Cards with Independent Timeframes
- Added third KPI card: "Transactions" showing transaction count
- Implemented individual timeframe selectors for each KPI (1D, 7D, 1M, 3M, All)
- All KPIs default to "All" timeframe on load
- Each KPI maintains independent state (changing one doesn't affect others)
- Updated grid layout to 3 columns (md:grid-cols-3)
- Separate API queries for each KPI's data (volumeData, feesData, transactionsData)
- Individual loading spinners appear on each card during refetch
- Transactions KPI displays formatted count (no BTC equivalent)
- Volume and Fees continue to show USD + BTC equivalent

### Logo Upload Feature
- Implemented secure file upload using Replit Object Storage (Google Cloud Storage)
- Created LogoUploader component with file validation (type, size)
- Added per-project namespace isolation for uploaded files
- Implemented path sanitization to prevent directory traversal attacks
- Added strict pattern matching with UUID validation
- Logo displays in sidebar footer as circular avatar
- Settings page integration with upload preview
- Security hardening:
  - Path traversal prevention (blocks `..` in paths)
  - Regex injection prevention (escaped projectId)
  - logoUrl validation on PATCH (must belong to user's project)
  - Sanitized paths used for all file operations
  - Uniform 403 responses (prevents info leakage)

### Design Updates
- Updated color scheme to yellow accent (#FFE224, soft yellow #FFF3A3)
- Implemented iOS 17-style frosted glass effects (backdrop-blur: 18px)
- Enhanced Top Routes with real crypto logos (BTC, ETH, SOL, RUNE)
- Expanded Latest Transactions table with swap pairs and status types
- Added dynamic chart titles ("Earnings Overview" / "Volume Overview")
- Transaction status types: Completed (green), Running (yellow spinner), Refunded (red)

## Previous Changes (2025-11-05)

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
- **In-Memory Storage**: Currently using MemStorage (data resets on server restart)
  - **Note**: DbStorage (PostgreSQL) is available but commented out in server/storage.ts
  - Switch to DbStorage when ready for persistent data across restarts
  - Neon database may auto-suspend after inactivity - use MemStorage for development

## Next Steps for Production
1. Extend metrics seeding to 90-day/365-day windows for differentiated analytics
2. Execute end-to-end smoke test in deployed environment
3. Consider persistent storage (PostgreSQL) for production data
4. Add session secret rotation strategy
5. Implement proper logging and monitoring
6. Add rate limiting for API endpoints
