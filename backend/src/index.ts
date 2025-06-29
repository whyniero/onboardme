import Fastify, { FastifyInstance } from "fastify";
import dotenv from "dotenv";
import cookiePlugin from "./plugins/cookiePlugin";
import jwtPlugin from "./plugins/jwtPlugin";
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import fastifyMultipart from "@fastify/multipart";
// import { createServer } from "http";
// import { initSocketIo } from "./utils/socket";
import chatRoutes from "./routes/chatRoutes";
import positionRoutes from "./routes/positionRoutes";
import messageRoutes from "./routes/messageRoutes";
import corsPlugin from "./plugins/corsPlugin";
import fastifyStatic from "@fastify/static";
import path from "path";
import stageRoutes from "./routes/stageRoutes";
import downloadRoutes from "./routes/downloadRoutes";
import taskRoutes from "./routes/taskRoutes";

const app: FastifyInstance = Fastify({
  logger: true,
});

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
    await app.listen({ port: 8080 });
  } catch (err) {
    console.error(err);
    app.log.error(err);
    process.exit(1);
  }
};

start();
