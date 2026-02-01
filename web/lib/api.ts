import type { Product, Order, Analytics, RevenueTrend, TopProduct } from '@/types'

const PRODUCTION_API_URL = 'https://destination-cocktails-production.up.railway.app'

export function getApiBaseUrl(): string {
    if (typeof window !== 'undefined' && window.location.hostname.includes('railway.app')) {
        return process.env.NEXT_PUBLIC_API_URL || PRODUCTION_API_URL
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
}

let authToken: string | null = null

export function setAuthToken(token: string | null) {
    authToken = token
}

async function fetchAPI(endpoint: string, options?: RequestInit) {
    const baseUrl = getApiBaseUrl()
    const url = `${baseUrl}${endpoint}`

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...options?.headers,
    }
    if (authToken) {
        (headers as Record<string, string>)['Authorization'] = `Bearer ${authToken}`
    }

    const response = await fetch(url, {
        ...options,
        credentials: 'include',
        headers,
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
        const data = await fetchAPI('/api/admin/auth/verify-otp', {
            method: 'POST',
            body: JSON.stringify({ phone, code }),
        }) as Record<string, unknown>
        const token = data?.token ?? data?.access_token ?? data?.jwt
        if (typeof token === 'string') {
            setAuthToken(token)
        }
        return data
    },

    logout: async () => {
        const result = await fetchAPI('/api/admin/auth/logout', {
            method: 'POST',
        })
        setAuthToken(null)
        return result
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
