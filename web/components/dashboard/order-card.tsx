import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, timeAgo } from '@/lib/utils'
import type { Order, OrderStatus } from '@/types'

interface OrderCardProps {
  order: Order
}

const statusConfig: Record<OrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; className: string }> = {
  PENDING: {
    label: 'PENDING',
    variant: 'outline',
    className: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20',
  },
  PAID: {
    label: 'PAID',
    variant: 'outline',
    className: 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20',
  },
  COMPLETED: {
    label: 'COMPLETED',
    variant: 'outline',
    className: 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20',
  },
  FAILED: {
    label: 'FAILED',
    variant: 'destructive',
    className: 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20',
  },
  CANCELLED: {
    label: 'CANCELLED',
    variant: 'secondary',
    className: 'bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/20',
  },
}

export function OrderCard({ order }: OrderCardProps) {
  const config = statusConfig[order.status]

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-4 space-y-3">
        {/* Header: Pickup Code & Status */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-3xl font-bold text-primary">
              #{order.pickup_code}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {timeAgo(order.created_at)}
            </p>
          </div>
          <Badge variant={config.variant} className={config.className}>
            {config.label}
          </Badge>
        </div>

        {/* Items List */}
        <div className="space-y-1.5 border-t pt-3">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-foreground">
                {item.quantity}x {item.product_name || 'Unknown Product'}
              </span>
              <span className="text-muted-foreground">
                {formatCurrency(item.price_at_time * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex justify-between items-center border-t pt-3">
          <span className="text-sm font-medium">Total</span>
          <span className="text-xl font-bold">{formatCurrency(order.total_amount)}</span>
        </div>
      </CardContent>
    </Card>
  )
}
