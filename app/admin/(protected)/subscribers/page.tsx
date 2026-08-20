import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createSubscriber, getSubscribers } from "@/lib/community-store";

async function createSubscriberAction(formData: FormData) {
  "use server";

  const session = await auth();
  if (!session?.user?.email || session.user.role !== "admin") {
    redirect("/admin");
  }

  const email = formData.get("email")?.toString().trim();
  const name = formData.get("name")?.toString().trim();
  const source = formData.get("source")?.toString().trim();
  const interest = formData.get("interest")?.toString().trim();

  if (!email) {
    redirect("/admin/subscribers?error=missing-email");
  }

  await createSubscriber({ email, name, source, interest });
  revalidatePath("/admin/subscribers");
  redirect("/admin/subscribers");
}

export default async function AdminSubscribersPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/admin/login");
  }

  if (session.user.role !== "admin") {
    redirect("/admin");
  }

  const subscribers = await getSubscribers();

  return (
    <div className="space-y-8">
      <header className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">Community</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">Subscribers</h1>
        <p className="mt-3 text-sm leading-7 text-stone-600 dark:text-stone-300">
          Track interested readers, collaborators, and community members who want to stay connected through the portfolio and forum.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-[24px] border border-stone-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Add subscriber</h2>
          <form action={createSubscriberAction} className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
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
                <span>Name</span>
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
                <span>Source</span>
                <input
                  name="source"
                  type="text"
                  className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 dark:border-stone-700 dark:bg-stone-950"
                  placeholder="Conference, blog, referral"
                />
              </label>
              <label className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
                <span>Interest</span>
                <input
                  name="interest"
                  type="text"
                  className="w-full rounded-2xl border border-stone-300 bg-white px-3 py-2 text-sm outline-none ring-0 dark:border-stone-700 dark:bg-stone-950"
                  placeholder="Mathematics, AI, research"
                />
              </label>
            </div>
            <button
              type="submit"
              className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900"
            >
              Save subscriber
            </button>
          </form>
        </section>

        <section className="rounded-[24px] border border-stone-200 bg-white/80 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80">
          <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Current list</h2>
          <div className="mt-5 space-y-3">
            {subscribers.length === 0 ? (
              <p className="text-sm text-stone-600 dark:text-stone-300">No subscribers yet.</p>
            ) : (
              subscribers.map((subscriber) => (
                <div key={subscriber.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/70">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-stone-900 dark:text-stone-50">{subscriber.name || subscriber.email}</p>
                      <p className="text-sm text-stone-600 dark:text-stone-300">{subscriber.email}</p>
                    </div>
                    <span className="rounded-full border border-stone-300 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-stone-600 dark:border-stone-700 dark:text-stone-300">
                      {subscriber.status}
                    </span>
                  </div>
                  {subscriber.interest ? (
                    <p className="mt-3 text-xs uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">{subscriber.interest}</p>
                  ) : null}
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
