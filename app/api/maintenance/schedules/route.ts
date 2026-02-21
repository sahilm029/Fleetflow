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
      .from('maintenance_schedules')
      .select('*, vehicles(make, model, license_plate)')
      .order('scheduled_date', { ascending: true })

    if (error) {
      console.error('Supabase error fetching schedules with joins:', error)
      // Fallback: fetch schedules without joins if RLS blocks it
      const { data: schedulesOnly, error: schedulesError } = await supabase
        .from('maintenance_schedules')
        .select('*')
        .order('scheduled_date', { ascending: true })
      
      if (schedulesError) {
        return NextResponse.json(
          { error: schedulesError.message, details: schedulesError },
          { status: 500 }
        )
      }
      
      return NextResponse.json(schedulesOnly)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching schedules:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schedules', details: error },
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

    // Add company_id from user metadata
    const scheduleData = {
      ...body,
      company_id: user.user_metadata?.company_id || 'FLEET-001',
    }

    console.log('Creating maintenance schedule with data:', scheduleData)

    const { data, error } = await supabase
      .from('maintenance_schedules')
      .insert([scheduleData])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      )
    }

    return NextResponse.json(data[0], { status: 201 })
  } catch (error) {
    console.error('Schedule creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create schedule', details: error },
      { status: 500 }
    )
  }
}
