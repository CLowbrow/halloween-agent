import * as http from "node:http";
import * as crypto from "node:crypto";
import { runMonsterizer } from "./monsterAgent.js";

const jobs = new Map();

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathSegments = url.pathname.split("/").filter(Boolean);

    if (req.method === "POST" && url.pathname === "/monsterize") {
      // Endpoint to start a new job
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", async () => {
        try {
          const { image } = JSON.parse(body);
          if (!image) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Image data is required" }));
            return;
          }

          const jobId = crypto.randomUUID();
          jobs.set(jobId, { status: "processing" });

          res.writeHead(202, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ jobId }));

          try {
            const transformedImage = await runMonsterizer(image);
            jobs.set(jobId, { status: "completed", image: transformedImage });
          } catch (error) {
            console.error(`Job ${jobId} failed:`, error);
            jobs.set(jobId, { status: "failed", error: error.message });
          }
        } catch (error) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ error: "Invalid JSON" }));
        }
      });
    } else if (
      req.method === "GET" &&
      pathSegments[0] === "status" &&
      pathSegments[1]
    ) {
      // Endpoint to check job status
      const jobId = pathSegments[1];
      const job = jobs.get(jobId);

      if (job) {
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(job));
      } else {
        res.writeHead(404, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Job not found" }));
      }
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not Found" }));
    }
  } catch (error) {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
  }
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
