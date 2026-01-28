Project Context: Destination Cocktails Manager Dashboard (PWA)
1. Project Overview
Name: Destination Cocktails Manager Dashboard
Type: Progressive Web App (PWA)
Target Users: Bar owners and managers
Goal: Mobile-optimized dashboard for managing inventory, prices, orders, and viewing analytics in real-time.
2. Tech Stack
Frontend
Framework: Next.js 14 (App Router)
Language: TypeScript (Strict mode)
UI Library: ShadCN UI + Tailwind CSS
State Management: TanStack Query (React Query v5)
Real-time: EventSource API (Server-Sent Events)
Charts: Recharts
Forms: React Hook Form + Zod validation
Icons: Lucide React
Notifications: Sonner (Toast library)
Backend Integration
API: RESTful API (Go/Fiber backend)
Authentication: WhatsApp OTP (6-digit code)
Session: JWT tokens in HTTP-only cookies
Real-time Events: SSE endpoint (/api/admin/events)
Deployment
Platform: Railway (alongside Go backend)
Build: Static export or standalone server
PWA: Service worker for offline capability
Mobile: Responsive design (mobile-first)
3. Project Structure
web/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx          # WhatsApp OTP login
│   │   └── verify/
│   │       └── page.tsx          # OTP verification
│   ├── (dashboard)/
│   │   ├── layout.tsx            # Dashboard layout with nav
│   │   ├── page.tsx              # Home (Live Operations Feed)
│   │   ├── stock/
│   │   │   └── page.tsx          # Inventory Management
│   │   └── reports/
│   │       └── page.tsx          # Analytics
│   └── api/
│       └── proxy/                # Optional: API proxy routes
├── components/
│   ├── ui/                       # ShadCN components
│   ├── dashboard/
│   │   ├── order-card.tsx
│   │   ├── product-grid.tsx
│   │   ├── stock-adjuster.tsx
│   │   └── analytics-chart.tsx
│   └── layout/
│       ├── navbar.tsx
│       └── bottom-nav.tsx        # Mobile navigation
├── lib/
│   ├── api.ts                    # API client functions
│   ├── auth.ts                   # Auth utilities
│   ├── sse.ts                    # SSE hook
│   └── utils.ts                  # Utility functions
├── hooks/
│   ├── use-orders.ts             # TanStack Query hooks
│   ├── use-products.ts
│   └── use-analytics.ts
├── types/
│   └── index.ts                  # TypeScript types
└── public/
    ├── manifest.json             # PWA manifest
    └── service-worker.js         # Service worker
4. Core Features
4.1 Authentication (WhatsApp OTP)
Login Flow
User enters phone number (e.g., +254712345678)
Backend sends 6-digit OTP via WhatsApp
User enters OTP code
Backend verifies and returns JWT token
Token stored in HTTP-only cookie
Security
OTP expires in 5 minutes
Rate limiting: 3 OTP requests per 15 minutes
JWT expires in 7 days
Auto-logout on token expiry
4.2 Live Operations Feed (Home Tab)
Features
Real-time Orders: New orders appear instantly via SSE
Status Indicators:
🟡 PENDING (awaiting payment)
🟢 PAID (payment confirmed)
✅ COMPLETED (bar staff marked done)
🔴 FAILED (payment failed)
Order Details:
Pickup code (4-digit)
Items list with quantities
Total amount
Customer phone
Timestamp
UI Components
<OrderCard
  pickupCode="1234"
  status="PAID"
  items={[{ name: "Tusker", quantity: 2, price: 300 }]}
  total={600}
  customerPhone="+254712345678"
  createdAt="2026-01-23T17:00:00Z"
