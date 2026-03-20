"use client";

import { useState } from "react";
import { getByEmail } from "@/lib/ash_generated";

type User = { id: string; email: string };

export default function UserSearch() {
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await getByEmail({
        input: { email },
        fields: ["id", "email"] as const,
      });
      if ("errors" in res) {
        setError(res.errors.map((e) => e.message).join(", "));
      } else {
        setResult(res.data as User);
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-800">
        Find user by email
      </h2>
      <div className="flex gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="user@example.com"
          className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
        />
        <button
          onClick={handleSearch}
          disabled={loading || !email}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm text-white transition-colors hover:bg-orange-600 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      {result && (
        <pre className="mt-3 overflow-x-auto rounded-lg border bg-slate-50 p-4 text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
