import { MongoClient } from "mongodb";

let client = null;
let db = null;

export async function connectDB(mongoUri) {
  if (client && db) {
    console.log("Database already connected");
    return db;
  }

  try {
    client = new MongoClient(mongoUri);
    await client.connect();
    db = client.db("peerquery");

    // Create indexes for faster queries
    const users = db.collection("users");
    await users.createIndex({ email: 1 }, { unique: true });

    console.log("Connected to MongoDB successfully");
    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    throw error;
  }
}

export function getDB() {
  if (!db) {
    throw new Error("Database not initialized. Call connectDB first.");
  }
  return db;
}

export async function disconnectDB() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log("Disconnected from MongoDB");
  }
}
