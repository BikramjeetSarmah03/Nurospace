import type { SuccessResponse } from "@productify/shared/types";
import { Hono } from "hono";
import fs from "node:fs";
import path from "node:path";
import { nanoid } from "nanoid";
import { db } from "@/db";
import { resourcesTable } from "@/db/schema/resource";
import { isAuthenticated } from "@/middleware/auth";
import { eq } from "drizzle-orm";
import { resourceQueue } from "@/queues/init";
import { RESOURCE_QUEUE_KEYS } from "@/queues/keys";
import { streamToBuffer } from "@/lib/utils";

export const resourcesRoutes = new Hono()

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
  })
  .delete("/:id", isAuthenticated, async (c) => {
    const userId = c.get("user")?.id;
    const id = c.req.param("id");

    if (!userId) {
      return c.json({ success: false, message: "Unauthorized" }, 401);
    }

    // Optional: Check ownership before deletion
    const resource = await db.query.resourcesTable.findFirst({
      where: (res, { eq }) => eq(res.id, id),
    });

    if (!resource || resource.userId !== userId) {
      return c.json(
        { success: false, message: "Not found or not allowed" },
        404,
      );
    }

    // Optional: Remove uploaded file if applicable
    if (resource.type === "pdf" || resource.type === "image") {
      const localPath = path.join(process.cwd(), resource.url);
      try {
        fs.unlinkSync(localPath);
      } catch (err) {
        console.warn("⚠️ File deletion error:", err);
      }
    }

    // Delete from DB
    await db.delete(resourcesTable).where(eq(resourcesTable.id, id));

    return c.json({
      success: true,
      message: "Resource deleted successfully",
    });
  })
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

    await resourceQueue.add(RESOURCE_QUEUE_KEYS.PROCESS_NAME, {
      type,
      name,
      url,
      content,
      userId,
    });

    return c.json<SuccessResponse>({
      success: true,
      message: "Resource uploaded and saved!",
    });
  });
