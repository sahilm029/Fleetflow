'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { LogOut, Gauge, Truck, Users, Settings, Wrench, Map, Navigation, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function DashboardNav() {
  const router = useRouter()
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUserRole = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        setRole(data?.role || 'driver')
      }
      setLoading(false)
    }

    fetchUserRole()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return <div className="w-64 bg-background border-r" />
  }

  return (
    <aside className="w-64 bg-gradient-to-b from-white to-slate-50 border-r border-blue-200 shadow-lg animate-slide-left">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground">FleetFlow</h1>
          <p className="text-sm text-muted-foreground">Fleet Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <NavLink href="/dashboard" icon={Gauge} label="Overview" />
            <NavLink href="/dashboard/fleet" icon={Truck} label="Fleet" />
            <NavLink href="/dashboard/drivers" icon={Users} label="Drivers" />
            <NavLink href="/dashboard/assignments" icon={Map} label="Assignments" />
            <NavLink href="/dashboard/tracking" icon={Navigation} label="Tracking" />
            <NavLink href="/dashboard/maintenance" icon={Wrench} label="Maintenance" />
            {(role === 'admin' || role === 'manager') && (
              <NavLink href="/dashboard/analytics" icon={BarChart3} label="Analytics" />
            )}
            {role === 'admin' && (
              <NavLink href="/dashboard/settings" icon={Settings} label="Settings" />
            )}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start"
            size="sm"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </aside>
  )
}

function NavLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: any
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-accent text-foreground hover:text-accent-foreground transition-colors"
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm font-medium">{label}</span>
    </Link>
  )
}
