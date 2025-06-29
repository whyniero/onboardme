import { FastifyRequest, FastifyReply } from "fastify";

interface JwtPayload {
  userId: string;
  role: string;
  email: string;
}

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const payload = await request.jwtVerify<JwtPayload>();

    request.user = {
      id: payload.userId,
      role: payload.role,
      email: payload.email,
    };
  } catch (err) {
    return reply.status(401).send({ message: "Unauthorized" });
  }
}
