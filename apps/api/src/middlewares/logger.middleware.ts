import { Injectable, Logger, type NestMiddleware } from "@nestjs/common";
import type { FastifyReply, FastifyRequest } from "fastify";

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger("HTTP");

  use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    const { method, originalUrl } = req;
    const start = Date.now();

    this.logger.log(`Incoming Request: ${method} ${originalUrl}`);

    // Try to attach finish event on raw response or fallback to res
    const rawRes = res.raw || res;

    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    rawRes.on
      ? rawRes.on("finish", () => {
          const responseTime = Date.now() - start;
          this.logger.log(
            `Request ${method} ${originalUrl} completed in ${responseTime}ms`,
          );
        })
      : this.logger.warn(
          "Response raw stream not available to measure finish event",
        );

    next();
  }
}
