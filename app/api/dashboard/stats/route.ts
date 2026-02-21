import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Try to fetch profile by id, fall back to email
    let { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (!profile && user.email) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', user.email)
        .single()
      profile = data
    }

    // Counts
    const { data: vehicles } = await supabase.from('vehicles').select('id')
    const { data: drivers } = await supabase.from('drivers').select('id')
    const { data: activeTrips } = await supabase
      .from('trip_history')
      .select('id')
      .eq('status', 'in_progress')

    return NextResponse.json({
      profile: profile || null,
      counts: {
        vehicles: vehicles?.length || 0,
        drivers: drivers?.length || 0,
        activeTrips: activeTrips?.length || 0,
      },
    })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to load stats' }, { status: 500 })
  }
}
