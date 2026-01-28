'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatCurrency } from '@/lib/utils'
import { Plus, Minus } from 'lucide-react'
import type { Product } from '@/types'

interface ProductCardProps {
  product: Product
  onStockChange: (productId: string, newStock: number) => void
  onPriceChange: (productId: string, newPrice: number) => void
}

const getCategoryEmoji = (category: string) => {
  const lower = category.toLowerCase()
  if (lower.includes('beer')) return '🍺'
  if (lower.includes('whisky') || lower.includes('whiskey')) return '🥃'
  if (lower.includes('wine')) return '🍷'
  if (lower.includes('vodka')) return '🍸'
  if (lower.includes('gin')) return '🍸'
  if (lower.includes('rum')) return '🥃'
  if (lower.includes('chaser')) return '🥤'
  return '🍹'
}

export function ProductCard({ product, onStockChange, onPriceChange }: ProductCardProps) {
  const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false)
  const [priceInput, setPriceInput] = useState(product.price.toString())

  const handleStockIncrease = () => {
    onStockChange(product.id, product.stock_quantity + 1)
  }

  const handleStockDecrease = () => {
    if (product.stock_quantity > 0) {
      onStockChange(product.id, product.stock_quantity - 1)
    }
  }

  const handlePriceSubmit = () => {
    const newPrice = parseFloat(priceInput)
    if (!isNaN(newPrice) && newPrice > 0) {
      onPriceChange(product.id, newPrice)
      setIsPriceDialogOpen(false)
    }
  }

  const openPriceDialog = () => {
    setPriceInput(product.price.toString())
    setIsPriceDialogOpen(true)
  }

  const isLowStock = product.stock_quantity < 5

  return (
    <>
      <Card className="overflow-hidden">
        <CardContent className="p-4">
          {/* Header: Emoji & Name */}
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">{getCategoryEmoji(product.category)}</span>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-base truncate">{product.name}</h4>
              <button
                onClick={openPriceDialog}
                className="text-lg font-bold text-primary hover:underline mt-0.5"
              >
                {formatCurrency(product.price)}
              </button>
            </div>
          </div>

          {/* Stock Controls */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="outline"
                onClick={handleStockDecrease}
                disabled={product.stock_quantity === 0}
                className="h-9 w-9"
              >
                <Minus className="h-4 w-4" />
              </Button>

              <div className="text-center min-w-[50px]">
                <div className={`text-xl font-bold ${isLowStock ? 'text-red-500' : ''}`}>
                  {product.stock_quantity}
                </div>
              </div>

              <Button
                size="icon"
                variant="outline"
                onClick={handleStockIncrease}
                className="h-9 w-9"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {isLowStock && (
              <span className="text-xs px-2 py-1 bg-red-500/10 text-red-600 rounded-full border border-red-500/20">
                Low Stock
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Price Edit Dialog */}
      <Dialog open={isPriceDialogOpen} onOpenChange={setIsPriceDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Edit Price</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="price" className="text-sm font-medium">
                {product.name}
              </label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                placeholder="Enter new price"
                className="text-lg"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPriceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handlePriceSubmit}>Save Price</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
