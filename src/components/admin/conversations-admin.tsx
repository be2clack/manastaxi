"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type Message = {
  id: number;
  conversationId: number;
  role: "client" | "bot" | "manager";
  content: string;
  metadata: unknown;
  createdAt: Date | null;
};

type Conversation = {
  id: number;
  channel: "whatsapp" | "telegram";
  externalChatId: string;
  clientPhone: string | null;
  clientName: string | null;
  language: string | null;
  clientCountry: string | null;
  clientCountryName: string | null;
  clientPhoneCountryCode: string | null;
  bookingId: number | null;
  status: "active" | "completed" | "archived" | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  messages: Message[];
};

const statusLabels: Record<string, string> = {
  active: "Активная",
  completed: "Завершена",
  archived: "Архив",
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  archived: "bg-gray-100 text-gray-800",
};

function formatTime(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatFullTime(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function ConversationsAdmin({
  conversations,
}: {
  conversations: Conversation[];
}) {
  const [selectedId, setSelectedId] = useState<number | null>(
    conversations[0]?.id ?? null
  );

  const selected = conversations.find((c) => c.id === selectedId);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Переписки</h1>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <MessageCircle className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p>Нет переписок</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex gap-4" style={{ height: "calc(100vh - 180px)" }}>
          {/* Left panel - conversation list */}
          <div className="w-1/3 overflow-y-auto rounded-lg border bg-white">
            <div className="divide-y">
              {conversations.map((conv) => {
                const lastMsg =
                  conv.messages[conv.messages.length - 1];
                const isActive = conv.id === selectedId;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedId(conv.id)}
                    className={`w-full px-4 py-3 text-left transition-colors hover:bg-gray-50 ${
                      isActive ? "bg-blue-50 border-l-4 border-l-taxi-blue" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          {conv.clientName || conv.clientPhone || "Неизвестный"}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[10px] px-1.5 py-0"
                        >
                          {conv.channel === "whatsapp" ? "WA" : "TG"}
                        </Badge>
                      </div>
                      {conv.status && (
                        <Badge
                          className={`text-[10px] ${
                            statusColors[conv.status] || ""
                          }`}
                        >
                          {statusLabels[conv.status] || conv.status}
                        </Badge>
                      )}
                    </div>
                    {lastMsg && (
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {lastMsg.content}
                      </p>
                    )}
                    <p className="mt-0.5 text-[10px] text-muted-foreground">
                      {formatTime(conv.updatedAt)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right panel - chat view */}
          <div className="flex w-2/3 flex-col rounded-lg border bg-white">
            {selected ? (
              <>
                {/* Client info header */}
                <div className="border-b px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">
                        {selected.clientName || "Неизвестный клиент"}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {selected.clientPhone && (
                          <span>{selected.clientPhone}</span>
                        )}
                        {selected.clientCountryName && (
                          <span>{selected.clientCountryName}</span>
                        )}
                        {selected.language && (
                          <span>Язык: {selected.language}</span>
                        )}
                        <Badge variant="outline">
                          {selected.channel === "whatsapp"
                            ? "WhatsApp"
                            : "Telegram"}
                        </Badge>
                      </div>
                    </div>
                    {selected.bookingId && (
                      <Badge variant="secondary">
                        Заказ #{selected.bookingId}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {selected.messages.length === 0 ? (
                    <p className="text-center text-sm text-muted-foreground py-8">
                      Нет сообщений
                    </p>
                  ) : (
                    selected.messages.map((msg) => {
                      const isClient = msg.role === "client";
                      const isBot = msg.role === "bot";
                      const isManager = msg.role === "manager";

                      return (
                        <div
                          key={msg.id}
                          className={`flex ${
                            isClient ? "justify-start" : "justify-end"
                          }`}
                        >
                          <div
                            className={`max-w-[70%] rounded-lg px-3 py-2 ${
                              isClient
                                ? "bg-gray-100 text-gray-900"
                                : isBot
                                ? "bg-blue-500 text-white"
                                : "bg-green-500 text-white"
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-medium opacity-70">
                                {isClient
                                  ? "Клиент"
                                  : isBot
                                  ? "Бот"
                                  : "Менеджер"}
                              </span>
                            </div>
                            <p className="text-sm whitespace-pre-wrap">
                              {msg.content}
                            </p>
                            <p
                              className={`text-[10px] mt-1 ${
                                isClient
                                  ? "text-muted-foreground"
                                  : "opacity-70"
                              }`}
                            >
                              {formatFullTime(msg.createdAt)}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Reply input (placeholder, not functional) */}
                <div className="border-t p-3">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Написать ответ..."
                      className="flex-1"
                      disabled
                    />
                    <Button disabled className="bg-taxi-blue">
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="mt-1 text-[10px] text-muted-foreground">
                    Отправка сообщений будет доступна в следующей версии
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-1 items-center justify-center text-muted-foreground">
                <p>Выберите переписку</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
