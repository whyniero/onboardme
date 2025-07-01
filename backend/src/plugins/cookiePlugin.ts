import fastifyCookie from "@fastify/cookie";
import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { fastifyPlugin } from "fastify-plugin";

async function cookie(app: FastifyInstance, options: FastifyPluginOptions) {
  app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || "cookiesecret",
  });
}

export default fastifyPlugin(cookie);
