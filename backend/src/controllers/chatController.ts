import { FastifyReply, FastifyRequest } from "fastify";
import prisma from "../utils/prisma";
import { Role } from "@prisma/client";
import { io } from "socket.io-client"; // Подключим клиент Socket.IO

const socket = io("http://localhost:4000", {
  withCredentials: false,
});

export async function getChats(request: FastifyRequest, reply: FastifyReply) {
  const user = request.user as { id: string; role: string };
  if (user.role === "INTERN") {
    return reply.status(403).send({ message: "Access denied!" });
  }
  try {
    const chats = await prisma.chat.findMany({
      include: { participants: true, messages: true },
    });
    return reply.status(200).send({ chats });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to get chats!" });
  }
}

export async function getChat(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: { participants: true, messages: true },
    });

    if (!chat) {
      return reply.status(404).send({ message: "Chat not found" });
    }

    return reply.status(200).send({ chat });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to get chat!" });
  }
}

export async function getChatsForUser(
  request: FastifyRequest<{ Params: { userId: string } }>,
  reply: FastifyReply
) {
  try {
    const { userId } = request.params;

    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: { userId },
        },
      },
      distinct: ["id"],
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!chats.length) {
      return reply.status(404).send({ message: "Chats for user not found" });
    }

    const formattedChats = await Promise.all(
      chats.map(async (chat) => {
        const otherParticipants = chat.participants.filter(
          (p) => p.userId !== userId
        );

        const users = await Promise.all(
          otherParticipants.map(async (p) => {
            let userData: any = null;

            switch (p.role) {
              case "HR":
                userData = await prisma.hr.findUnique({
                  where: { id: p.userId },
                  select: { id: true, name: true, avatar: true, role: true },
                });
                break;
              case "TEAMLEAD":
                userData = await prisma.teamlead.findUnique({
                  where: { id: p.userId },
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                    role: true,
                    position: { select: { name: true } },
                  },
                });
                break;
              case "INTERN":
                userData = await prisma.intern.findUnique({
                  where: { id: p.userId },
                  select: {
                    id: true,
                    name: true,
                    avatar: true,
                    role: true,
                    position: { select: { name: true } },
                  },
                });
                break;
            }

            return {
              id: userData?.id,
              name: userData?.name,
              avatar: userData?.avatar || null,
              role: userData?.role,
              position: userData?.position?.name || null,
            };
          })
        );

        return {
          id: chat.id,
          groupName: chat.groupName,
          createdAt: chat.createdAt,
          lastMessage: chat.messages[0]?.content || null,
          participants: users,
        };
      })
    );

    return reply.status(200).send({ chats: formattedChats });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to get chats for user!" });
  }
}

interface AddChatBody {
  participants: { userId: string; role: Role }[];
  groupName?: string;
}

export async function addChat(
  request: FastifyRequest<{ Body: AddChatBody }>,
  reply: FastifyReply
) {
  const { participants, groupName } = request.body;

  if (!participants?.length) {
    return reply
      .status(400)
      .send({ message: "Participants list is required!" });
  }

  try {
    const chat = await prisma.chat.create({
      data: {
        groupName: groupName ?? null,
        participants: {
          create: participants.map((p) => ({
            userId: p.userId,
            role: p.role,
          })),
        },
      },
      include: { participants: true },
    });

    return reply.status(201).send({ chat });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to create chat!" });
  }
}

interface UpdateChatBody {
  groupName?: string;
  participants?: { userId: string; role: Role }[];
}

