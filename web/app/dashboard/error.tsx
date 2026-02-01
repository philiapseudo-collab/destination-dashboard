'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function DashboardError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        console.error('Dashboard error:', error)
    }, [error])

    return (
        <div className="py-12 px-4 text-center">
            <h2 className="text-xl font-bold text-foreground mb-2">Dashboard error</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Something went wrong loading this page. This can happen after a session expires or when the connection fails.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={reset}>Try again</Button>
                <Button variant="outline" asChild>
                    <a href="/login">Log in again</a>
                </Button>
            </div>
        </div>
    )
}
