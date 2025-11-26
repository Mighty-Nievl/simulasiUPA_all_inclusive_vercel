import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Delete user progress
    const { error: progressError } = await supabase
      .from("user_progress")
      .delete()
      .eq("user_id", user.id);

    if (progressError) {
      console.error("Error deleting user progress:", progressError);
      throw progressError;
    }

    // 2. Delete exam results
    const { error: resultsError } = await supabase
      .from("exam_results")
      .delete()
      .eq("user_id", user.id);

    if (resultsError) {
      console.error("Error deleting exam results:", resultsError);
      throw resultsError;
    }

    return NextResponse.json({ success: true, message: "Progress reset successfully" });
  } catch (error: any) {
    console.error("Reset progress error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
