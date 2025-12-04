import mongoose, { Mongoose } from "mongoose";

const MONGODB_URI: string | undefined = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

// Cache object type
interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extend NodeJS global type for caching
declare global {
  var mongooseCache: MongooseCache | undefined;
}

// Use existing cache if available
/**
 * Global is used here to maintain a cached connection across hot reloads in development.
 * This prevents connections from growing exponentially during API route calls.
 */
const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

export default async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn; // Reuse existing connection
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 10, // Limit concurrent connections
    };

    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongooseInstance) => {
        return mongooseInstance;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  global.mongooseCache = cached; // Save to global cache

  return cached.conn;
}
