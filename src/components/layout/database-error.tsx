import { Card, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";

/**
 * Shown when MongoDB is unreachable. The two realistic causes — a missing
 * environment variable in the deployment, and a local server that isn't
 * running — need different fixes, so both are spelled out.
 */
export function DatabaseError({ message }: { message: string }) {
  const missingUri = message.includes("MONGODB_URI is not set");

  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="p-7">
        <span className="grid size-11 place-items-center rounded-xl border border-[var(--tier-poor)]/35 bg-[var(--tier-poor)]/12">
          <Icon name="DatabaseZap" className="size-5 text-[var(--tier-poor)]" />
        </span>

        <h2 className="mt-4 text-lg font-semibold tracking-tight">
          {missingUri ? "Database not configured" : "Can't reach the database"}
        </h2>
        <p className="mt-1.5 text-sm leading-relaxed text-[var(--color-ink-muted)]">
          {missingUri
            ? "Track stores every day as a document in MongoDB, and no connection string is set."
            : "The connection string is set, but the database refused or timed out on the connection."}
        </p>

        <div className="mt-5 space-y-4">
          <Fix
            title="Deployed on Vercel"
            body="Set MONGODB_URI in Project → Settings → Environment Variables, then redeploy. If the string is already there, check that Atlas Network Access allows 0.0.0.0/0 — Vercel's function IPs are not fixed."
          />
          <Fix
            title="Running locally"
            body="Check .env.local, and make sure a local server is up if you are pointing at one."
            code={`brew services start mongodb-community
mongosh --quiet --eval 'db.runCommand({ping:1})'`}
          />
        </div>

        <p className="mt-5 rounded-lg border border-[var(--color-hairline)] bg-[var(--tint-1)] px-3 py-2 font-mono text-[11.5px] leading-relaxed text-[var(--color-ink-faint)]">
          {message}
        </p>
      </CardContent>
    </Card>
  );
}

function Fix({
  title,
  body,
  code,
}: {
  title: string;
  body: string;
  code?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--color-hairline)] bg-[var(--tint-1)] p-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-ink-muted)]">
        {title}
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--color-ink-muted)]">
        {body}
      </p>
      {code && (
        <pre className="mt-3 overflow-x-auto rounded-lg bg-[var(--tint-3)] px-3 py-2 font-mono text-[12px] leading-relaxed text-[var(--color-ink-faint)]">
{code}
        </pre>
      )}
    </div>
  );
}