/>
Real-time Updates
// SSE hook
const { orders } = useSSE('/api/admin/events', {
  onNewOrder: (order) => {
    toast.success(`New order #${order.pickupCode}`);
    playNotificationSound();
  },
  onOrderCompleted: (orderId) => {
    // Update order status in UI
  }
});
4.3 Inventory Management (Stock Tab)
Features
Product Grid: Cards with emoji categories (🍺, 🥃, 🍷)
Quick Stock Adjustment: +/- buttons
Price Editor: Tap-to-edit inline
Optimistic UI: Changes appear green immediately
Search & Filter: By category or name
Low Stock Alerts: Red badge if stock < 5
UI Components
<ProductCard
  id="uuid"
  name="Tusker"
  category="Beer"
  emoji="🍺"
  price={150}
  stock={20}
  onStockChange={(newStock) => updateStock(id, newStock)}
  onPriceChange={(newPrice) => updatePrice(id, newPrice)}
/>
Optimistic Updates
const { mutate: updateStock } = useMutation({
  mutationFn: (data) => api.updateStock(data.id, data.stock),
  onMutate: async (newData) => {
    // Optimistic update (turn green)
    await queryClient.cancelQueries(['products']);
    const previous = queryClient.getQueryData(['products']);
    queryClient.setQueryData(['products'], (old) => 
      old.map(p => p.id === newData.id ? { ...p, stock: newData.stock } : p)
    );
    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(['products'], context.previous);
    toast.error('Failed to update stock');
  }
});
4.4 Analytics (Reports Tab)
Metrics (Cards at Top)
Today's Sales: Total revenue today
Today's Orders: Number of orders today
Best Seller: Top product by quantity sold today
Average Order Value: Total revenue / total orders
30-Day Revenue Chart
Type: Line chart
Data: Daily revenue for last 30 days
Library: Recharts
Top Products Table
Columns: Product Name, Quantity Sold, Revenue
Period: Last 30 days
Sorting: By revenue (descending)
5. API Integration
Base Configuration
// lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const api = {
  // Auth
  requestOTP: (phone: string) => 
    fetch(`${API_BASE_URL}/api/admin/auth/request-otp`, {
      method: 'POST',
      body: JSON.stringify({ phone }),
      credentials: 'include'
    }),
  
  verifyOTP: (phone: string, code: string) =>
    fetch(`${API_BASE_URL}/api/admin/auth/verify-otp`, {
      method: 'POST',
      body: JSON.stringify({ phone, code }),
      credentials: 'include'
    }),
  
  // Products
  getProducts: () => 
    fetch(`${API_BASE_URL}/api/admin/products`, { credentials: 'include' }),
  
  updateStock: (id: string, stock: number) =>
    fetch(`${API_BASE_URL}/api/admin/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ stock_quantity: stock }),
      credentials: 'include'
    }),
  
  updatePrice: (id: string, price: number) =>
    fetch(`${API_BASE_URL}/api/admin/products/${id}/price`, {
      method: 'PATCH',
      body: JSON.stringify({ price }),
      credentials: 'include'
    }),
  
  // Orders
  getOrders: (filters?: { status?: string, limit?: number }) =>
    fetch(`${API_BASE_URL}/api/admin/orders?${new URLSearchParams(filters)}`, {
      credentials: 'include'
    }),
  
  // Analytics
  getAnalytics: () =>
    fetch(`${API_BASE_URL}/api/admin/analytics/overview`, { credentials: 'include' }),
  
  getRevenueTrend: () =>
    fetch(`${API_BASE_URL}/api/admin/analytics/revenue`, { credentials: 'include' }),
  
  getTopProducts: () =>
    fetch(`${API_BASE_URL}/api/admin/analytics/top-products`, { credentials: 'include' })
};
6. Real-time (SSE)
SSE Hook
// lib/sse.ts
export function useSSE(endpoint: string, handlers: {
  onNewOrder?: (order: Order) => void;
  onOrderCompleted?: (orderId: string) => void;
  onStockUpdate?: (productId: string, newStock: number) => void;
  onPriceUpdate?: (productId: string, newPrice: number) => void;
}) {
  useEffect(() => {
    const eventSource = new EventSource(endpoint, { withCredentials: true });
    
    eventSource.addEventListener('new_order', (e) => {
      const order = JSON.parse(e.data);
      handlers.onNewOrder?.(order);
    });
    
    eventSource.addEventListener('order_completed', (e) => {
      const { order_id } = JSON.parse(e.data);
      handlers.onOrderCompleted?.(order_id);
    });
    
    eventSource.addEventListener('stock_updated', (e) => {
      const { product_id, stock } = JSON.parse(e.data);
      handlers.onStockUpdate?.(product_id, stock);
    });
    
    eventSource.addEventListener('price_updated', (e) => {
      const { product_id, price } = JSON.parse(e.data);
      handlers.onPriceUpdate?.(product_id, price);
    });
    
    return () => eventSource.close();
  }, [endpoint]);
}
7. TypeScript Types
// types/index.ts
export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'COMPLETED' | 'CANCELLED';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  image_url: string;
  is_active: boolean;
}

export interface Order {
  id: string;
  customer_phone: string;
  table_number: string;
  total_amount: number;
  status: OrderStatus;
  payment_method: string;
  payment_reference: string;
  pickup_code: string;
  items: OrderItem[];
  created_at: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price_at_time: number;
  product_name?: string; // Populated by backend
}

export interface Analytics {
  today_revenue: number;
  today_orders: number;
  best_seller: {
    name: string;
    quantity: number;
  };
  average_order_value: number;
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  order_count: number;
}

export interface TopProduct {
  product_name: string;
  quantity_sold: number;
  revenue: number;
}
8. UI/UX Design Principles
Mobile-First
Bottom Navigation: Home, Stock, Reports
Large Touch Targets: Minimum 44x44px
Swipe Gestures: Swipe to refresh orders
Visual Feedback
Optimistic Updates: Green flash on successful change
Loading States: Skeleton loaders
Error States: Red toast notifications
Success States: Green toast with checkmark
Performance
Lazy Loading: Load charts only when Reports tab is active
Image Optimization: Next.js Image component
Debounced Search: 300ms delay on search input
Virtual Scrolling: For long product lists (react-window)
Accessibility
ARIA Labels: All interactive elements
Keyboard Navigation: Tab through all controls
Color Contrast: WCAG AA compliant
Screen Reader: Semantic HTML
9. PWA Configuration
manifest.json
{
  "name": "Destination Cocktails Manager",
  "short_name": "DC Manager",
  "description": "Manage your bar inventory and orders",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#000000",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
Service Worker
Cache Strategy: Network-first for API, cache-first for static assets
Offline Fallback: Show cached data with "Offline" banner
Background Sync: Queue stock/price updates when offline
10. Environment Variables
# .env.local
NEXT_PUBLIC_API_URL=https://destination-cocktails-backend.railway.app
NEXT_PUBLIC_WS_URL=https://destination-cocktails-backend.railway.app
11. Deployment (Railway)
Build Configuration
// package.json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  }
}
Railway Settings
Build Command: npm run build
Start Command: npm run start
Port: 3000
Environment: Production
12. Key Differences from Bot Backend
AspectBot BackendDashboardUsersCustomers (thousands)Managers (few)AuthNone (phone-based sessions)WhatsApp OTP + JWTReal-timeRedis sessionsSSE eventsUIWhatsApp messagesWeb PWADataRead-heavy (menu browsing)Write-heavy (stock updates)DeploymentGo service on RailwayNext.js on Railway
13. Development Workflow
Local Development
Start Go backend: go run cmd/server/main.go
Start Next.js: cd web && npm run dev
Access dashboard: http://localhost:3000
API proxies to: http://localhost:8080
Testing
Unit Tests: Vitest for utilities
Component Tests: React Testing Library
E2E Tests: Playwright for critical flows
API Mocking: MSW (Mock Service Worker)