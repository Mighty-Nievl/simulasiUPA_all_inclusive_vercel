import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  const progressCookie = cookieStore.get('upa_progress');

  if (!progressCookie) {
    return NextResponse.json({
      completedSessions: [],
      currentSession: 1,
      lastUpdated: new Date().toISOString()
    });
  }

  try {
    const progress = JSON.parse(progressCookie.value);
    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({
      completedSessions: [],
      currentSession: 1,
      lastUpdated: new Date().toISOString()
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing sessionId' },
        { status: 400 }
      );
    }

    const cookieStore = cookies();
    const progressCookie = cookieStore.get('upa_progress');
    
    let progress = {
      completedSessions: [] as number[],
      currentSession: 1,
      lastUpdated: new Date().toISOString()
    };

    if (progressCookie) {
      try {
        progress = JSON.parse(progressCookie.value);
      } catch {
        // Use default progress
      }
    }

    // Add to completed sessions
    if (!progress.completedSessions.includes(sessionId)) {
      progress.completedSessions.push(sessionId);
      progress.completedSessions.sort((a, b) => a - b);
    }

    // Update current session
    progress.currentSession = Math.min(sessionId + 1, 20);
    progress.lastUpdated = new Date().toISOString();

    const response = NextResponse.json(progress);
    response.cookies.set('upa_progress', JSON.stringify(progress), {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/'
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
