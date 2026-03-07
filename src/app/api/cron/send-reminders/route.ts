import { NextResponse } from "next/server";
import { sendDriverReminders } from "@/lib/cron/reminders";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await sendDriverReminders();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reminders cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
