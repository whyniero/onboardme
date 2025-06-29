import { FastifyInstance } from "fastify";
import {
  deleteMessage,
  getMessages,
  sendMessage,
  updateMessage,
} from "../controllers/messageController";
import { authenticate } from "../hooks/authenticate";
import { uploadFile } from "../controllers/messageController";

export default async function (app: FastifyInstance) {
  app.get("/:chatId/messages", {
    handler: getMessages,
    preHandler: authenticate,
  });

  app.post("/:chatId/messages", {
    handler: sendMessage,
    preHandler: authenticate,
  });

  app.post("/:chatId/messages/upload", {
    handler: uploadFile,
    preHandler: authenticate,
  });

  app.put("/:chatId/messages/:id", {
    handler: updateMessage,
    preHandler: authenticate,
  });

  app.delete("/:chatId/messages/:id", {
    handler: deleteMessage,
    preHandler: authenticate,
  });
}
