import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "node:path";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import router from "./routes";
import { logger } from "./lib/logger";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// In production (self-hosted), serve the built React frontend from ./public
const publicDir = path.resolve(__dirname, "public");
if (existsSync(publicDir)) {
  app.use(express.static(publicDir));
  // SPA fallback — send index.html for any non-API route
  app.use((_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
  logger.info({ publicDir }, "Serving static frontend");
}

export default app;
