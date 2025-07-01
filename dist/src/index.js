import Fastify from "fastify";
import dotenv from "dotenv";
import cookiePlugin from "./plugins/cookiePlugin.js";
import jwtPlugin from "./plugins/jwtPlugin.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import fastifyMultipart from "@fastify/multipart";
import chatRoutes from "./routes/chatRoutes.js";
import positionRoutes from "./routes/positionRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import corsPlugin from "./plugins/corsPlugin.js";
import fastifyStatic from "@fastify/static";
import path, { dirname } from "path";
import stageRoutes from "./routes/stageRoutes.js";
import downloadRoutes from "./routes/downloadRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import { fileURLToPath } from "url";
const app = Fastify({
    logger: true,
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config();
// Плагины
app.register(corsPlugin);
app.register(cookiePlugin);
app.register(jwtPlugin);
app.register(fastifyMultipart, {
    limits: {
        fileSize: 50 * 1024 * 1024, // Ограничение в 50 MB
        fieldSize: 100 * 1024,
    },
    // Настройка для парсинга полей в request.body
    attachFieldsToBody: true,
});
app.register(fastifyStatic, {
    root: path.join(__dirname, "../uploads"),
    prefix: "/uploads/",
    serve: true,
});
// Префиксы роутов
app.register(authRoutes, { prefix: "/api/auth" });
app.register(userRoutes, { prefix: "/api/users" });
app.register(chatRoutes, { prefix: "/api/chats" });
app.register(messageRoutes, { prefix: "/api/chats" });
app.register(positionRoutes, { prefix: "/api/positions" });
app.register(stageRoutes, { prefix: "/api/stages" });
app.register(taskRoutes, { prefix: "/api/stages" });
app.register(downloadRoutes, { prefix: "/api" });
const start = async () => {
    try {
        await app.listen({ port: 5050 });
    }
    catch (err) {
        console.error(err);
        app.log.error(err);
        process.exit(1);
    }
};
start();
