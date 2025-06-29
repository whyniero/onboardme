import { FastifyInstance } from "fastify";
import {
  loginHandler,
  logoutHandler,
  registerHandler,
} from "../controllers/authController";

export default async function (app: FastifyInstance) {
  app.post("/login", { handler: loginHandler });
  app.post("/logout", { handler: logoutHandler });
  app.post("/register", { handler: registerHandler });
}
