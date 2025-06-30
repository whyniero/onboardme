import { deleteMessage, getMessages, sendMessage, updateMessage, } from "../controllers/messageController.js";
import { authenticate } from "../hooks/authenticate.js";
import { uploadFile } from "../controllers/messageController.js";
export default async function (app) {
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
