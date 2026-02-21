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
      .from('trip_history')
      .select(
        '*, vehicles(make, model, license_plate), routes(name, distance_km), profiles(first_name, last_name)'
      )
      .order('start_time', { ascending: false })

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trips' },
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

  try {
    const body = await request.json()

    const { data, error } = await supabase
      .from('trip_history')
      .insert([{ ...body, driver_id: user.id }])
      .select()

    if (error) throw error

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create trip' },
      { status: 500 }
    )
  }
}
