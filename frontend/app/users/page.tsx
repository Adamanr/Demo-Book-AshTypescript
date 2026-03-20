import { listUsers } from "@/lib/ash_generated";
import { serverFetch } from "@/lib/ash-client";
import UserSearch from "./user-search";

type User = { id: string; email: string };

async function getUsers(): Promise<User[]> {
  const result = await listUsers({
    fields: ["id", "email"] as const,
    customFetch: serverFetch,
  });
  if ("errors" in result) return [];
  return result.data as User[];
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-8">
      <h1 className="text-3xl font-bold text-slate-900">Users</h1>

      <UserSearch />

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold text-slate-800">
          All users{" "}
          <span className="text-sm font-normal text-slate-500">
            ({users.length})
          </span>
        </h2>
        {users.length === 0 ? (
          <p className="text-sm text-slate-500">No users found.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {users.map((user) => (
              <li key={user.id} className="py-3">
                <p className="text-sm font-medium text-slate-800">
                  {user.email}
                </p>
                <p className="text-xs text-slate-400">{user.id}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
