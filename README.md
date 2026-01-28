# Destination Cocktails Manager Dashboard

A Progressive Web App (PWA) for managing bar inventory, viewing live orders, and accessing analytics.

## Features

- 🔐 **WhatsApp OTP Authentication** - Secure login via WhatsApp
- 📱 **Mobile-First PWA** - Installable on mobile devices
- 🔴 **Live Order Feed** - Real-time updates via Server-Sent Events
- 📦 **Inventory Management** - Quick stock adjustments with optimistic UI
- 💰 **Price Management** - Inline price editing
- 📊 **Analytics Dashboard** - Revenue trends and top products
- 🌙 **Dark Mode** - Optimized for bar environments

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **Real-time**: Server-Sent Events (SSE)
- **Charts**: Recharts
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend API running on `http://localhost:8080`

### Installation

```bash
cd web
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Build for Production

```bash
npm run build
npm start
```

## Usage

### Login

1. Enter your registered phone number (e.g., `254700000000` for test admin)
2. Receive OTP code via WhatsApp (test admin uses `123456`)
3. Enter the 6-digit code to login

### Dashboard Features

#### Home Tab - Live Orders
- View all orders in real-time
- See order status, pickup codes, and items
- Automatic updates when new orders arrive

#### Stock Tab - Inventory
- Adjust stock levels with +/- buttons
- Edit prices by clicking on the price
- View products grouped by category
- Low stock alerts for items < 5

#### Reports Tab - Analytics
- Today's sales and order count
- Best-selling product
- Average order value
- 30-day revenue trend chart
- Top 10 products by revenue

## Project Structure

```
web/
├── app/
│   ├── (auth)/
│   │   ├── login/          # Login page
│   │   └── verify/         # OTP verification
│   ├── dashboard/
│   │   ├── layout.tsx      # Dashboard layout with nav
│   │   ├── page.tsx        # Live orders feed
│   │   ├── stock/          # Inventory management
│   │   └── reports/        # Analytics
│   ├── layout.tsx          # Root layout
│   ├── providers.tsx       # React Query provider
│   └── globals.css         # Global styles
├── lib/
│   ├── api.ts             # API client
│   ├── sse.ts             # SSE hook
│   └── utils.ts           # Utility functions
├── types/
│   └── index.ts           # TypeScript types
└── public/
    └── manifest.json      # PWA manifest
```

## API Integration

The dashboard connects to the Go backend API:

- `POST /api/admin/auth/request-otp` - Request OTP
- `POST /api/admin/auth/verify-otp` - Verify OTP
- `GET /api/admin/products` - Get products
- `PATCH /api/admin/products/:id/stock` - Update stock
- `PATCH /api/admin/products/:id/price` - Update price
- `GET /api/admin/orders` - Get orders
- `GET /api/admin/analytics/overview` - Get metrics
- `GET /api/admin/analytics/revenue` - Get revenue trend
- `GET /api/admin/analytics/top-products` - Get top products
- `GET /api/admin/events` - SSE stream

## PWA Installation

On mobile devices:
1. Open the dashboard in your browser
2. Tap "Add to Home Screen"
3. The app will install and can be launched like a native app

## License

Private - Dumu Technologies