export async function updateChat(
  request: FastifyRequest<{
    Params: { id: string };
    Body: UpdateChatBody;
  }>,
  reply: FastifyReply
) {
  try {
    const { id } = request.params;
    const { groupName, participants } = request.body;

    const chat = await prisma.chat.findUnique({
      where: { id },
      include: { participants: true },
    });
    if (!chat) {
      return reply.status(404).send({ message: "Chat not found!" });
    }

    const data: any = {};

    if (
      typeof groupName === "string" &&
      groupName.trim() !== chat.groupName?.trim()
    ) {
      data.groupName = groupName.trim();
    }

    if (Array.isArray(participants)) {
      data.participants = {
        deleteMany: {},
        create: participants.map((p) => ({
          userId: p.userId,
          role: p.role,
        })),
      };
    }

    if (Object.keys(data).length === 0) {
      return reply
        .status(400)
        .send({ message: "Nothing to update: no changes detected" });
    }

    const updatedChat = await prisma.chat.update({
      where: { id },
      data,
      include: { participants: true },
    });

    return reply
      .status(200)
      .send({ message: "Chat updated", chat: updatedChat });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to update chat!" });
  }
}

export async function deleteChat(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  if (user.role === "INTERN") {
    return reply.status(403).send({ message: "Access denied!" });
  }
  try {
    const { id } = request.params;

    // // Логирование для диагностики
    // console.log(
    //   `Attempting to delete chat with ID: ${id} by user ${user.id} (role: ${user.role})`
    // );

    // // Явное удаление связанных записей
    // await prisma.message.deleteMany({ where: { chatId: id } });
    // await prisma.chatParticipant.deleteMany({ where: { chatId: id } });

    const chatExists = await prisma.chat.findUnique({ where: { id } });
    if (!chatExists) {
      return reply.status(404).send({ message: "Chat not found" });
    }

    await prisma.chat.delete({ where: { id } });
    return reply.status(200).send({ message: "Chat deleted" });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to delete chat!" });
  }
}

export async function searchUsers(
  request: FastifyRequest<{ Querystring: { query: string } }>,
  reply: FastifyReply
) {
  const { query } = request.query;
  const userId = request.user?.id;

  if (!userId) {
    return reply.status(401).send({ message: "Unauthorized" });
  }

  const interns = await prisma.intern.findMany({
    where: {
      name: {
        contains: query,
      },
      id: {
        not: userId,
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
      position: { select: { name: true } },
    },
  });

  const teamleads = await prisma.teamlead.findMany({
    where: {
      name: {
        contains: query,
      },
      id: {
        not: userId,
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
      position: { select: { name: true } },
    },
  });

  const hrs = await prisma.hr.findMany({
    where: {
      name: {
        contains: query,
      },
      id: {
        not: userId,
      },
    },
    select: {
      id: true,
      name: true,
      avatar: true,
      role: true,
    },
  });

  function hasPosition(user: any): user is { position: { name: string } } {
    return !!user.position?.name;
  }

  const all = [...interns, ...teamleads, ...hrs].map((u) => ({
    id: u.id,
    name: u.name,
    avatar: u.avatar,
    role: u.role,
    position: hasPosition(u) ? u.position.name : null,
  }));

  return reply.send({ users: all });
}

export async function getFormattedChatById(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;

  try {
    const chat = await prisma.chat.findUnique({
      where: { id },
      include: {
        participants: true,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!chat) {
      return reply.status(404).send({ message: "Chat not found" });
    }

    const users = await Promise.all(
      chat.participants.map(async (p) => {
        let userData: any = null;

        switch (p.role) {
          case "HR":
            userData = await prisma.hr.findUnique({
              where: { id: p.userId },
              select: { id: true, name: true, avatar: true, role: true },
            });
            break;
          case "TEAMLEAD":
            userData = await prisma.teamlead.findUnique({
              where: { id: p.userId },
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
                position: { select: { name: true } },
              },
            });
            break;
          case "INTERN":
            userData = await prisma.intern.findUnique({
              where: { id: p.userId },
              select: {
                id: true,
                name: true,
                avatar: true,
                role: true,
                position: { select: { name: true } },
              },
            });
            break;
        }

        return {
          id: userData?.id,
          name: userData?.name,
          avatar: userData?.avatar || null,
          role: userData?.role,
          position: userData?.position?.name || null,
        };
      })
    );

    return reply.status(200).send({
      chat: {
        id: chat.id,
        groupName: chat.groupName,
        createdAt: chat.createdAt,
        lastMessage: chat.messages[0]?.content || null,
        participants: users,
      },
    });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to get chat!" });
  }
}
