import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const localProgress = await request.json();
    
    // Fetch existing server progress
    const { data: serverProgress, error: fetchError } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") { // PGRST116 is "Row not found"
      throw fetchError;
    }

    let mergedProgress = localProgress;
    let shouldUpdateServer = false;

    if (serverProgress) {
      const serverTime = new Date(serverProgress.last_updated).getTime();
      const localTime = new Date(localProgress.lastUpdated).getTime();

      // If server is newer, return server data
      if (serverTime > localTime) {
        return NextResponse.json({ 
          progress: {
            completedSessions: serverProgress.completed_sessions,
            currentSession: serverProgress.current_session,
            masteredQuestionIds: serverProgress.mastered_question_ids,
            sessionQuestions: serverProgress.session_questions,
            currentAnswers: serverProgress.current_answers,
            lastUpdated: serverProgress.last_updated,
          },
          action: "update_local"
        });
      }
      
      // If local is newer, we will update server
      if (localTime > serverTime) {
        shouldUpdateServer = true;
      }
      
      // If times are equal (or very close), we might want to merge or just keep local
      // For now, let's assume local is source of truth if active
    } else {
      // No server data, so we must insert
      shouldUpdateServer = true;
    }

    if (shouldUpdateServer) {
      const { error: upsertError } = await supabase
        .from("user_progress")
        .upsert({
          user_id: user.id,
          current_session: localProgress.currentSession,
          completed_sessions: localProgress.completedSessions,
          mastered_question_ids: localProgress.masteredQuestionIds,
          session_questions: localProgress.sessionQuestions,
          current_answers: localProgress.currentAnswers,
          last_updated: new Date().toISOString(), // Update timestamp
        });

      if (upsertError) throw upsertError;
    }

    return NextResponse.json({ 
      progress: localProgress,
      action: "synced" 
    });

  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: serverProgress, error } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      throw error;
    }

    if (!serverProgress) {
      return NextResponse.json({ progress: null });
    }

    return NextResponse.json({
      progress: {
        completedSessions: serverProgress.completed_sessions,
        currentSession: serverProgress.current_session,
        masteredQuestionIds: serverProgress.mastered_question_ids,
        sessionQuestions: serverProgress.session_questions,
        currentAnswers: serverProgress.current_answers,
        lastUpdated: serverProgress.last_updated,
      }
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
