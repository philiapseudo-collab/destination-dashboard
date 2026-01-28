'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Home, Package, BarChart3 } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const pathname = usePathname()

    // Simple auth check - in production, verify JWT validity
    useEffect(() => {
        // This is a basic check - the backend will validate the JWT
        // If API calls fail with 401, redirect to login
    }, [router])

    const navItems = [
        { href: '/dashboard', label: 'Home', icon: Home },
        { href: '/dashboard/stock', label: 'Stock', icon: Package },
        { href: '/dashboard/reports', label: 'Reports', icon: BarChart3 },
    ]

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-card border-b border-border">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="text-xl font-bold">🍸 Destination Cocktails</h1>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-6">
                {children}
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border">
                <div className="container mx-auto px-4">
                    <div className="flex justify-around">
                        {navItems.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex flex-col items-center py-3 px-4 transition-colors ${isActive
                                            ? 'text-primary'
                                            : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    <Icon className="w-6 h-6 mb-1" />
                                    <span className="text-xs font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </nav>
        </div>
    )
}
