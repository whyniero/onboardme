import fastifyCors from "@fastify/cors";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import fastifyPlugin from "fastify-plugin";

async function cors(app: FastifyInstance, options: FastifyPluginOptions) {
  app.register(fastifyCors, {
    origin: ["http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  });
}

export default fastifyPlugin(cors);
