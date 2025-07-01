import fastifyCookie from "@fastify/cookie";
import { fastifyPlugin } from "fastify-plugin";
async function cookie(app, options) {
    app.register(fastifyCookie, {
        secret: process.env.COOKIE_SECRET || "cookiesecret",
    });
}
export default fastifyPlugin(cookie);
