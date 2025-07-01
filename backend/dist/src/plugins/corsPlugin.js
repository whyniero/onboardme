import fastifyCors from "@fastify/cors";
import fastifyPlugin from "fastify-plugin";
async function cors(app, options) {
    app.register(fastifyCors, {
        origin: ["http://localhost:3000"],
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allowedHeaders: ["Content-Type"],
    });
}
export default fastifyPlugin(cors);
