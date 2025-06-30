import { FastifyInstance } from "fastify";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default async function downloadRoutes(app: FastifyInstance) {
  app.get("/download/:folder/:filename", async (request, reply) => {
    const { folder, filename } = request.params as {
      folder: string;
      filename: string;
    };
    const filePath = path.join(
      __dirname,
      `../../uploads/${folder}/${filename}`
    );

    if (!fs.existsSync(filePath)) {
      return reply.status(404).send({ error: "File not found" });
    }

    return reply
      .header("Content-Disposition", `attachment; filename="${filename}"`)
      .send(fs.createReadStream(filePath));
  });
}
