'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productsAPI } from '@/lib/api'
import { toast } from 'sonner'
import { formatCurrency } from '@/lib/utils'
import { Plus, Minus, Edit2, Check, X, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { Product } from '@/types'

function matchesSearch(product: Product, query: string): boolean {
    if (!query.trim()) return true
    const q = query.trim().toLowerCase()
    const name = (product.name ?? '').toLowerCase()
    const desc = (product.description ?? '').toLowerCase()
    const cat = (product.category ?? '').toLowerCase()
    return name.includes(q) || desc.includes(q) || cat.includes(q)
}

export default function StockPage() {
    const queryClient = useQueryClient()
    const [editingPrice, setEditingPrice] = useState<string | null>(null)
    const [priceValue, setPriceValue] = useState('')
    const [searchQuery, setSearchQuery] = useState('')

    const { data: products } = useQuery({
        queryKey: ['products'],
        queryFn: productsAPI.getAll,
    })

    const updateStockMutation = useMutation({
        mutationFn: ({ id, stock }: { id: string; stock: number }) =>
            productsAPI.updateStock(id, stock),
        onMutate: async ({ id, stock }) => {
            await queryClient.cancelQueries({ queryKey: ['products'] })
            const previous = queryClient.getQueryData(['products'])

            queryClient.setQueryData(['products'], (old: Product[] | undefined) =>
                old?.map((p) => (p.id === id ? { ...p, stock_quantity: stock } : p))
            )

            return { previous }
        },
        onError: (err, variables, context) => {
            queryClient.setQueryData(['products'], context?.previous)
            toast.error('Failed to update stock')
        },
        onSuccess: () => {
            toast.success('Stock updated')
        },
    })

    const updatePriceMutation = useMutation({
        mutationFn: ({ id, price }: { id: string; price: number }) =>
            productsAPI.updatePrice(id, price),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['products'] })
            toast.success('Price updated')
            setEditingPrice(null)
        },
        onError: () => {
            toast.error('Failed to update price')
        },
    })

    const handleStockChange = (product: Product, delta: number) => {
        const newStock = Math.max(0, product.stock_quantity + delta)
        updateStockMutation.mutate({ id: product.id, stock: newStock })
    }

    const startEditPrice = (product: Product) => {
        setEditingPrice(product.id)
        setPriceValue(product.price.toString())
    }

    const savePrice = (productId: string) => {
        const price = parseFloat(priceValue)
        if (isNaN(price) || price <= 0) {
            toast.error('Invalid price')
            return
        }
        updatePriceMutation.mutate({ id: productId, price })
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

    const filteredProducts = useMemo(() => {
        if (!products) return []
        if (!searchQuery.trim()) return products
        return products.filter((p) => matchesSearch(p, searchQuery))
    }, [products, searchQuery])

    const groupedProducts = useMemo(() => {
        return filteredProducts.reduce((acc, product) => {
            if (!acc[product.category]) {
                acc[product.category] = []
            }
            acc[product.category].push(product)
            return acc
        }, {} as Record<string, Product[]>)
    }, [filteredProducts])

    const hasSearch = searchQuery.trim().length > 0
    const hasResults = Object.keys(groupedProducts).length > 0

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold">Inventory</h2>
                <p className="text-muted-foreground">Manage stock and prices</p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                    type="search"
                    placeholder="Search by name, description, or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9"
                    aria-label="Search inventory"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground"
                        aria-label="Clear search"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}
            </div>

            {hasSearch && !hasResults && (
                <p className="text-muted-foreground text-center py-8">
                    No products match &quot;{searchQuery.trim()}&quot;. Try a different search or clear the search.
                </p>
            )}

            {groupedProducts &&
                Object.entries(groupedProducts).map(([category, items]) => (
                    <div key={category} className="space-y-3">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <span>{getCategoryEmoji(category)}</span>
                            <span>{category}</span>
                        </h3>

                        <div className="grid gap-3">
                            {items.map((product) => (
                                <div
                                    key={product.id}
                                    className="bg-card border border-border rounded-lg p-4"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h4 className="font-medium">{product.name}</h4>
                                            {product.description && (
                                                <p className="text-sm text-muted-foreground">
                                                    {product.description}
                                                </p>
                                            )}
                                        </div>

                                        {/* Price Editor */}
                                        <div className="ml-4">
                                            {editingPrice === product.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={priceValue}
                                                        onChange={(e) => setPriceValue(e.target.value)}
                                                        className="w-24 px-2 py-1 bg-secondary border border-border rounded text-sm"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => savePrice(product.id)}
                                                        className="p-1 text-green-500 hover:bg-green-500/20 rounded"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingPrice(null)}
                                                        className="p-1 text-red-500 hover:bg-red-500/20 rounded"
                                                    >
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => startEditPrice(product)}
                                                    className="flex items-center gap-1 text-sm hover:text-primary transition-colors"
                                                >
                                                    <span className="font-semibold">
                                                        {formatCurrency(product.price)}
                                                    </span>
                                                    <Edit2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stock Controls */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <button
                                                onClick={() => handleStockChange(product, -1)}
                                                className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                                                disabled={product.stock_quantity === 0}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>

                                            <div className="text-center min-w-[60px]">
                                                <div className="text-2xl font-bold">{product.stock_quantity}</div>
                                                <div className="text-xs text-muted-foreground">in stock</div>
                                            </div>

                                            <button
                                                onClick={() => handleStockChange(product, 1)}
                                                className="p-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {product.stock_quantity < 5 && (
                                            <span className="text-xs px-2 py-1 bg-red-500/20 text-red-500 rounded-full">
                                                Low Stock
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
        </div>
    )
}
