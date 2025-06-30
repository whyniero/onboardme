import { FastifyInstance } from "fastify";
import {
  addChat,
  deleteChat,
  getChat,
  getChats,
  getChatsForUser,
  getFormattedChatById,
  searchUsers,
  updateChat,
} from "../controllers/chatController.js";
import { authenticate } from "../hooks/authenticate.js";

export default async function (app: FastifyInstance) {
  app.get("/", { handler: getChats, preHandler: authenticate });
  app.get("/:id", { handler: getChat, preHandler: authenticate });

  app.get("/for-user/:userId", {
    handler: getChatsForUser,
    preHandler: authenticate,
  });

  app.get("/:id/formatted", {
    handler: getFormattedChatById,
    preHandler: authenticate,
  });

  app.post("/", { handler: addChat, preHandler: authenticate });
  app.get("/search-users", { handler: searchUsers, preHandler: authenticate });
  app.put("/:id", { handler: updateChat, preHandler: authenticate });

  app.delete("/:id", { handler: deleteChat, preHandler: authenticate });
}
