import type { Product, Order, Analytics, RevenueTrend, TopProduct } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

async function fetchAPI(endpoint: string, options?: RequestInit) {
    const url = `${API_BASE_URL}${endpoint}`

    const response = await fetch(url, {
        ...options,
        credentials: 'include', // Include cookies for JWT
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    })

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new Error(error.error || `HTTP ${response.status}`)
    }

    return response.json()
}

// Auth API
export const authAPI = {
    requestOTP: async (phone: string) => {
        return fetchAPI('/api/admin/auth/request-otp', {
            method: 'POST',
            body: JSON.stringify({ phone }),
        })
    },

    verifyOTP: async (phone: string, code: string) => {
        return fetchAPI('/api/admin/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ phone, code }),
        })
    },

    logout: async () => {
        return fetchAPI('/api/admin/auth/logout', {
            method: 'POST',
        })
    },

    getMe: async (): Promise<any> => {
        return fetchAPI('/api/admin/auth/me')
    },
}

// Products API
export const productsAPI = {
    getAll: async (): Promise<Product[]> => {
        return fetchAPI('/api/admin/products')
    },

    updateStock: async (id: string, stock_quantity: number) => {
        return fetchAPI(`/api/admin/products/${id}/stock`, {
            method: 'PATCH',
            body: JSON.stringify({ stock_quantity }),
        })
    },

    updatePrice: async (id: string, price: number) => {
        return fetchAPI(`/api/admin/products/${id}/price`, {
            method: 'PATCH',
            body: JSON.stringify({ price }),
        })
    },
}

// Orders API
export const ordersAPI = {
    getAll: async (status?: string, limit?: number): Promise<Order[]> => {
        const params = new URLSearchParams()
        if (status) params.append('status', status)
        if (limit) params.append('limit', limit.toString())

        const query = params.toString()
        return fetchAPI(`/api/admin/orders${query ? `?${query}` : ''}`)
    },
}

// Analytics API
export const analyticsAPI = {
    getOverview: async (): Promise<Analytics> => {
        return fetchAPI('/api/admin/analytics/overview')
    },

    getRevenueTrend: async (days: number = 30): Promise<RevenueTrend[]> => {
        return fetchAPI(`/api/admin/analytics/revenue?days=${days}`)
    },

    getTopProducts: async (limit: number = 10): Promise<TopProduct[]> => {
        return fetchAPI(`/api/admin/analytics/top-products?limit=${limit}`)
    },
}
