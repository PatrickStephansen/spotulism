import { MongoClient } from "mongodb";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const sessionName = body.name;
  const mongoClient = new MongoClient(process.env.MONGO_CONNECTION_STRING!);
  const db = mongoClient.db('tasteTracer');
  const sessions = db.collection('sessions');
  sessions.insertOne({
    name: sessionName,
    dateCreated: new Date()
  })
}
