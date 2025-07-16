import { Worker } from "bullmq";

import { RESOURCE_QUEUE_KEYS } from "./keys";
import { connection } from "./redis";

const resourceWorker = new Worker(
  RESOURCE_QUEUE_KEYS.QUEUE_NAME,
  async (job) => {
    console.log("👷 Processing job:", job.name);
    console.log("📦 Data:", job.data);

    const { type, userId, filePath } = job.data;

    if (type === "pdf") {
      // Example: extract text, embed in vector DB, etc.
      console.log(`Processing PDF for user ${userId} at ${filePath}`);
    }

    if (type === "youtube") {
      // Example: fetch transcript
    }

    if (type === "image") {
      // Example: OCR, resize, etc.
    }

    // Mark job complete
    return { status: "done" };
  },
  { connection },
);

resourceWorker.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});
