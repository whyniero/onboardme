import fastifyJwt from "@fastify/jwt";
import fastifyPlugin from "fastify-plugin";
async function verifyToken(app, options) {
    app.register(fastifyJwt, {
        secret: process.env.JWT_SIGNING_SECRET || "supersecret",
        cookie: {
            cookieName: "token",
            signed: true,
        },
    });
    app.decorate("jwtAuth", async (request, reply) => {
        try {
            await request.jwtVerify();
        }
        catch (err) {
            return reply.status(401).send({ message: "Unauthorized!" });
        }
    });
}
export default fastifyPlugin(verifyToken);
