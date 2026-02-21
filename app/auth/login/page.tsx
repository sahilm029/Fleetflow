'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Truck, LogIn, AlertCircle } from 'lucide-react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ||
            `${window.location.origin}/protected`,
        },
      })
      if (error) throw error
      router.push('/dashboard')
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6 animate-slide-up">
          {/* Header with Logo */}
          <div className="text-center mb-4 animate-slide-up">
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
                FleetFlow
              </h1>
            </div>
            <p className="text-sm text-slate-600">
              Fleet management made simple
            </p>
          </div>

          <Card className="border-0 shadow-lg animate-scale-in">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-2xl text-slate-900">Welcome Back</CardTitle>
              <CardDescription className="text-slate-600">
                Sign in to your FleetFlow account
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2 animate-slide-up animate-stagger-1">
                    <Label htmlFor="email" className="font-semibold text-slate-700">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      required
                      value={email}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`transition-all duration-200 ${
                        focusedField === 'email'
                          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
                          : 'border-slate-200'
                      }`}
                    />
                  </div>
                  <div className="grid gap-2 animate-slide-up animate-stagger-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="font-semibold text-slate-700">
                        Password
                      </Label>
                      <Link
                        href="#"
                        className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Forgot?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`transition-all duration-200 ${
                        focusedField === 'password'
                          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
                          : 'border-slate-200'
                      }`}
                    />
                  </div>
                  {error && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg animate-slide-up">
                      <AlertCircle className="w-4 h-4 text-red-600" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  <Button
                    type="submit"
                    className="w-full mt-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-2 transition-all duration-200 transform hover:scale-105 active:scale-95 animate-slide-up animate-stagger-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Signing in...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="w-4 h-4" />
                        Sign In
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-slate-600 animate-fade-in">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/sign-up"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Create one now
            </Link>
          </div>

          <p className="text-xs text-center text-slate-500 animate-fade-in">
            Enterprise fleet management platform
          </p>
        </div>
      </div>
    </div>
  )
}
