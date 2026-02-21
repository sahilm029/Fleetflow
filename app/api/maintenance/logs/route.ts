import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabase
      .from('maintenance_logs')
      .select('*, vehicles(make, model, license_plate)')
      .order('completion_date', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Check if user is admin or manager
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !['admin', 'manager'].includes(profile.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('maintenance_logs')
      .insert([body])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create log' },
      { status: 500 }
    )
  }
}
