import prisma from "../utils/prisma.js";
export async function getPositions(request, reply) {
    try {
        const positions = await prisma.position.findMany();
        return reply.status(200).send({ positions });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to get positions" });
    }
}
export async function getPosition(request, reply) {
    try {
        const { id } = request.params;
        const position = await prisma.position.findUnique({
            where: { id },
        });
        return reply.status(200).send({ position });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to get position" });
    }
}
export async function addPosition(request, reply) {
    const user = request.user;
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
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to add position" });
    }
}
export async function deletePosition(request, reply) {
    const user = request.user;
    if (user.role !== "HR") {
        return reply.status(403).send({ message: "Access denied!" });
    }
    try {
        const { id } = request.params;
        await prisma.position.delete({ where: { id } });
        return reply.status(200).send({ message: "Position deleted" });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to delete position" });
    }
}
export async function updatePosition(request, reply) {
    const user = request.user;
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
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to update position" });
    }
}
