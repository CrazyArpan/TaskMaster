import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
// during API Route usage.
let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  // Return early with null connection if no URI is provided
  // This allows the app to build without a valid MongoDB URI
  if (!MONGODB_URI) {
    console.warn("MongoDB URI not found. Database connection will be skipped.")
    return null
  }

  // Check URI format without throwing an error that would break the build
  const isValidUri = MONGODB_URI.startsWith("mongodb://") || MONGODB_URI.startsWith("mongodb+srv://")

  if (!isValidUri) {
    console.error("Invalid MongoDB URI format. URI must start with 'mongodb://' or 'mongodb+srv://'")
    return null
  }

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongoose) => {
        return mongoose
      })
      .catch((err) => {
        console.error("MongoDB connection error:", err)
        cached.promise = null
        return null
      })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error("Error resolving MongoDB connection:", e)
    return null
  }

  return cached.conn
}

export default connectDB

