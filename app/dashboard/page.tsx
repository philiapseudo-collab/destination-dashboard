'use client'

import { useQuery } from '@tanstack/react-query'
import { ordersAPI } from '@/lib/api'
import { useSSE } from '@/lib/sse'
import { toast } from 'sonner'
import { formatCurrency, formatDate, formatPhoneNumber } from '@/lib/utils'
import type { Order } from '@/types'

export default function DashboardPage() {
    const { data: orders, refetch } = useQuery({
        queryKey: ['orders'],
        queryFn: () => ordersAPI.getAll(undefined, 50),
    })

    // Real-time updates via SSE
    useSSE({
        onNewOrder: (order) => {
            toast.success(`New order #${order.pickup_code}`)
            refetch()
        },
        onOrderCompleted: () => {
            refetch()
        },
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-yellow-500/20 text-yellow-500'
            case 'PAID':
                return 'bg-green-500/20 text-green-500'
            case 'COMPLETED':
                return 'bg-blue-500/20 text-blue-500'
            case 'FAILED':
                return 'bg-red-500/20 text-red-500'
            default:
                return 'bg-gray-500/20 text-gray-500'
        }
    }

    const getStatusEmoji = (status: string) => {
        switch (status) {
            case 'PENDING':
                return '🟡'
            case 'PAID':
                return '🟢'
            case 'COMPLETED':
                return '✅'
            case 'FAILED':
                return '🔴'
            default:
                return '⚪'
        }
    }

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-2xl font-bold">Live Orders</h2>
                <p className="text-muted-foreground">Real-time order feed</p>
            </div>

            {!orders || orders.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <div className="text-6xl mb-4">📋</div>
                    <p>No orders yet</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {orders.map((order: Order) => (
                        <div
                            key={order.id}
                            className="bg-card border border-border rounded-lg p-4 space-y-3"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-bold text-primary">
                                            #{order.pickup_code}
                                        </span>
                                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
                                            {getStatusEmoji(order.status)} {order.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {formatDate(order.created_at)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xl font-bold">{formatCurrency(order.total_amount)}</div>
                                    <p className="text-xs text-muted-foreground">
                                        {formatPhoneNumber(order.customer_phone)}
                                    </p>
                                </div>
                            </div>

                            {/* Items */}
                            <div className="space-y-1">
                                {order.items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-sm">
                                        <span>
                                            {item.quantity}x {item.product_name || 'Product'}
                                        </span>
                                        <span className="text-muted-foreground">
                                            {formatCurrency(item.price_at_time * item.quantity)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
