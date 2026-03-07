import { NextResponse } from "next/server";
import { dispatchPendingOrders } from "@/lib/cron/dispatch";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await dispatchPendingOrders();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Dispatch cron error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
