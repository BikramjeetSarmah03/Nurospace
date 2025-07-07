import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { z } from "zod";

import type { IProject, SuccessResponse } from "@productify/shared/types";
import { ProjectSchema } from "@productify/shared/schemas/project";

import { db } from "@/db";
import { projectsTable } from "@/db/schema/project";

import { isAuthenticated } from "@/middleware/auth";

export const projectRoutes = new Hono()
  .get("/", isAuthenticated, async (c) => {
    const user = c.get("user");

    if (!user) throw new HTTPException(401, { message: "Unauthorized" });

    // Fetch projects from the database
    const projects = await db
      .select({
        id: projectsTable.id,
        name: projectsTable.name,
      })
      .from(projectsTable)
      .where(eq(projectsTable.userId, user.id));

    return c.json<SuccessResponse<{ id: string; name: string }[]>>({
      message: "Project Fetched",
      success: true,
      data: projects,
    });
  })
  .post("/", isAuthenticated, zValidator("json", ProjectSchema), async (c) => {
    const body = c.req.valid("json");
    const user = c.get("user");

    if (!user) throw new HTTPException(401, { message: "Unauthorized" });

    const projects = await db
      .insert(projectsTable)
      .values({
        name: body.name,
        userId: user.id,
        description: body.description,
      })
      .returning({
        id: projectsTable.id,
        name: projectsTable.name,
        description: projectsTable.description,
        createdAt: projectsTable.createdAt,
        updatedAt: projectsTable.updatedAt,
        userId: projectsTable.userId,
      });

    const project = projects[0];

    return c.json<SuccessResponse<IProject>>({
      message: "Project Created",
      success: true,
      data: project,
    });
  })
  .get(
    "/:projectId",
    isAuthenticated,
    zValidator(
      "param",
      z.object({
        projectId: z.string(),
      }),
    ),
    async (c) => {
      const { projectId } = c.req.valid("param");

      const user = c.get("user");
      if (!user) throw new HTTPException(401, { message: "Unauthorized" });

      const project = await db
        .select()
        .from(projectsTable)
        .where(
          and(
            eq(projectsTable.id, projectId),
            eq(projectsTable.userId, user.id),
          ),
        )
        .limit(1);

      return c.json<SuccessResponse<IProject>>({
        success: true,
        message: "Project Deleted Successfully",
        data: project[0],
      });
    },
  )
  .delete(
    "/:projectId",
    isAuthenticated,
    zValidator(
      "param",
      z.object({
        projectId: z.string(),
      }),
    ),
    async (c) => {
      const { projectId } = c.req.valid("param");

      const user = c.get("user");
      if (!user) throw new HTTPException(401, { message: "Unauthorized" });

      // Check if the project exists and belongs to the user
      const project = await db
        .select()
        .from(projectsTable)
        .where(
          and(
            eq(projectsTable.id, projectId),
            eq(projectsTable.userId, user.id),
          ),
        )
        .limit(1);

      if (!project.length) {
        throw new HTTPException(404, { message: "Project not found" });
      }

      // Delete the project
      await db
        .delete(projectsTable)
        .where(
          and(
            eq(projectsTable.id, projectId),
            eq(projectsTable.userId, user.id),
          ),
        );

      return c.json<SuccessResponse>({
        success: true,
        message: "Project Deleted Successfully",
      });
    },
  );
