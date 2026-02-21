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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Truck, CheckCircle, AlertCircle } from 'lucide-react'

export default function Page() {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [password, setPassword] = useState('')
  const [repeatPassword, setRepeatPassword] = useState('')
  const [role, setRole] = useState('driver')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role,
          },
        },
      })

      if (signupError) throw signupError

      // Try to ensure a profiles row exists for this user. Some Supabase
      // projects may not have the auth trigger in place, so we upsert from
      // the client immediately after signup.
      try {
        const { data: userData } = await supabase.auth.getUser()
        const userId = userData?.user?.id
        if (userId) {
          await supabase
            .from('profiles')
            .upsert([
              {
                id: userId,
                email,
                first_name: firstName || null,
                last_name: lastName || null,
                role: role || 'driver',
              },
            ])
        }
      } catch (upsertError) {
        // Non-fatal: if upsert fails due to RLS or other, continue to redirect
        console.warn('profiles upsert failed', upsertError)
      }

      // Redirect the user into the app (MVP: no email confirmation required)
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
              Join the modern fleet management system
            </p>
          </div>

          <Card className="border-0 shadow-lg animate-scale-in">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100">
              <CardTitle className="text-2xl text-slate-900">Create Account</CardTitle>
              <CardDescription className="text-slate-600">
                Set up your FleetFlow account in seconds
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <div className="grid gap-2 animate-slide-up animate-stagger-1">
                    <Label htmlFor="firstName" className="font-semibold text-slate-700">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      required
                      value={firstName}
                      onFocus={() => setFocusedField('firstName')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setFirstName(e.target.value)}
                      className={`transition-all duration-200 ${
                        focusedField === 'firstName'
                          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
                          : 'border-slate-200'
                      }`}
                    />
                  </div>
                  <div className="grid gap-2 animate-slide-up animate-stagger-2">
                    <Label htmlFor="lastName" className="font-semibold text-slate-700">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      required
                      value={lastName}
                      onFocus={() => setFocusedField('lastName')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setLastName(e.target.value)}
                      className={`transition-all duration-200 ${
                        focusedField === 'lastName'
                          ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
                          : 'border-slate-200'
                      }`}
                    />
                  </div>
                  <div className="grid gap-2 animate-slide-up animate-stagger-3">
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
                  <div className="grid gap-2 animate-slide-up animate-stagger-4">
                    <Label htmlFor="role" className="font-semibold text-slate-700">
                      Role
                    </Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger
                        id="role"
                        className={`transition-all duration-200 ${
                          focusedField === 'role'
                            ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-20'
                            : 'border-slate-200'
                        }`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="driver">Driver</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2 animate-slide-up animate-stagger-1">
                    <div className="flex items-center">
                      <Label htmlFor="password" className="font-semibold text-slate-700">
                        Password
                      </Label>
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
                  <div className="grid gap-2 animate-slide-up animate-stagger-2">
                    <div className="flex items-center">
                      <Label
                        htmlFor="repeat-password"
                        className="font-semibold text-slate-700"
                      >
                        Confirm Password
                      </Label>
                    </div>
                    <Input
                      id="repeat-password"
                      type="password"
                      required
                      value={repeatPassword}
                      onFocus={() => setFocusedField('repeat')}
                      onBlur={() => setFocusedField(null)}
                      onChange={(e) => setRepeatPassword(e.target.value)}
                      className={`transition-all duration-200 ${
                        focusedField === 'repeat'
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
                        Creating account...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Create Account
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-slate-600 animate-fade-in">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
            >
              Sign in here
            </Link>
          </div>

          <p className="text-xs text-center text-slate-500 animate-fade-in">
            By signing up, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}
