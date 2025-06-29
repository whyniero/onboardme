import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../utils/prisma";
import { Status } from "@prisma/client";

export async function getTasks(
  request: FastifyRequest<{ Params: { stageId: string } }>,
  reply: FastifyReply
) {
  try {
    const { stageId } = request.params;
    const tasks = await prisma.task.findMany({
      where: { stageId },
      select: {
        id: true,
        number: true,
        name: true,
        desc: true,
        status: true,
        deadline: true,
        startedAt: true,
        endedAt: true,
        stageId: true,
        stage: {
          select: {
            id: true,
            name: true,
            number: true,
          },
        },
        attachments: {
          select: {
            id: true,
            url: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            senderId: true,
            senderRole: true,
          },
        },
      },
    });
    return reply.status(200).send({ tasks });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to get tasks" });
  }
}

export async function getTask(
  request: FastifyRequest<{ Params: { stageId: string; id: string } }>,
  reply: FastifyReply
) {
  try {
    const { stageId, id } = request.params;
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        stage: {
          select: {
            id: true,
            name: true,
            number: true,
            createdBy: {
              select: {
                id: true,
                name: true,
                login: true,
                role: true,
                position: true,
                avatar: true,
              },
            },
          },
        },
        attachments: {
          select: {
            id: true,
            url: true,
          },
        },
        comments: {
          select: {
            id: true,
            content: true,
            senderId: true,
            senderRole: true,
          },
        },
      },
    });
    if (!task) {
      return reply.status(404).send({ message: "Task not found" });
    }
    return reply.status(200).send({ task });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to get task" });
  }
}
export async function addTask(
  request: FastifyRequest<{
    Params: { stageId: string };
    Body: {
      number: number;
      name: string;
      desc?: string;
      deadline: string;
    };
  }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  if (user.role === "INTERN") {
    return reply.status(403).send({ message: "Access denied!" });
  }
  const { stageId } = request.params;
  const { number, name, desc, deadline } = request.body;

  try {
    const task = await prisma.task.create({
      data: {
        number,
        name,
        desc: desc || null,
        deadline: new Date(deadline),
        stageId,
        status: "NOT_STARTED",
        startedAt: null,
        endedAt: null,
      },
    });

    return reply.status(201).send({ task });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to add task" });
  }
}

export async function deleteTask(
  request: FastifyRequest<{ Params: { stageId: string; id: string } }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  if (user.role === "INTERN") {
    return reply.status(403).send({ message: "Access denied!" });
  }
  try {
    const { id } = request.params;
    await prisma.task.delete({ where: { id } });
    return reply.status(200).send({ message: "Task deleted" });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to delete task" });
  }
}

export async function updateTask(
  request: FastifyRequest<{
    Params: { stageId: string; id: string };
    Body: { name: string; desc?: string; deadline?: string; status?: string };
  }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  if (user.role === "INTERN") {
    return reply.status(403).send({ message: "Access denied!" });
  }
  try {
    const { id } = request.params;
    const { name, desc, deadline, status } = request.body;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        name,
        desc: desc || undefined,
        deadline: deadline ? new Date(deadline) : undefined,
        status: (status as Status) || undefined,
      },
    });

    return reply.status(200).send({ task: updatedTask });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to update task" });
  }
}

export async function updateTaskStatus(
  request: FastifyRequest<{
    Params: { stageId: string; id: string };
    Body: { status: Status };
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const { status } = request.body;
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    });
    return reply.status(200).send({ task: updatedTask });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to update task status" });
  }
}
