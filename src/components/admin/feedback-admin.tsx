"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type FeedbackItem = {
  id: number;
  bookingId: number;
  driverId: number;
  ratingDriver: number;
  ratingVehicle: number;
  comment: string | null;
  language: string | null;
  createdAt: Date | null;
};

function StarRating({ rating, max = 5 }: { rating: number; max?: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rating
              ? "fill-yellow-400 text-yellow-400"
              : "fill-none text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function formatDate(date: Date | null) {
  if (!date) return "";
  return new Date(date).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FeedbackAdmin({ feedback }: { feedback: FeedbackItem[] }) {
  const [filter, setFilter] = useState("all");

  const filtered = feedback.filter((f) => {
    if (filter === "all") return true;
    if (filter === "5") return f.ratingDriver === 5;
    if (filter === "4+") return f.ratingDriver >= 4;
    if (filter === "3-") return f.ratingDriver <= 3;
    return true;
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Отзывы</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Фильтр:</span>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все ({feedback.length})</SelectItem>
              <SelectItem value="5">
                5 звёзд ({feedback.filter((f) => f.ratingDriver === 5).length})
              </SelectItem>
              <SelectItem value="4+">
                4+ звезды ({feedback.filter((f) => f.ratingDriver >= 4).length})
              </SelectItem>
              <SelectItem value="3-">
                3 и ниже ({feedback.filter((f) => f.ratingDriver <= 3).length})
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Star className="mx-auto mb-4 h-12 w-12 opacity-30" />
            <p>Нет отзывов</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Дата</TableHead>
                  <TableHead>Заказ #</TableHead>
                  <TableHead>Водитель</TableHead>
                  <TableHead>Машина</TableHead>
                  <TableHead>Комментарий</TableHead>
                  <TableHead>Язык</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(item.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">#{item.bookingId}</Badge>
                    </TableCell>
                    <TableCell>
                      <StarRating rating={item.ratingDriver} />
                    </TableCell>
                    <TableCell>
                      <StarRating rating={item.ratingVehicle} />
                    </TableCell>
                    <TableCell className="max-w-[300px]">
                      <p className="truncate text-sm">
                        {item.comment || (
                          <span className="text-muted-foreground">--</span>
                        )}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {item.language || "N/A"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
