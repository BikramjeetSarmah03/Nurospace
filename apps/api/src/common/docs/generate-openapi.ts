/** biome-ignore-all lint/suspicious/noExplicitAny: <its okay we can have it> */
import type { RouteInfo } from "honestjs";
import fs from "node:fs";
import path from "node:path";

export interface Route {
  controller: string;
  handler: string;
  method: string;
  fullPath: string;
  parameters?: { index: number; name: string }[];
}

export function generateOpenAPISpec(
  routes: readonly RouteInfo[] | readonly Route[],
) {
  const paths: Record<string, any> = {};

  for (const route of routes) {
    const method = route.method.toLowerCase();

    if (!paths[route.fullPath]) {
      paths[route.fullPath] = {};
    }

    const parameters = (route.parameters || []).map((p) => ({
      name: p.name,
      in: p.name === "body" ? "query" : "query", // can refine later
      required: true,
      schema: { type: "string" },
    }));

    const pathItem: Record<string, any> = {
      tags: [route.controller],
      summary: `${route.handler.toString()} endpoint`,
      operationId: `${route.controller.toString()}_${route.handler.toString()}`,
      responses: {
        "200": { description: "OK" },
      },
    };

    if (parameters.some((p) => p.name === "body")) {
      pathItem.requestBody = {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                body: { type: "string" },
              },
              required: ["body"],
            },
          },
        },
      };
    } else if (parameters.length > 0) {
      pathItem.parameters = parameters;
    }

    paths[route.fullPath][method] = pathItem;
  }

  return {
    openapi: "3.1.0",
    info: {
      title: "HonestJS API",
      version: "1.0.0",
      description: "Auto-generated API documentation from HonestJS routes.",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],
    paths,
  };
}

export function writeOpenAPI(routes: readonly unknown[]) {
  const typedRoutes = routes as readonly Route[];
  const openapi = generateOpenAPISpec(typedRoutes);
  const filePath = path.join(process.cwd(), "openapi.json");
  fs.writeFileSync(filePath, JSON.stringify(openapi, null, 2));
  console.log(`✅ OpenAPI spec generated at ${filePath}`);
}
