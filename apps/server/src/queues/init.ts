import { Queue } from "bullmq";

import { connection } from "./redis";
import { RESOURCE_QUEUE_KEYS } from "./keys";

export const resourceQueue = new Queue(RESOURCE_QUEUE_KEYS.QUEUE_NAME, {
  connection,
});
