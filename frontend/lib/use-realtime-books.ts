"use client";

import { useEffect, useRef, useState } from "react";
import { Socket, Channel, Presence } from "phoenix";

export type Book = {
  id: string;
  title: string;
  author: string;
  description: string | null;
  isbn: string | null;
  pages: number | null;
  genre: string | null;
  publishedAt: string | null;
};

export type Activity = {
  id: number;
  type: "created" | "updated" | "deleted";
  title: string;
  at: string;
};

const SOCKET_URL =
  process.env.NEXT_PUBLIC_PHOENIX_WS_URL ?? "ws://localhost:4000/socket";

const ACTIVITY_ICONS = {
  created: "📗",
  updated: "✏️",
  deleted: "🗑️",
} as const;

const ACTIVITY_LABELS = {
  created: "Добавлена",
  updated: "Обновлена",
  deleted: "Удалена",
} as const;

export { ACTIVITY_ICONS, ACTIVITY_LABELS };

let activityCounter = 0;

export function useRealtimeBooks(initial: Book[]) {
  const [books, setBooks] = useState<Book[]>(initial);
  const [viewers, setViewers] = useState(1);
  const [activity, setActivity] = useState<Activity[]>([]);
  const channelRef = useRef<Channel | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const pushActivity = (type: Activity["type"], title: string, at: string) => {
    setActivity((prev) =>
      [{ id: ++activityCounter, type, title, at }, ...prev].slice(0, 20)
    );
  };

  useEffect(() => {
    const socket = new Socket(SOCKET_URL);
    socket.connect();
    socketRef.current = socket;

    const channel = socket.channel("books:lobby", {});
    channelRef.current = channel;

    const presence = new Presence(channel);

    presence.onSync(() => {
      setViewers(Object.keys(presence.list()).length);
    });

    channel.on("book:created", (book: Book) => {
      setBooks((prev) => [...prev, book]);
    });

    channel.on("book:updated", (book: Book) => {
      setBooks((prev) => prev.map((b) => (b.id === book.id ? book : b)));
    });

    channel.on("book:deleted", ({ id }: { id: string }) => {
      setBooks((prev) => prev.filter((b) => b.id !== id));
    });

    channel.on("activity", ({ type, title, at }: Omit<Activity, "id">) => {
      pushActivity(type, title, at);
    });

    channel.join().receive("error", (err) => {
      console.error("Books channel error:", err);
    });

    return () => {
      channel.leave();
      socket.disconnect();
    };
  }, []);

  return { books, setBooks, viewers, activity };
}
