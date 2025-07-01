import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../utils/prisma.js";

export async function getPositions(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const positions = await prisma.position.findMany();
    return reply.status(200).send({ positions });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to get positions" });
  }
}

export async function getPosition(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const position = await prisma.position.findUnique({
      where: { id },
    });
    return reply.status(200).send({ position });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to get position" });
  }
}

export async function addPosition(
  request: FastifyRequest<{
    Body: {
      name: string;
      color: string;
    };
  }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  if (user.role !== "HR") {
    return reply.status(403).send({ message: "Access denied!" });
  }
  const { name, color } = request.body;

  try {
    const position = await prisma.position.create({
      data: {
        name,
        color,
      },
    });

    return reply.status(201).send({ position });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to add position" });
  }
}

export async function deletePosition(
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  if (user.role !== "HR") {
    return reply.status(403).send({ message: "Access denied!" });
  }
  try {
    const { id } = request.params;

    await prisma.position.delete({ where: { id } });

    return reply.status(200).send({ message: "Position deleted" });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to delete position" });
  }
}

export async function updatePosition(
  request: FastifyRequest<{
    Params: { id: string };
    Body: { name: string; color: string };
  }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  if (user.role !== "HR") {
    return reply.status(403).send({ message: "Access denied!" });
  }
  try {
    const { id } = request.params;
    const { name, color } = request.body;

    const updatedPosition = await prisma.position.update({
      where: { id },
      data: { name, color },
    });

    return reply.status(200).send({ updatedPosition });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to update position" });
  }
}
