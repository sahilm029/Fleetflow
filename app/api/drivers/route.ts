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
      .from('drivers')
      .select('*, profiles(first_name, last_name, email)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error fetching drivers:', error)
      // If join with profiles fails, try without join
      const { data: driversOnly, error: driversError } = await supabase
        .from('drivers')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (driversError) {
        return NextResponse.json(
          { error: driversError.message, details: driversError },
          { status: 500 }
        )
      }
      
      // Return drivers without profile info if profiles join failed
      return NextResponse.json(driversOnly)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching drivers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch drivers', details: error },
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
    if (!body.user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
        { status: 400 }
      )
    }

    // Add company_id from user metadata
    const driverData = {
      ...body,
      company_id: user.user_metadata?.company_id || 'FLEET-001',
    }

    console.log('Creating driver with data:', driverData)

    const { data, error } = await supabase
      .from('drivers')
      .insert([driverData])
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
    console.error('Driver creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create driver', details: error },
      { status: 500 }
    )
  }
}
