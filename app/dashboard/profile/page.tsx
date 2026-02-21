import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react'

export default async function ProfilePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user profile
  let { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user?.id)
    .single()

  // If no profile found by id (possible mismatch/backfill issues), try by email
  if (!profile && user?.email) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', user.email)
      .single()
    profile = data
  }

  // If driver, fetch driver details
  let driverData = null
  if (profile?.role === 'driver') {
    const { data } = await supabase
      .from('drivers')
      .select('*')
      .eq('user_id', user?.id)
      .single()
    driverData = data
  }

  // If profile is still missing, try to use user metadata from session
  // (useful when RLS or triggers prevent reading the profiles table)
  if (!profile && user?.user_metadata) {
    profile = {
      id: user.id,
      email: user.email || user.user_metadata.email || null,
      first_name: user.user_metadata.first_name || user.user_metadata?.name?.split?.(' ')?.[0] || null,
      last_name: user.user_metadata.last_name || null,
      role: user.user_metadata.role || 'driver',
      created_at: user?.created_at || null,
    }
  }

  // Determine member since date: prefer profile.created_at, fall back to auth user created_at
  const memberSince = profile?.created_at || user?.created_at || null

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Full Name
              </label>
              <p className="text-lg font-semibold">
                {profile?.first_name || '—'} {profile?.last_name || ''}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <p className="text-base">{profile?.email || user?.email || '—'}</p>
            </div>
            {profile?.phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone
                </label>
                <p className="text-base">{profile.phone}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Role
              </label>
              <Badge variant={profile?.role === 'admin' ? 'default' : 'secondary'}>
                {profile?.role ? profile.role.toUpperCase() : '—'}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </label>
              <p className="text-base">
                {profile?.created_at
                  ? new Date(profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Dev: show debug info when profile missing to help diagnose */}
        {!profile && (
          <div className="col-span-2 p-4 text-sm text-muted-foreground">
            <strong>Debug:</strong>
            <div>User ID: {user?.id || 'none'}</div>
            <div>User Email: {user?.email || 'none'}</div>
            <div>
              If these are present but profile still missing, run the
              profile-trigger/backfill script in the SQL editor.
            </div>
          </div>
        )}

        {/* Driver Information (if applicable) */}
        {profile?.role === 'driver' && driverData && (
          <Card>
            <CardHeader>
              <CardTitle>Driver Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  License Number
                </label>
                <p className="text-lg font-semibold">{driverData.license_number}</p>
              </div>
              {driverData.license_expiry && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    License Expiry
                  </label>
                  <p className="text-base">
                    {new Date(driverData.license_expiry).toLocaleDateString()}
                  </p>
                </div>
              )}
              {driverData.experience_years && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Experience
                  </label>
                  <p className="text-base">{driverData.experience_years} years</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Status
                </label>
                <Badge
                  variant={
                    driverData.status === 'active' ? 'default' : 'secondary'
                  }
                >
                  {driverData.status?.toUpperCase()}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Statistics */}
        <Card className={profile?.role === 'driver' ? 'md:col-span-1' : 'md:col-span-2'}>
          <CardHeader>
            <CardTitle>Account Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Account Type</p>
                <p className="text-2xl font-bold capitalize">{profile?.role}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Account Status</p>
                <p className="text-2xl font-bold text-green-600">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
