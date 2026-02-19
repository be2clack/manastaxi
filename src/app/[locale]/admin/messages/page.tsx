export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getContactMessages, markMessageRead, deleteMessage } from "@/lib/admin-actions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2 } from "lucide-react";

export default async function AdminMessagesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await auth();
  if (!session) redirect(`/${locale}/admin/login`);

  const messages = await getContactMessages();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Сообщения ({messages.length})</h1>

      <div className="space-y-4">
        {messages.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Сообщений пока нет
            </CardContent>
          </Card>
        ) : (
          messages.map((msg) => (
            <Card
              key={msg.id}
              className={msg.isRead ? "opacity-60" : "border-l-4 border-l-taxi-blue"}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-semibold">{msg.name}</span>
                      {!msg.isRead && (
                        <Badge className="bg-taxi-blue text-white text-xs">
                          Новое
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {msg.email}
                      {msg.phone && ` | ${msg.phone}`}
                    </div>
                    <p className="mt-2 text-sm">{msg.message}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(msg.createdAt).toLocaleString("ru")}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    {!msg.isRead && (
                      <form
                        action={async () => {
                          "use server";
                          await markMessageRead(msg.id);
                        }}
                      >
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-green-500"
                          type="submit"
                          title="Отметить прочитанным"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      </form>
                    )}
                    <form
                      action={async () => {
                        "use server";
                        await deleteMessage(msg.id);
                      }}
                    >
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500"
                        type="submit"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
