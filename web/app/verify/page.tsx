'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { toast } from 'sonner'

function VerifyForm() {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const searchParams = useSearchParams()
    const phone = searchParams.get('phone') || ''

    useEffect(() => {
        if (!phone) {
            router.push('/login')
        }
    }, [phone, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (code.length !== 6) {
            toast.error('Please enter a 6-digit code')
            return
        }

        setLoading(true)

        try {
            await authAPI.verifyOTP(phone, code)
            toast.success('Login successful!')
            router.push('/dashboard')
        } catch (error: any) {
            toast.error(error.message || 'Invalid OTP code')
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        try {
            await authAPI.requestOTP(phone)
            toast.success('New OTP sent')
        } catch (error: any) {
            toast.error(error.message || 'Failed to resend OTP')
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔐</div>
                    <h1 className="text-3xl font-bold">Enter OTP</h1>
                    <p className="text-muted-foreground mt-2">
                        Code sent to {phone}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="code" className="block text-sm font-medium mb-2">
                            6-Digit Code
                        </label>
                        <input
                            id="code"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            placeholder="123456"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-widest"
                            disabled={loading}
                            autoFocus
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading || code.length !== 6}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Verifying...' : 'Verify & Login'}
                    </button>

                    <button
                        type="button"
                        onClick={handleResend}
                        className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Didn't receive code? Resend
                    </button>
                </form>

                <button
                    onClick={() => router.push('/login')}
                    className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    ← Back to login
                </button>
            </div>
        </div>
    )
}

export default function VerifyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="text-center">
                    <div className="text-6xl mb-4">🔐</div>
                    <p className="text-muted-foreground">Loading...</p>
                </div>
            </div>
        }>
            <VerifyForm />
        </Suspense>
    )
}
