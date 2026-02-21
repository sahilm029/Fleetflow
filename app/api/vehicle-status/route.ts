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
    const { searchParams } = new URL(request.url)
    const vehicleId = searchParams.get('vehicle_id')

    let query = supabase
      .from('vehicle_status')
      .select('*, vehicles(make, model, license_plate, year)')
      .order('last_update', { ascending: false })

    // Filter by specific vehicle if requested
    if (vehicleId) {
      query = query.eq('vehicle_id', vehicleId)
    }

    // For drivers: only show their assigned vehicles
    if (user.user_metadata?.role === 'driver') {
      const { data: assignments } = await supabase
        .from('assignments')
        .select('vehicle_id')
        .eq('driver_id', user.id)
        .eq('is_active', true)

      if (assignments && assignments.length > 0) {
        const vehicleIds = assignments.map((a: any) => a.vehicle_id)
        query = query.in('vehicle_id', vehicleIds)
      } else {
        return NextResponse.json([], { status: 200 })
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching vehicle status:', error)
      // Fallback: try without join
      let fallbackQuery = supabase.from('vehicle_status').select('*').order('last_update', { ascending: false })
      if (vehicleId) {
        fallbackQuery = fallbackQuery.eq('vehicle_id', vehicleId)
      }
      const { data: fallbackData } = await fallbackQuery
      return NextResponse.json(fallbackData || [], { status: 200 })
    }

    return NextResponse.json(data || [], { status: 200 })
  } catch (error) {
    console.error('Error in vehicle status GET:', error)
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

    if (!vehicle_id) {
      return NextResponse.json(
        { error: 'vehicle_id is required' },
        { status: 400 }
      )
    }

    // For drivers: verify they're assigned to this vehicle
    if (user.user_metadata?.role === 'driver') {
      const { data: assignment } = await supabase
        .from('assignments')
        .select('*')
        .eq('driver_id', user.id)
        .eq('vehicle_id', vehicle_id)
        .eq('is_active', true)
        .single()

      if (!assignment) {
        return NextResponse.json(
          { error: 'You are not assigned to this vehicle' },
          { status: 403 }
        )
      }
    }

    // Build update object with only provided fields
    const updateData: any = {
      last_update: new Date().toISOString(),
    }
    
    if (current_latitude !== undefined) updateData.current_latitude = current_latitude
    if (current_longitude !== undefined) updateData.current_longitude = current_longitude
    if (is_online !== undefined) updateData.is_online = is_online

    const { data, error } = await supabase
      .from('vehicle_status')
      .update(updateData)
      .eq('vehicle_id', vehicle_id)
      .select()

    if (error) {
      console.error('Error updating vehicle status:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Vehicle status not found. Add GPS data first.' },
        { status: 404 }
      )
    }

    return NextResponse.json(data[0], { status: 200 })
  } catch (error: any) {
    console.error('Error in vehicle status PUT:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update vehicle status' },
      { status: 500 }
    )
  }
}
