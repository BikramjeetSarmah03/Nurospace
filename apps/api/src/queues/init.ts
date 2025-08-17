import { Queue } from "bullmq";
import { RESOURCE_QUEUE_KEYS } from "./keys";
import { connection } from "./redis";
import type { Job } from "bullmq";

export const resourceQueue = new Queue(RESOURCE_QUEUE_KEYS.QUEUE_NAME, {
  connection,
});

// Add queue monitoring
resourceQueue.on("waiting", (job: Job) => {
  console.log("📋 Queue: Job waiting:", job.id);
});

// @ts-expect-error: "active" is a valid event name for BullMQ Queue, but types may be outdated
resourceQueue.on("active", (job: Job) => {
  console.log("⚡ Queue: Job started:", job.id);
});

// @ts-expect-error: "completed" is a valid event name for BullMQ Queue, but types may be outdated
resourceQueue.on("completed", (job: Job) => {
  console.log("✅ Queue: Job completed:", job.id);
});

resourceQueue.on("error", (err: Error) => {
  console.error("❌ Queue: Error occurred:", err);
});

console.log("🚀 Resource queue initialized with monitoring");
