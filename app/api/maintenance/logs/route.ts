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

    if (error) {
      console.error('Supabase error fetching logs with joins:', error)
      // Fallback: fetch logs without joins if RLS blocks it
      const { data: logsOnly, error: logsError } = await supabase
        .from('maintenance_logs')
        .select('*')
        .order('completion_date', { ascending: false })
      
      if (logsError) {
        return NextResponse.json(
          { error: logsError.message, details: logsError },
          { status: 500 }
        )
      }
      
      return NextResponse.json(logsOnly)
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch logs', details: error },
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
    const logData = {
      ...body,
      company_id: user.user_metadata?.company_id || 'FLEET-001',
    }

    console.log('Creating maintenance log with data:', logData)

    const { data, error } = await supabase
      .from('maintenance_logs')
      .insert([logData])
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
    console.error('Log creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create log', details: error },
      { status: 500 }
    )
  }
}
