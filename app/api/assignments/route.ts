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
      .from('assignments')
      .select(
        '*, vehicles(make, model, license_plate), profiles(first_name, last_name)'
      )
      .order('assigned_date', { ascending: false })

    if (error) {
      console.error('Supabase error fetching assignments with joins:', error)
      // Fallback: fetch assignments without joins if RLS blocks it
      const { data: assignmentsOnly, error: assignmentsError } = await supabase
        .from('assignments')
        .select('*')
        .order('assigned_date', { ascending: false })
      
      if (assignmentsError) {
        return NextResponse.json(
          { error: assignmentsError.message, details: assignmentsError },
          { status: 500 }
        )
      }
      
      return NextResponse.json(assignmentsOnly)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching assignments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch assignments', details: error },
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

  // Check if user is admin or manager using metadata
  const userRole = user.user_metadata?.role
  if (!userRole || !['admin', 'manager'].includes(userRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  try {
    const body = await request.json()

    // Validate required fields
    if (!body.vehicle_id || !body.driver_id) {
      return NextResponse.json(
        { error: 'vehicle_id and driver_id are required' },
        { status: 400 }
      )
    }

    // Add company_id and assigned_date from user metadata
    const assignmentData = {
      ...body,
      company_id: user.user_metadata?.company_id || 'FLEET-001',
      assigned_date: new Date().toISOString(),
    }

    console.log('Creating assignment with data:', assignmentData)

    const { data, error } = await supabase
      .from('assignments')
      .insert([assignmentData])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      )
    }

    // AUTO-SETUP: Upsert vehicle_status so driver can always toggle online
    const { error: statusError } = await supabase
      .from('vehicle_status')
      .upsert([
        {
          vehicle_id: body.vehicle_id,
          current_latitude: 28.6139,
          current_longitude: 77.2090,
          is_online: false,
          last_update: new Date().toISOString(),
          company_id: user.user_metadata?.company_id || 'FLEET-001',
        },
      ], { onConflict: 'vehicle_id', ignoreDuplicates: false })

    if (statusError) {
      console.warn('Failed to upsert vehicle_status (non-critical):', statusError)
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Assignment creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create assignment', details: error },
      { status: 500 }
    )
  }
}
