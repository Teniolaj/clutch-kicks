import { createClient } from "@/lib/supabase/server";

async function count(table: string, filter?: [string, string | boolean]) {
  const supabase = await createClient();
  let query = supabase.from(table).select("*", { count: "exact", head: true });
  if (filter) query = query.eq(filter[0], filter[1]);
  const { count, error } = await query;
  return error ? null : count ?? 0;
}

export default async function AdminOverviewPage() {
  const [products, published, subscribers, promotions] = await Promise.all([
    count("products"),
    count("products", ["is_published", true]),
    count("newsletter_subscribers", ["status", "subscribed"]),
    count("promotions", ["is_active", true]),
  ]);

  const stats = [
    { label: "Products", value: products },
    { label: "Published", value: published },
    { label: "Active promos", value: promotions },
    { label: "Subscribers", value: subscribers },
  ];

  const failed = stats.some((s) => s.value === null);

  return (
    <div className="max-w-5xl">
      <span className="font-mono text-xs uppercase tracking-ultra-wide text-ink-muted">Dashboard</span>
      <h1 className="font-display uppercase text-[clamp(28px,4vw,40px)] leading-none mt-1">Overview</h1>

      {failed && (
        <p role="alert" className="mt-6 border-2 border-red text-red font-sans text-sm p-4">
          Couldn&apos;t read from the database. Check that the migrations have been run and the
          keys in .env.local are correct.
        </p>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-bg border-2 border-line p-5">
            <p className="font-mono text-[11px] uppercase tracking-ultra-wide text-ink-muted">{s.label}</p>
            <p className="font-display text-4xl mt-2">{s.value ?? "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
