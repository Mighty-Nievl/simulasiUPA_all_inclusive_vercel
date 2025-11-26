import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Service Role Key missing' }, { status: 500 })
    }

    // Create a Supabase client with the SERVICE ROLE key
    // This allows us to bypass RLS and access admin functions
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Call the RPC function 'check_user_exists'
    // We assume the user has created this function in Supabase
    const { data, error } = await supabaseAdmin.rpc('check_user_exists', {
      email_check: email
    })

    if (error) {
      console.error('RPC Error:', error)
      // Fallback: If RPC fails (e.g. not created), we can't be sure.
      // Return false to be safe? Or error?
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ exists: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
