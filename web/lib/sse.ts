'use client'

import { useEffect, useRef, useState } from 'react'
import { getApiBaseUrl } from '@/lib/api'

interface SSEEvent {
    type: string
    data: any
}

interface SSEHandlers {
    onNewOrder?: (order: any) => void
    onOrderCompleted?: (data: { order_id: string }) => void
    onStockUpdated?: (data: { product_id: string; stock: number }) => void
    onPriceUpdated?: (data: { product_id: string; price: number }) => void
    onConnected?: () => void
    onError?: (error: Error) => void
}

export function useSSE(handlers: SSEHandlers) {
    const [isConnected, setIsConnected] = useState(false)
    const eventSourceRef = useRef<EventSource | null>(null)
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        const connect = () => {
            const url = `${getApiBaseUrl()}/api/admin/events`
            const eventSource = new EventSource(url, { withCredentials: true })
            eventSourceRef.current = eventSource

            eventSource.addEventListener('connected', () => {
                setIsConnected(true)
                handlers.onConnected?.()
            })

            eventSource.addEventListener('new_order', (e) => {
                try {
                    const data = JSON.parse(e.data)
                    handlers.onNewOrder?.(data)
                } catch (err) {
                    console.error('Failed to parse new_order event:', err)
                }
            })

            eventSource.addEventListener('order_completed', (e) => {
                try {
                    const data = JSON.parse(e.data)
                    handlers.onOrderCompleted?.(data)
                } catch (err) {
                    console.error('Failed to parse order_completed event:', err)
                }
            })

            eventSource.addEventListener('stock_updated', (e) => {
                try {
                    const data = JSON.parse(e.data)
                    handlers.onStockUpdated?.(data)
                } catch (err) {
                    console.error('Failed to parse stock_updated event:', err)
                }
            })

            eventSource.addEventListener('price_updated', (e) => {
                try {
                    const data = JSON.parse(e.data)
                    handlers.onPriceUpdated?.(data)
                } catch (err) {
                    console.error('Failed to parse price_updated event:', err)
                }
            })

            eventSource.onerror = (error) => {
                setIsConnected(false)
                eventSource.close()
                handlers.onError?.(new Error('SSE connection error'))

                // Reconnect after 5 seconds
                reconnectTimeoutRef.current = setTimeout(() => {
                    connect()
                }, 5000)
            }
        }

        connect()

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current)
            }
        }
    }, []) // Empty deps - handlers are used but not as dependencies to avoid reconnections

    return { isConnected }
}
