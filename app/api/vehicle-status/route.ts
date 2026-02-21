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
      .from('vehicle_status')
      .select('*, vehicles(make, model, license_plate)')
      .order('last_update', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch vehicle status' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { vehicle_id, current_latitude, current_longitude, is_online } = body

    const { data, error } = await supabase
      .from('vehicle_status')
      .update({
        current_latitude,
        current_longitude,
        is_online,
        last_update: new Date().toISOString(),
      })
      .eq('vehicle_id', vehicle_id)
      .select()

    if (error) throw error

    return NextResponse.json(data[0])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update vehicle status' },
      { status: 500 }
    )
  }
}
