import type { SuccessResponse } from "@productify/shared/types";
import { Hono } from "hono";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { resourcesTable } from "@/db/schema/resource";
import { isAuthenticated } from "@/middleware/auth";
import { eq } from "drizzle-orm";

export const resourcesRoutes = new Hono()
  .post("/upload", isAuthenticated, async (c) => {
    const body = await c.req.parseBody();

    const type = body.type as string;
    const file = body.file as File | undefined;
    const link = body.link as string | undefined;
    const note = body.note as string | undefined;
    const userId = c.get("user")?.id;

    if (!userId) throw new Error("Unauthorized");

    let name = "";
    let url = "";
    let content = "";

    if (type === "pdf" || type === "image") {
      if (!file || typeof file !== "object" || !("stream" in file)) {
        return c.json(
          { success: false, message: "Missing or invalid file." },
          400,
        );
      }

      const buffer = await streamToBuffer(file.stream());
      const ext = file.name.split(".").pop();
      const safeExt = ext && ext.length < 8 ? ext : "bin";
      const filename = `${type}-${nanoid(10)}.${safeExt}`;
      const uploadPath = path.join(process.cwd(), "uploads", filename);

      // Ensure uploads folder exists
      fs.mkdirSync(path.dirname(uploadPath), { recursive: true });

      // Save to local filesystem
      fs.writeFileSync(uploadPath, buffer);

      name = file.name;
      url = `/uploads/${filename}`; // for serving to frontend
    }

    if (type === "youtube") {
      if (!link) {
        return c.json(
          { success: false, message: "Missing YouTube link." },
          400,
        );
      }

      name = "YouTube Video";
      url = link;
    }

    if (type === "notes") {
      if (!note) {
        return c.json(
          { success: false, message: "Note content missing." },
          400,
        );
      }

      name = "Note";
      content = note;
      url = "note"; // placeholder or null
    }

    // ✅ Save to DB
    await db.insert(resourcesTable).values({
      name,
      url,
      content,
      type,
      userId,
    });

    return c.json<SuccessResponse>({
      success: true,
      message: "Resource uploaded and saved!",
    });
  })
  .get("/", isAuthenticated, async (c) => {
    const userId = c.get("user")?.id;

    if (!userId) throw new Error("Unauthorized");

    const resources = await db
      .select()
      .from(resourcesTable)
      .where(eq(resourcesTable.userId, userId));

    return c.json({
      success: true,
      data: resources,
    });
  });

// 🔧 Utility to read a stream into buffer
export async function streamToBuffer(
  stream: ReadableStream<Uint8Array>,
): Promise<Buffer> {
  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value) chunks.push(value);
  }

  return Buffer.concat(chunks);
}
