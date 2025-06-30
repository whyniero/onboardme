import { FastifyInstance } from "fastify";
import {
  addPosition,
  deletePosition,
  getPosition,
  getPositions,
  updatePosition,
} from "../controllers/positionController.js";
import { authenticate } from "../hooks/authenticate.js";

export default async function (app: FastifyInstance) {
  app.get("/", { handler: getPositions });
  app.get("/:id", { handler: getPosition });

  app.post("/", { handler: addPosition, preHandler: authenticate });

  app.put("/:id", { handler: updatePosition, preHandler: authenticate });

  app.delete("/:id", { handler: deletePosition, preHandler: authenticate });
}
