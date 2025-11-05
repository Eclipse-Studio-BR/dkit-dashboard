# dKit Partners Dashboard - Design Guidelines

## Design Approach
**Reference-Based Approach**: Dark dashboard aesthetic matching the provided screenshot exactly, with inspiration from modern fintech/analytics platforms prioritizing data clarity and professional polish.

## Visual Identity

### Color Palette
- **Background**: Deep charcoal gradient (darker at top → slightly lighter at bottom)
- **Surfaces**: Card panels with soft border radius and subtle inner shadows
- **Accent**: Bright purple for chart strokes, highlights, and active navigation states
- **Text**: Off-white for primary content, cool gray for secondary information
- **Status Indicators**: Small green/red chevrons for positive/negative percentage changes
- **State Dots**: Green for "Completed", red for "Terminated" transaction status

### Typography
- **Page Titles**: "dKiT Partners Dashboard" (exact spelling), left-aligned
- **KPI Numbers**: Large, prominent display with tabular-nums for clean alignment
- **Secondary Values**: Tiny subtext style (e.g., "~ 13.4578 BTC")
- **Labels**: Clear hierarchy between primary and helper text
- **Helper Text**: Smaller, muted gray for form guidance

## Layout System

### Spacing Primitives
Use Tailwind spacing units: **2, 4, 6, 8, 12, 16** for consistent rhythm throughout the application.

### Core Layout Structure
- **Sidebar**: Left vertical navigation (fixed width), icons + labels, active item highlighted with purple pill background
- **Main Content**: Right-side content area with proper padding from sidebar
- **Responsive Breakpoint**: Sidebar collapses to icon-only rail at ≤1024px
- **Container**: Proper content width constraints for readability

## Component Library

### Navigation Components
- **Sidebar Items**: Dashboard, Wallet, Settings, Support (top to bottom)
- **Active State**: Purple pill background highlighting current page
- **Icons**: Consistent size and alignment with labels

### Dashboard Components

**Top KPIs Section (2 cards)**
- Total Volume (USD) - large prominent number
- Affiliate Fees Earned (USD) - large prominent number
- Each includes: tiny secondary line showing BTC equivalent, eye/hide icon for masking values

**Chart Block**
- Title: "Market Overview"
- Metric Toggle: [Fees | Volume] pills (default to Fees)
- Time Range Tabs: 1D, 7D, 1M, 3M, All (horizontal pills, default 7D)
- Chart: Single purple line/area series with gradient fill
- Tooltip: Value display with small green/red delta badge

**Latest Transactions Table**
- Columns: Asset/Route, Time, Amount (e.g., "+0.431 BTC"), USD notional (subtext), Status (with colored dot)
- 4+ example rows for visual balance
- Horizontal scroll on mobile if needed

### Form Components

**Onboarding Wizard (3-step)**
- Step 1 - Basics: Project Name, Project Logo upload UI, dApp link
- Step 2 - Payouts: Bitcoin address field with helper text
- Step 3 - Tracking IDs: THORName, MayaName, Chainflip address with helper text
- Navigation: Back / Continue buttons; Finish leads to Dashboard

**Input Fields**
- Clear labels above inputs
- Inline validation error messages (red text below field)
- Helper text in muted gray below inputs
- Focus states visible against dark background

**Address Display**
- Masked format: prefix…suffix
- Reveal button to show full address
- Copy button for clipboard functionality

### Cards & Surfaces
- Soft border radius for modern feel
- Subtle inner shadow for depth
- Consistent padding matching screenshot proportions

## Accessibility Requirements
- **Contrast**: Sufficient contrast for all text and icons against dark background
- **Focus States**: Clearly visible focus indicators for keyboard navigation
- **Keyboard Navigation**: Full keyboard support for sidebar and tabs
- **Number Formatting**: Tabular-nums for clean alignment in tables and KPIs

## Responsive Behavior
- **Desktop (>1024px)**: Full sidebar with labels, multi-column layouts
- **Tablet/Mobile (≤1024px)**: Icon-only sidebar rail, single-column layouts
- **Tables**: Horizontal scroll on mobile when needed
- **Touch Targets**: Adequate size for mobile interactions

## Empty States
- **Dashboard (no data)**: "We're waiting for your first trades. Add your THOR/Maya/Chainflip IDs in Settings to start tracking."
- **Wallet (no BTC)**: "Add a Bitcoin address to receive monthly affiliate payouts."

## Page-Specific Requirements
- **/login**: Email, Password, "Sign in" button, link to onboarding
- **/wallet**: Bitcoin address form, Save/Copy/Reveal buttons
- **/settings**: Project details + Tracking IDs forms with Save button
- **/support**: Minimal FAQ + contact mailto link

## Interaction Patterns
- Metric toggle switches chart series and highlights corresponding KPI
- Range tabs filter time-series data display
- Hide/reveal icons toggle value masking on KPIs
- Smooth transitions between states (minimal, not distracting)