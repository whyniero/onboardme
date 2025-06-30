import { hashPassword } from "../utils/authPassword.js";
import prisma from "../utils/prisma.js";
export async function getTeamleads(request, reply) {
    try {
        const teamleads = await prisma.teamlead.findMany({
            select: {
                id: true,
                login: true,
                email: true,
                name: true,
                avatar: true,
                lastOnline: true,
                createdAt: true,
                position: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
                role: true,
                responsibleFor: true,
            },
        });
        return reply.status(200).send({ teamleads });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to get teamleads" });
    }
}
export async function getTeamlead(request, reply) {
    const { id } = request.params;
    try {
        const teamlead = await prisma.teamlead.findUnique({
            where: { id },
            select: {
                id: true,
                login: true,
                email: true,
                name: true,
                avatar: true,
                lastOnline: true,
                createdAt: true,
                position: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                    },
                },
                role: true,
            },
        });
        if (!teamlead) {
            return reply.status(404).send({ message: "Teamlead not found" });
        }
        return reply.status(200).send({ teamlead });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to get teamlead" });
    }
}
export async function addTeamlead(request, reply) {
    const user = request.user;
    if (user.role !== "HR") {
        return reply.status(403).send({ message: "Access denied!" });
    }
    const { hrId, login, name, email, password, positionId, avatar } = request.body;
    try {
        // Проверка на существование логина
        const isLoginExisted = (await prisma.teamlead.findUnique({ where: { login } })) ||
            (await prisma.hr.findUnique({ where: { login } })) ||
            (await prisma.intern.findUnique({ where: { login } }));
        if (isLoginExisted) {
            return reply.status(409).send({ message: "Teamlead already exists!" });
        }
        // Проверка на существование почты
        const isEmailExisted = (await prisma.teamlead.findUnique({ where: { email } })) ||
            (await prisma.hr.findUnique({ where: { email } })) ||
            (await prisma.intern.findUnique({ where: { email } }));
        if (isEmailExisted) {
            return reply.status(409).send({ message: "Email is already used!" });
        }
        const hashedPassword = await hashPassword(password);
        const teamlead = await prisma.teamlead.create({
            data: {
                login,
                name,
                email,
                password: hashedPassword,
                positionId,
                role: "TEAMLEAD",
                avatar: avatar || null,
            },
        });
        return reply
            .status(201)
            .send({ message: "Teamlead created successfully", teamlead });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to create Teamlead" });
    }
}
export async function updateTeamlead(request, reply) {
    const user = request.user;
    if (user.role !== "HR") {
        return reply.status(403).send({ message: "Access denied!" });
    }
    const { id } = request.params;
    const { login, name, email, password, positionId, avatar } = request.body;
    try {
        const existingTeamlead = await prisma.teamlead.findUnique({
            where: { id },
        });
        if (!existingTeamlead) {
            return reply.status(404).send({ message: "Teamlead not found" });
        }
        const dataToUpdate = {};
        if (login)
            dataToUpdate.login = login;
        if (name)
            dataToUpdate.name = name;
        if (email)
            dataToUpdate.email = email;
        if (password)
            dataToUpdate.password = await hashPassword(password);
        if (positionId)
            dataToUpdate.positionId = positionId;
        if (avatar !== undefined)
            dataToUpdate.avatar = avatar;
        const updated = await prisma.teamlead.update({
            where: { id },
            data: dataToUpdate,
        });
        return reply
            .status(200)
            .send({ message: "Teamlead updated", teamlead: updated });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to update teamlead" });
    }
}
export async function deleteTeamlead(request, reply) {
    const user = request.user;
    if (user.role !== "HR") {
        return reply.status(403).send({ message: "Access denied!" });
    }
    const { id } = request.params;
    try {
        await prisma.teamlead.delete({ where: { id } });
        return reply.status(200).send({ message: "Teamlead deleted" });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to delete teamlead" });
    }
}
