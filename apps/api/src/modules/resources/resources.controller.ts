import { Controller, Get, Post, UseGuards, Ctx } from "honestjs";
import type { Context } from "hono";
import { AuthGuard } from "@/modules/auth/auth.guard";
import { AuthContext, type IAuthContext } from "../auth/auth.decorator";
import ResourcesService from "./resources.service";

@Controller("resources")
export default class ResourcesController {
  private resourcesService = new ResourcesService();

  @Get("health")
  async health() {
    console.log("[RESOURCES] HEALTH endpoint hit");
    return {
      success: true,
      message: "Resources API is healthy!",
      timestamp: new Date().toISOString(),
    };
  }

  @Get("test")
  async test() {
    console.log("[RESOURCES] TEST endpoint hit");
    return {
      success: true,
      message: "Resources API is working!",
      timestamp: new Date().toISOString(),
    };
  }

  @Post("upload-test")
  @UseGuards(AuthGuard)
  async uploadTest(@Ctx() ctx: Context) {
    console.log("[RESOURCES] UPLOAD TEST started");

    try {
      const formData = await ctx.req.parseBody();
      console.log("[RESOURCES] TEST Form data keys:", Object.keys(formData));

      return {
        success: true,
        message: "Upload test successful",
        receivedData: Object.keys(formData),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[RESOURCES] UPLOAD TEST ERROR", error);
      return {
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : "Upload test failed",
        timestamp: new Date().toISOString(),
        path: "/api/v1/resources/upload-test",
      };
    }
  }

  @Get("")
  @UseGuards(AuthGuard)
  async getAllResources(@AuthContext() context: IAuthContext) {
    // console.log("[RESOURCES] GET request from user:", context.user.id);
    const result = await this.resourcesService.getAllResources(context.user.id);
    // console.log("[RESOURCES] GET result:", result);
    return result;
  }

  @Post("upload")
  @UseGuards(AuthGuard)
  async uploadResource(
    @Ctx() ctx: Context,
    @AuthContext() context: IAuthContext,
  ) {
    console.log("[RESOURCES] UPLOAD request started");

    try {
      // Parse multipart form data
      const formData = await ctx.req.parseBody();
      console.log("[RESOURCES] Form data keys:", Object.keys(formData));

      // Validate required fields
      const type = formData.type as string;
      if (!type || !["pdf", "image", "youtube", "notes"].includes(type)) {
        console.log("[RESOURCES] Invalid type:", type);
        return ctx.json(
          {
            success: false,
            status: 400,
            message:
              "Invalid or missing type. Must be one of: pdf, image, youtube, notes",
            timestamp: new Date().toISOString(),
            path: "/api/v1/resources/upload",
          },
          400,
        );
      }

      const uploadData = {
        type,
        file: formData.file as File | undefined,
        link: formData.link as string | undefined,
        note: formData.note as string | undefined,
      };

      // Additional validation based on type
      if (type === "pdf" || type === "image") {
        if (!uploadData.file) {
          console.log("[RESOURCES] Missing file for type:", type);
          return ctx.json(
            {
              success: false,
              status: 400,
              message: "File is required for PDF and image uploads",
              timestamp: new Date().toISOString(),
              path: "/api/v1/resources/upload",
            },
            400,
          );
        }
      }

      if (type === "youtube") {
        if (!uploadData.link) {
          console.log("[RESOURCES] Missing link for YouTube");
          return ctx.json(
            {
              success: false,
              status: 400,
              message: "YouTube link is required",
              timestamp: new Date().toISOString(),
              path: "/api/v1/resources/upload",
            },
            400,
          );
        }
      }

      if (type === "notes") {
        if (!uploadData.note) {
          console.log("[RESOURCES] Missing note content");
          return ctx.json(
            {
              success: false,
              status: 400,
              message: "Note content is required",
              timestamp: new Date().toISOString(),
              path: "/api/v1/resources/upload",
            },
            400,
          );
        }
      }

      console.log("[RESOURCES] UPLOAD REQUEST", {
        userId: context.user.id,
        type,
        hasFile: !!uploadData.file,
        hasLink: !!uploadData.link,
        hasNote: !!uploadData.note,
      });

      const result = await this.resourcesService.uploadResource(
        uploadData,
        context.user.id,
      );
      console.log("[RESOURCES] UPLOAD result:", result);

      // Explicitly return JSON response with status code
      return ctx.json(result, result.success ? 200 : 500);
    } catch (error) {
      console.error("[RESOURCES] UPLOAD ERROR", error);
      const errorResponse = {
        success: false,
        status: 500,
        message: error instanceof Error ? error.message : "Upload failed",
        timestamp: new Date().toISOString(),
        path: "/api/v1/resources/upload",
      };
      console.log("[RESOURCES] Returning error response:", errorResponse);
      return ctx.json(errorResponse, 500);
    }
  }
}
