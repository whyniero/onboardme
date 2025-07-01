import fastifyJwt from "@fastify/jwt";
import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fastifyPlugin from "fastify-plugin";

async function verifyToken(
  app: FastifyInstance,
  options: FastifyPluginOptions
) {
  app.register(fastifyJwt, {
    secret: process.env.JWT_SIGNING_SECRET || "supersecret",
    cookie: {
      cookieName: "token",
      signed: true,
    },
  });

  app.decorate(
    "jwtAuth",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        return reply.status(401).send({ message: "Unauthorized!" });
      }
    }
  );
}

export default fastifyPlugin(verifyToken);
