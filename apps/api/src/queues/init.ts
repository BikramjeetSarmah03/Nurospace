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

// Note: Using proper event names for BullMQ queue events
resourceQueue.on("active", (job: Job) => {
  console.log("⚡ Queue: Job started:", job.id);
});

resourceQueue.on("completed", (job: Job) => {
  console.log("✅ Queue: Job completed:", job.id);
});

resourceQueue.on("failed", (job: Job, err: Error) => {
  console.error("❌ Queue: Job failed:", job?.id, err);
});

console.log("🚀 Resource queue initialized with monitoring");
