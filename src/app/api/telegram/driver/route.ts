import { NextResponse } from "next/server";
import { handleDriverUpdate } from "@/lib/telegram/driver-bot";

export async function POST(request: Request) {
  try {
    const update = await request.json();
    await handleDriverUpdate(update);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram driver webhook error:", error);
    return NextResponse.json({ ok: true }); // Always return 200
  }
}
