import { FastifyInstance } from "fastify";
import {
  addIntern,
  getIntern,
  getInterns,
  updateIntern,
} from "../controllers/internController";
import {
  addTeamlead,
  deleteTeamlead,
  getTeamlead,
  getTeamleads,
  updateTeamlead,
} from "../controllers/teamleadController";
import { authenticate } from "../hooks/authenticate";

export default async function (app: FastifyInstance) {
  // Стажеры / Новые разработчики
  app.get("/interns", { handler: getInterns });
  app.get("/interns/:id", { handler: getIntern });
  app.put("/interns/:id", { handler: updateIntern, preHandler: authenticate });
  app.post("/interns", { handler: addIntern, preHandler: authenticate });

  // Тимлиди
  app.get("/teamleads", { handler: getTeamleads });
  app.get("/teamleads/:id", { handler: getTeamlead });
  app.post("/teamleads", {
    handler: addTeamlead,
    preHandler: authenticate,
  });
  app.put("/teamleads/:id", {
    handler: updateTeamlead,
    preHandler: authenticate,
  });
  app.delete("/teamleads/:id", {
    handler: deleteTeamlead,
    preHandler: authenticate,
  });
}
