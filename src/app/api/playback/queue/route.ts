import { getQueueState } from "@/app/_lib/queue";
import { NextResponse } from "next/server";

export async function GET() {
  const queue = await getQueueState();
  return NextResponse.json(queue);
}
