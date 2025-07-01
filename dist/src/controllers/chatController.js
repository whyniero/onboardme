import prisma from "../utils/prisma.js";
import { io } from "socket.io-client"; // Подключим клиент Socket.IO
const socket = io("http://localhost:4000", {
    withCredentials: false,
});
export async function getChats(request, reply) {
    const user = request.user;
    if (user.role === "INTERN") {
        return reply.status(403).send({ message: "Access denied!" });
    }
    try {
        const chats = await prisma.chat.findMany({
            include: { participants: true, messages: true },
        });
        return reply.status(200).send({ chats });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to get chats!" });
    }
}
export async function getChat(request, reply) {
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
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to get chat!" });
    }
}
export async function getChatsForUser(request, reply) {
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
        const formattedChats = await Promise.all(chats.map(async (chat) => {
            var _a;
            const otherParticipants = chat.participants.filter((p) => p.userId !== userId);
            const users = await Promise.all(otherParticipants.map(async (p) => {
                var _a;
                let userData = null;
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
                    id: userData === null || userData === void 0 ? void 0 : userData.id,
                    name: userData === null || userData === void 0 ? void 0 : userData.name,
                    avatar: (userData === null || userData === void 0 ? void 0 : userData.avatar) || null,
                    role: userData === null || userData === void 0 ? void 0 : userData.role,
                    position: ((_a = userData === null || userData === void 0 ? void 0 : userData.position) === null || _a === void 0 ? void 0 : _a.name) || null,
                };
            }));
            return {
                id: chat.id,
                groupName: chat.groupName,
                createdAt: chat.createdAt,
                lastMessage: ((_a = chat.messages[0]) === null || _a === void 0 ? void 0 : _a.content) || null,
                participants: users,
            };
        }));
        return reply.status(200).send({ chats: formattedChats });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to get chats for user!" });
    }
}
export async function addChat(request, reply) {
    const { participants, groupName } = request.body;
    if (!(participants === null || participants === void 0 ? void 0 : participants.length)) {
        return reply
            .status(400)
            .send({ message: "Participants list is required!" });
    }
    try {
        const chat = await prisma.chat.create({
            data: {
                groupName: groupName !== null && groupName !== void 0 ? groupName : null,
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
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to create chat!" });
    }
}
export async function updateChat(request, reply) {
    var _a;
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
        const data = {};
        if (typeof groupName === "string" &&
            groupName.trim() !== ((_a = chat.groupName) === null || _a === void 0 ? void 0 : _a.trim())) {
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
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to update chat!" });
    }
}
export async function deleteChat(request, reply) {
    const user = request.user;
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
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to delete chat!" });
    }
}
export async function searchUsers(request, reply) {
    var _a;
    const { query } = request.query;
    const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.id;
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
    function hasPosition(user) {
        var _a;
        return !!((_a = user.position) === null || _a === void 0 ? void 0 : _a.name);
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
export async function getFormattedChatById(request, reply) {
    var _a;
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
        const users = await Promise.all(chat.participants.map(async (p) => {
            var _a;
            let userData = null;
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
                id: userData === null || userData === void 0 ? void 0 : userData.id,
                name: userData === null || userData === void 0 ? void 0 : userData.name,
                avatar: (userData === null || userData === void 0 ? void 0 : userData.avatar) || null,
                role: userData === null || userData === void 0 ? void 0 : userData.role,
                position: ((_a = userData === null || userData === void 0 ? void 0 : userData.position) === null || _a === void 0 ? void 0 : _a.name) || null,
            };
        }));
        return reply.status(200).send({
            chat: {
                id: chat.id,
                groupName: chat.groupName,
                createdAt: chat.createdAt,
                lastMessage: ((_a = chat.messages[0]) === null || _a === void 0 ? void 0 : _a.content) || null,
                participants: users,
            },
        });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to get chat!" });
    }
}
