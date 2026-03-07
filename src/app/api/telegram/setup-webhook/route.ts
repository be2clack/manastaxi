import { NextResponse } from "next/server";
import { setWebhook } from "@/lib/telegram/client";
import { auth } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await auth();
  if (!session)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { botType } = await request.json();

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}`;

  const webhookPaths: Record<string, string> = {
    client: "/api/telegram/client",
    driver: "/api/telegram/driver",
  };

  const path = webhookPaths[botType];
  if (!path)
    return NextResponse.json({ error: "Invalid bot type" }, { status: 400 });

  const result = await setWebhook(botType, `${appUrl}${path}`);
  return NextResponse.json(result);
}
