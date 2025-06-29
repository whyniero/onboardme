import { FastifyInstance } from "fastify";
import { authenticate } from "../hooks/authenticate";
import {
  addStage,
  deleteStage,
  getStage,
  getStages,
  updateStage,
  getStagesForIntern,
} from "../controllers/stageController";

export default async function (app: FastifyInstance) {
  app.get("/", { handler: getStages });
  app.get("/:id", { handler: getStage });

  app.get("/interns/:internId", { handler: getStagesForIntern });

  app.post("/", { handler: addStage, preHandler: authenticate });

  app.delete("/:id", { handler: deleteStage, preHandler: authenticate });
  app.put("/:id", { handler: updateStage, preHandler: authenticate });
}
