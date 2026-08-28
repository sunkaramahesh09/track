import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

/**
 * Database name. Atlas connection strings often omit the path segment, in
 * which case the driver would silently use "test"; naming it explicitly makes
 * the target the same whether the URI carries a database or not.
 */
const DB_NAME = process.env.MONGODB_DB ?? "track";

/**
 * Serverless functions are recycled, not long-lived: each warm instance should
 * reuse one connection pool rather than dialling Atlas on every request, and a
 * cold instance must not leave a rejected promise cached forever.
 *
 * Next.js also hot-reloads modules in development, which would otherwise open a
 * fresh pool on every edit — the same cache solves both.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

const globalWithMongoose = globalThis as typeof globalThis & {
  __trackMongoose?: MongooseCache;
};

const cached: MongooseCache = (globalWithMongoose.__trackMongoose ??= {
  conn: null,
  promise: null,
});

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;

  // Checked here rather than at module load: `next build` imports this module
  // while collecting routes, and a top-level throw would fail the build before
  // any environment variable is read. Failing here surfaces as the app's
  // database-error screen instead.
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Add it to .env.local locally, or to the " +
        "project's Environment Variables in Vercel.",
    );
  }

  cached.promise ??= mongoose
    .connect(MONGODB_URI, {
      dbName: DB_NAME,
      // Fail fast rather than hanging a request when the cluster is asleep.
      bufferCommands: false,
      serverSelectionTimeoutMS: 10_000,
      socketTimeoutMS: 45_000,
      // Each warm function instance holds its own pool, so keep it small and
      // let idle sockets drop — Atlas free tiers cap total connections.
      maxPoolSize: 5,
      minPoolSize: 0,
      maxIdleTimeMS: 30_000,
      retryWrites: true,
    })
    .catch((error) => {
      // Clear the cached promise so the next request retries instead of
      // permanently reusing a rejected connection.
      cached.promise = null;
      throw error;
    });

  cached.conn = await cached.promise;
  return cached.conn;
}

export { MONGODB_URI, DB_NAME };
