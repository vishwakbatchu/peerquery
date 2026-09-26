cat > server/store.js << 'EOF'
import { getDB } from "./db.js";

// Users collection: stores user documents with email as the key
export async function getUsers() {
  const db = getDB();
  const usersCol = db.collection("users");
  const userDocs = await usersCol.find({}).toArray();
  
  // Convert to object format: { email: userData, ... }
  const result = {};
  for (const doc of userDocs) {
    const email = doc._id;
    const { _id, ...userData } = doc;
    result[email] = userData;
  }
  return result;
}

export async function saveUsers(users) {
  const db = getDB();
  const usersCol = db.collection("users");
  
  // Clear and rebuild users collection
  await usersCol.deleteMany({});
  
  for (const [email, userData] of Object.entries(users)) {
    await usersCol.updateOne(
      { _id: email },
      { $set: { _id: email, ...userData } },
      { upsert: true }
    );
  }
}

// Concepts per user: store in "userConcepts" collection
export async function getConcepts(userId) {
  const db = getDB();
  const conceptsCol = db.collection("userConcepts");
  const doc = await conceptsCol.findOne({ _id: userId });
  return doc?.concepts || {};
}

export async function saveConcepts(userId, concepts) {
  const db = getDB();
  const conceptsCol = db.collection("userConcepts");
  
  await conceptsCol.updateOne(
    { _id: userId },
    { $set: { _id: userId, concepts } },
    { upsert: true }
  );
}

// Chat history per user: store in "chatHistory" collection
export async function getChatHistory(userId) {
  const db = getDB();
  const chatCol = db.collection("chatHistory");
  const doc = await chatCol.findOne({ _id: userId });
  return doc?.messages || [];
}

export async function saveChatHistory(userId, messages) {
  const db = getDB();
  const chatCol = db.collection("chatHistory");
  
  await chatCol.updateOne(
    { _id: userId },
    { $set: { _id: userId, messages } },
    { upsert: true }
  );
}
EOF
