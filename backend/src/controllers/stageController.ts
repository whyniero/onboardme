import { FastifyRequest, FastifyReply } from "fastify";
import prisma from "../utils/prisma";

export async function getStages(request: FastifyRequest, reply: FastifyReply) {
  try {
    const stages = await prisma.stage.findMany({
      select: {
        id: true,
        number: true,
        name: true,
        status: true,
        startedAt: true,
        endedAt: true,
        internId: true,
        createdFor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tasks: {
          select: {
            id: true,
            number: true,
            name: true,
            status: true,
            deadline: true,
            stageId: true,
          },
        },
      },
    });
    return reply.status(200).send({ stages });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to get stages" });
  }
}

export async function getStage(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const stage = await prisma.stage.findUnique({
      where: { id },
    });
    return reply.status(200).send({ stage });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to get stage" });
  }
}

export async function addStage(
  request: FastifyRequest<{
    Body: {
      number: number;
      name: string;
      teamleadId?: string;
      internId: string;
    };
  }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  if (user.role === "INTERN") {
    return reply.status(403).send({ message: "Access denied!" });
  }
  const { number, name, teamleadId, internId } = request.body;

  try {
    const stage = await prisma.stage.create({
      data: {
        number,
        name,
        teamleadId: teamleadId ?? null,
        internId,
        status: "NOT_STARTED",
      },
    });

    return reply.status(201).send({ stage });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to add position" });
  }
}

export async function deleteStage(
  request: FastifyRequest<{
    Params: { id: string };
  }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  if (user.role === "INTERN") {
    return reply.status(403).send({ message: "Access denied!" });
  }
  try {
    const { id } = request.params;

    await prisma.stage.delete({ where: { id } });

    return reply.status(200).send({ message: "Stage deleted" });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to delete stage" });
  }
}

export async function updateStage(
  request: FastifyRequest<{
    Params: { id: string };
    Body: {
      number: number;
      name: string;
      internId?: string;
      teamleadId?: string;
    };
  }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  if (user.role === "INTERN") {
    return reply.status(403).send({ message: "Access denied!" });
  }

  try {
    const { id } = request.params;
    const { number, name, internId, teamleadId } = request.body;

    const updatedStage = await prisma.stage.update({
      where: { id },
      data: { number, name, internId, teamleadId },
    });

    return reply.status(200).send({ stage: updatedStage });
  } catch (err: any) {
    request.log.error(err);
    if (err.code === "P2025") {
      return reply.status(404).send({ message: "Stage not found" });
    }
    return reply.status(500).send({ message: "Failed to update stage" });
  }
}

export async function getStagesForIntern(
  request: FastifyRequest<{ Params: { internId?: string } }>,
  reply: FastifyReply
) {
  try {
    const { internId } = request.params;
    if (!internId) {
      return reply.status(400).send({ message: "internId is required" });
    }

    const stages = await prisma.stage.findMany({
      where: { internId },
      select: {
        id: true,
        number: true,
        name: true,
        status: true,
        startedAt: true,
        endedAt: true,
        internId: true,
        createdFor: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        tasks: {
          select: {
            id: true,
            number: true,
            name: true,
            status: true,
            deadline: true,
            stageId: true,
          },
        },
      },
    });

    return reply.status(200).send({ stages });
  } catch (err) {
    request.log.error(err);
    return reply
      .status(500)
      .send({ message: "Failed to get stages for intern" });
  }
}
