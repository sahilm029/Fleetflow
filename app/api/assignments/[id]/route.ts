import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const userRole = user.user_metadata?.role

  try {
    // Fetch the assignment — driver must own it, manager/admin can access any
    let fetchQuery = supabase
      .from('assignments')
      .select('id, vehicle_id, driver_id, is_active')
      .eq('id', id)

    if (userRole === 'driver') {
      fetchQuery = fetchQuery.eq('driver_id', user.id)
    } else if (!['admin', 'manager'].includes(userRole)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { data: assignment, error: fetchError } = await fetchQuery.single()

    if (fetchError || !assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 })
    }

    if (!assignment.is_active) {
      return NextResponse.json({ error: 'Assignment is already completed' }, { status: 400 })
    }

    // Try updating with unassigned_date first, fall back without it
    let updated: any = null
    const withDate = await supabase
      .from('assignments')
      .update({ is_active: false, unassigned_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (withDate.error) {
      // unassigned_date column may not exist — retry with just is_active
      const withoutDate = await supabase
        .from('assignments')
        .update({ is_active: false })
        .eq('id', id)
        .select()
        .single()

      if (withoutDate.error) {
        return NextResponse.json({ error: withoutDate.error.message }, { status: 500 })
      }
      updated = withoutDate.data
    } else {
      updated = withDate.data
    }

    // Set vehicle offline
    await supabase
      .from('vehicle_status')
      .update({ is_online: false, last_update: new Date().toISOString() })
      .eq('vehicle_id', assignment.vehicle_id)

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PATCH assignment error:', err)
    return NextResponse.json({ error: 'Failed to complete assignment' }, { status: 500 })
  }
}
