import { listBooks, type ListBooksFields } from "@/lib/ash_generated";
import { serverFetch } from "@/lib/ash-client";
import BooksClient from "./books-client";
import type { Book } from "@/lib/use-realtime-books";

const BOOK_FIELDS: ListBooksFields = [...(["id", "title", "author", "description", "isbn", "pages", "genre", "publishedAt"] as const)];

async function getBooks(): Promise<Book[]> {
  const result = await listBooks({ fields: BOOK_FIELDS, customFetch: serverFetch });
  if ("errors" in result) return [];
  return result.data as Book[];
}

export default async function BooksPage() {
  const books = await getBooks();
  return <BooksClient initial={books} />;
}
