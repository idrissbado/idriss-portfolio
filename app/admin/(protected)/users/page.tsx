import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createUserAccount, findUserByEmail, findUserByNickname, listUsers } from "@/lib/admin-access";
import { normalizeNickname } from "@/lib/nickname";

async function createUser(formData: FormData) {
  "use server";

  const session = await auth();

  if (!session?.user?.email || session.user.role !== "admin") {
    redirect("/admin");
  }

  const email = formData.get("email")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const nickname = normalizeNickname(formData.get("nickname")?.toString() ?? "");
  const password = formData.get("password")?.toString();
  const role = formData.get("role")?.toString() ?? "admin";

  if (!email || !nickname || !password) {
    redirect("/admin/users?error=missing-fields");
  }

  const [existingUser, existingNickname] = await Promise.all([
    findUserByEmail(email),
    findUserByNickname(nickname),
  ]);

  if (existingUser) {
    redirect("/admin/users?error=user-exists");
  }

  if (existingNickname) {
    redirect("/admin/users?error=nickname-exists");
  }

  await createUserAccount({
    email,
    name,
    nickname,
    password,
    role,
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export default async function AdminUsersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  if (session.user.role !== "admin") {
    redirect("/admin");
  }

  const users = await listUsers();

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">Admin</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">User access</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">
          Create additional admin accounts for collaborators so they can manage content from the same database-backed system.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[24px] border border-stone-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Create new access</h2>
          <form action={createUser} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 dark:border-stone-700 dark:bg-stone-950"
                  placeholder="person@example.com"
                />
              </label>
              <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                <span>Public nickname</span>
                <input
                  name="nickname"
                  type="text"
                  required
                  minLength={3}
                  maxLength={24}
                  pattern="[a-z0-9][a-z0-9_-]{2,23}"
                  className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 dark:border-stone-700 dark:bg-stone-950"
                  placeholder="jane-doe"
                />
              </label>
              <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                <span>Display name</span>
                <input
                  name="name"
                  type="text"
                  className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 dark:border-stone-700 dark:bg-stone-950"
                  placeholder="Jane Doe"
                />
              </label>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                <span>Password</span>
                <input
                  name="password"
                  type="password"
                  required
                  className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 dark:border-stone-700 dark:bg-stone-950"
                  placeholder="Choose a strong password"
                />
              </label>
              <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                <span>Role</span>
                <select
                  name="role"
                  defaultValue="admin"
                  className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 dark:border-stone-700 dark:bg-stone-950"
                >
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                </select>
              </label>
            </div>
            <button
              type="submit"
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900"
            >
              Create account
            </button>
          </form>
        </section>

        <section className="rounded-[24px] border border-stone-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Existing accounts</h2>
          <div className="mt-5 space-y-3">
            {users.length === 0 ? (
              <p className="text-sm text-stone-600 dark:text-stone-300">No users yet.</p>
            ) : (
              users.map((user) => (
                <div key={user.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/70">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-50">{user.name || user.email}</p>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">@{user.nickname}</p>
                      <p className="text-sm text-stone-600 dark:text-stone-300">{user.email}</p>
                    </div>
                    <span className="rounded-full border border-stone-300 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-600 dark:border-stone-700 dark:text-stone-300">
                      {user.role}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
