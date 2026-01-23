'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authAPI } from '@/lib/api'
import { toast } from 'sonner'

export default function LoginPage() {
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!phone || phone.length < 10) {
            toast.error('Please enter a valid phone number')
            return
        }

        setLoading(true)

        try {
            await authAPI.requestOTP(phone)
            toast.success('OTP sent to your WhatsApp')
            router.push(`/verify?phone=${phone}`)
        } catch (error: any) {
            toast.error(error.message || 'Failed to send OTP')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <div className="text-6xl mb-4">🍸</div>
                    <h1 className="text-3xl font-bold">Destination Cocktails</h1>
                    <p className="text-muted-foreground mt-2">Manager Dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-2">
                            Phone Number
                        </label>
                        <input
                            id="phone"
                            type="tel"
                            placeholder="254712345678"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-3 bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            disabled={loading}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            Enter your registered phone number
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                        {loading ? 'Sending...' : 'Request OTP'}
                    </button>
                </form>

                <p className="text-center text-xs text-muted-foreground">
                    You'll receive a 6-digit code via WhatsApp
                </p>
            </div>
        </div>
    )
}
