// TypeScript type definitions matching Go backend structs
// All field names use snake_case to match Go JSON tags exactly

// ============================================================================
// Auth & User Types
// ============================================================================

export interface AdminUser {
    id: string
    phone_number: string
    name: string
    role: string // OWNER, MANAGER, STAFF
    is_active: boolean
    created_at: string
}

export interface OTPCode {
    id: string
    phone_number: string
    code: string
    expires_at: string
    verified: boolean
    created_at: string
}

// ============================================================================
// Product Types
// ============================================================================

export interface Product {
    id: string
    name: string
    description: string
    price: number
    category: string
    stock_quantity: number
    image_url: string
    is_active: boolean
}

// ============================================================================
// Order Types
// ============================================================================

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'COMPLETED' | 'CANCELLED'

export interface Order {
    id: string
    user_id: string
    customer_phone: string
    table_number: string
    total_amount: number
    status: OrderStatus
    payment_method: string
    payment_reference: string
    pickup_code: string
    items: OrderItem[]
    created_at: string
}

export interface OrderItem {
    id: string
    order_id: string
    product_id: string
    quantity: number
    price_at_time: number
    product_name: string // Populated by backend via JOIN
}

// ============================================================================
// Analytics Types
// ============================================================================

export interface Analytics {
    today_revenue: number
    today_orders: number
    best_seller: BestSeller
    average_order_value: number
}

export interface BestSeller {
    name: string
    quantity: number
}

export interface RevenueTrend {
    date: string
    revenue: number
    order_count: number
}

export interface TopProduct {
    product_name: string
    quantity_sold: number
    revenue: number
}

// ============================================================================
// API Response Types
// ============================================================================

export interface AuthMeResponse {
    user_id: string
    phone: string
    name: string
    role: string
}

export interface MessageResponse {
    message: string
}

export interface ErrorResponse {
    error: string
}
