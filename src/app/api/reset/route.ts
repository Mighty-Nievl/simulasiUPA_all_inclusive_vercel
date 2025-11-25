import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const response = NextResponse.json({
    success: true,
    message: 'Progress has been reset'
  });

  // Clear the progress cookie
  response.cookies.set('upa_progress', '', {
    maxAge: 0,
    path: '/'
  });

  return response;
}
