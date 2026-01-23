// Core types matching backend models

export type OrderStatus = 'PENDING' | 'PAID' | 'FAILED' | 'COMPLETED' | 'CANCELLED'

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

export interface Order {
    id: string
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
    product_id: string
    quantity: number
    price_at_time: number
    product_name?: string
}

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

export interface AdminUser {
    user_id: string
    phone: string
    name: string
    role: string
}
