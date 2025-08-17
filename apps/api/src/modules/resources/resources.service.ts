import { Service } from "honestjs";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { resources as resourcesTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { resourceQueue } from "@/queues/init";
import { RESOURCE_QUEUE_KEYS } from "@/queues/keys";

async function streamToBuffer(stream: ReadableStream): Promise<Buffer> {
  try {
    const reader = stream.getReader();
    const chunks: Uint8Array[] = [];

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error("[RESOURCES] Stream to buffer error:", error);
    throw new Error("Failed to process file stream");
  }
}

export interface UploadData {
  type: string;
  file?: File;
  link?: string;
  note?: string;
}

@Service()
export default class ResourcesService {
  async getAllResources(userId: string) {
    try {
      const resources = await db
        .select()
        .from(resourcesTable)
        .where(eq(resourcesTable.userId, userId));

      console.log("[RESOURCES] GET", { userId, count: resources.length });
      return { success: true, data: resources };
    } catch (error) {
      console.error("[RESOURCES] GET ERROR", error);
      return {
        success: false,
        status: 500,
        message: "Failed to fetch resources",
        timestamp: new Date().toISOString(),
        path: "/api/v1/resources",
      };
    }
  }

  async uploadResource(data: UploadData, userId: string) {
    console.log("[RESOURCES] Service upload started", {
      type: data.type,
      userId,
    });

    let name = "";
    let url = "";
    let content = "";

    try {
      if (data.type === "pdf" || data.type === "image") {
        if (
          !data.file ||
          typeof data.file !== "object" ||
          !("stream" in data.file)
        ) {
          return {
            success: false,
            status: 400,
            message: "Missing or invalid file.",
            timestamp: new Date().toISOString(),
            path: "/api/v1/resources/upload",
          };
        }

        console.log("[RESOURCES] Processing file:", data.file.name);
        const buffer = await streamToBuffer(
          (data.file as { stream(): ReadableStream }).stream(),
        );
        console.log("[RESOURCES] File buffer size:", buffer.length);

        const ext = data.file.name.split(".").pop();
        const safeExt = ext && ext.length < 8 ? ext : "bin";
        const filename = `${data.type}-${nanoid(10)}.${safeExt}`;
        const uploadPath = path.join(process.cwd(), "uploads", filename);

        fs.mkdirSync(path.dirname(uploadPath), { recursive: true });
        fs.writeFileSync(uploadPath, buffer);

        name = data.file.name;
        url = `/uploads/${filename}`;
        console.log("[RESOURCES] File saved:", uploadPath);
      }

      if (data.type === "youtube") {
        if (!data.link) {
          return {
            success: false,
            status: 400,
            message: "Missing YouTube link.",
            timestamp: new Date().toISOString(),
            path: "/api/v1/resources/upload",
          };
        }
        name = "YouTube Video";
        url = data.link;
      }

      if (data.type === "notes") {
        if (!data.note) {
          return {
            success: false,
            status: 400,
            message: "Note content missing.",
            timestamp: new Date().toISOString(),
            path: "/api/v1/resources/upload",
          };
        }
        name = "Note";
        content = data.note;
        url = "note";
      }

      console.log("[RESOURCES] Inserting into database");
      const inserted = await db
        .insert(resourcesTable)
        .values({ name, url, content, type: data.type, userId })
        .returning({ id: resourcesTable.id });

      console.log("[RESOURCES] Database insert successful:", inserted[0].id);

      // Add job to queue for processing
      console.log(
        "[RESOURCES] Adding job to queue for resource:",
        inserted[0].id,
      );

      const job = await resourceQueue.add(RESOURCE_QUEUE_KEYS.PROCESS_NAME, {
        resourceId: inserted[0].id,
        url,
        userId,
        type: data.type,
      });

      console.log(
        "[RESOURCES] Job added to queue:",
        job.id,
        "Status:",
        job.status,
      );

      console.log("[RESOURCES] UPLOAD COMPLETE", {
        userId,
        type: data.type,
        url,
        id: inserted[0].id,
      });

      return { success: true, data: inserted[0] };
    } catch (error) {
      console.error("[RESOURCES] Service upload error:", error);
      return {
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : "Upload failed",
        timestamp: new Date().toISOString(),
        path: "/api/v1/resources/upload",
      };
    }
  }
}
