"use client";

import { useState } from "react";
import {
  createBook,
  updateBook,
  deleteBook,
  type CreateBookInput,
  type UpdateBookInput,
  type ListBooksFields,
} from "@/lib/ash_generated";

import {
  useRealtimeBooks,
  type Book,
  ACTIVITY_ICONS,
  ACTIVITY_LABELS,
} from "@/lib/use-realtime-books";

const BOOK_FIELDS = ["id", "title", "author", "description", "isbn", "pages", "genre", "publishedAt"] as const;
const BOOK_FIELDS_MUT = [...BOOK_FIELDS] as ListBooksFields;


type FormData = {
  title: string;
  author: string;
  description: string;
  isbn: string;
  pages: string;
  genre: string;
  publishedAt: string;
};

const EMPTY_FORM: FormData = {
  title: "",
  author: "",
  description: "",
  isbn: "",
  pages: "",
  genre: "",
  publishedAt: "",
};

function bookToForm(book: Book): FormData {
  return {
    title: book.title,
    author: book.author,
    description: book.description ?? "",
    isbn: book.isbn ?? "",
    pages: book.pages?.toString() ?? "",
    genre: book.genre ?? "",
    publishedAt: book.publishedAt ?? "",
  };
}

function formToCreateInput(form: FormData): CreateBookInput {
  return {
    title: form.title,
    author: form.author,
    description: form.description || null,
    isbn: form.isbn || null,
    pages: form.pages ? parseInt(form.pages) : null,
    genre: form.genre || null,
    publishedAt: form.publishedAt || null,
  };
}

function formToUpdateInput(form: FormData): UpdateBookInput {
  return {
    title: form.title,
    author: form.author,
    description: form.description || null,
    isbn: form.isbn || null,
    pages: form.pages ? parseInt(form.pages) : null,
    genre: form.genre || null,
    publishedAt: form.publishedAt || null,
  };
}

function BookForm({
  initial,
  onSubmit,
  onCancel,
  loading,
}: {
  initial: FormData;
  onSubmit: (form: FormData) => void;
  onCancel: () => void;
  loading: boolean;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Title *</label>
          <input value={form.title} onChange={set("title")} className={input} placeholder="The Great Gatsby" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Author *</label>
          <input value={form.author} onChange={set("author")} className={input} placeholder="F. Scott Fitzgerald" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Genre</label>
          <input value={form.genre} onChange={set("genre")} className={input} placeholder="Fiction" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Pages</label>
          <input value={form.pages} onChange={set("pages")} className={input} type="number" placeholder="180" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">ISBN</label>
          <input value={form.isbn} onChange={set("isbn")} className={input} placeholder="978-0-7432-7356-5" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Published at</label>
          <input value={form.publishedAt} onChange={set("publishedAt")} className={input} type="date" />
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-slate-600">Description</label>
        <textarea value={form.description} onChange={set("description")} className={input + " h-20 resize-none"} placeholder="A short description…" />
      </div>
      <div className="flex justify-end gap-2 pt-1">
        <button onClick={onCancel} className={btnSecondary}>Cancel</button>
        <button onClick={() => onSubmit(form)} disabled={loading || !form.title || !form.author} className={btnPrimary}>
          {loading ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}

export default function BooksClient({ initial }: { initial: Book[] }) {
  const { books, viewers, activity } = useRealtimeBooks(initial);
  const [modal, setModal] = useState<"create" | { id: string; form: FormData } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async (form: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await createBook({ input: formToCreateInput(form), fields: BOOK_FIELDS_MUT });
      if ("errors" in res) {
        setError(res.errors.map((e) => e.message).join(", "));
      } else {
        setModal(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id: string, form: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const res = await updateBook({ identity: id, input: formToUpdateInput(form), fields: BOOK_FIELDS_MUT });
      if ("errors" in res) {
        setError(res.errors.map((e) => e.message).join(", "));
      } else {
        setModal(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this book?")) return;
    setLoading(true);
    try {
      await deleteBook({ identity: id });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-8">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-slate-900">Books</h1>
          <span className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            {viewers} {viewers === 1 ? "viewer" : "viewers"} online
          </span>
        </div>
        <button onClick={() => setModal("create")} className={btnPrimary}>
          + Add book
        </button>
      </div>

      <div className="flex gap-6">
        {/* Main content */}
        <div className="min-w-0 flex-1 space-y-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          {modal === "create" && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">New book</h2>
              <BookForm
                initial={EMPTY_FORM}
                onSubmit={handleCreate}
                onCancel={() => setModal(null)}
                loading={loading}
              />
            </div>
          )}

          {typeof modal === "object" && modal !== null && (
            <div className="rounded-xl border border-orange-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-slate-800">Edit book</h2>
              <BookForm
                initial={modal.form}
                onSubmit={(form) => handleUpdate(modal.id, form)}
                onCancel={() => setModal(null)}
                loading={loading}
              />
            </div>
          )}

          {books.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              No books yet. Add the first one!
            </div>
          ) : (
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-left text-xs font-medium uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Author</th>
                <th className="px-4 py-3">Genre</th>
                <th className="px-4 py-3">Pages</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-900">{book.title}</td>
                  <td className="px-4 py-3 text-slate-600">{book.author}</td>
                  <td className="px-4 py-3 text-slate-500">{book.genre ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{book.pages ?? "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{book.publishedAt ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setModal({ id: book.id, form: bookToForm(book) })}
                        className="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
                        className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          )}
        </div>

        {/* Activity feed */}
        <div className="w-72 shrink-0">
          <div className="sticky top-8 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-700">Live activity</h2>
            </div>
            {activity.length === 0 ? (
              <p className="px-4 py-6 text-center text-xs text-slate-400">
                Waiting for changes…
              </p>
            ) : (
              <ul className="divide-y divide-slate-50">
                {activity.map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 text-base">{ACTIVITY_ICONS[item.type]}</span>
                      <div className="min-w-0">
                        <p className="text-xs text-slate-500">{ACTIVITY_LABELS[item.type]}</p>
                        <p className="truncate text-sm font-medium text-slate-800">{item.title}</p>
                        <p className="text-xs text-slate-400">
                          {new Date(item.at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const input =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400";
const btnPrimary =
  "rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600 disabled:opacity-50";
const btnSecondary =
  "rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50";
