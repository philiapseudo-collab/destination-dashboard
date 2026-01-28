'use client'

import { useQuery } from '@tanstack/react-query'
import { analyticsAPI } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ReportsPage() {
    const { data: overview } = useQuery({
        queryKey: ['analytics-overview'],
        queryFn: analyticsAPI.getOverview,
    })

    const { data: revenueTrend } = useQuery({
        queryKey: ['revenue-trend'],
        queryFn: () => analyticsAPI.getRevenueTrend(30),
    })

    const { data: topProducts } = useQuery({
        queryKey: ['top-products'],
        queryFn: () => analyticsAPI.getTopProducts(10),
    })

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Analytics</h2>
                <p className="text-muted-foreground">Business insights</p>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-2 gap-4">
                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Today's Sales</div>
                    <div className="text-2xl font-bold mt-1">
                        {formatCurrency(overview?.today_revenue || 0)}
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Today's Orders</div>
                    <div className="text-2xl font-bold mt-1">{overview?.today_orders || 0}</div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Best Seller</div>
                    <div className="text-lg font-bold mt-1 truncate">
                        {overview?.best_seller?.name || 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {overview?.best_seller?.quantity || 0} sold
                    </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                    <div className="text-sm text-muted-foreground">Avg Order Value</div>
                    <div className="text-2xl font-bold mt-1">
                        {formatCurrency(overview?.average_order_value || 0)}
                    </div>
                </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-4">30-Day Revenue</h3>
                {revenueTrend && revenueTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={revenueTrend}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                            <XAxis
                                dataKey="date"
                                stroke="#888"
                                fontSize={12}
                                tickFormatter={(value) => {
                                    const date = new Date(value)
                                    return `${date.getMonth() + 1}/${date.getDate()}`
                                }}
                            />
                            <YAxis stroke="#888" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1a1a1a',
                                    border: '1px solid #333',
                                    borderRadius: '8px',
                                }}
                                formatter={(value: number) => formatCurrency(value)}
                            />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#f59e0b"
                                strokeWidth={2}
                                dot={{ fill: '#f59e0b' }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                        No data available
                    </div>
                )}
            </div>

            {/* Top Products Table */}
            <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-semibold mb-4">Top Products (30 Days)</h3>
                {topProducts && topProducts.length > 0 ? (
                    <div className="space-y-2">
                        {topProducts.map((product, idx) => (
                            <div
                                key={idx}
                                className="flex items-center justify-between py-2 border-b border-border last:border-0"
                            >
                                <div className="flex-1">
                                    <div className="font-medium">{product.product_name}</div>
                                    <div className="text-sm text-muted-foreground">
                                        {product.quantity_sold} sold
                                    </div>
                                </div>
                                <div className="text-right font-semibold">
                                    {formatCurrency(product.revenue)}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        No sales data yet
                    </div>
                )}
            </div>
        </div>
    )
}
