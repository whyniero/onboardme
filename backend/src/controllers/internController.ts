import { hashPassword } from "../utils/authPassword";
import prisma from "../utils/prisma";
import { Role } from "@prisma/client";
import { FastifyReply, FastifyRequest } from "fastify";

export async function getInterns(request: FastifyRequest, reply: FastifyReply) {
  try {
    const interns = await prisma.intern.findMany({
      select: {
        id: true,
        login: true,
        email: true,
        name: true,
        avatar: true,
        lastOnline: true,
        createdAt: true,
        role: true,
        position: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        teamlead: {
          select: {
            id: true,
            login: true,
            name: true,
            position: {
              select: {
                id: true,
                name: true,
                color: true,
              },
            },
          },
        },
      },
    });
    return reply.status(200).send({ interns });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ messsage: "Failed to get interns!" });
  }
}

export async function getIntern(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const { id } = request.params;
  try {
    const intern = await prisma.intern.findUnique({
      where: { id },
      select: {
        id: true,
        login: true,
        email: true,
        name: true,
        avatar: true,
        lastOnline: true,
        createdAt: true,
        role: true,
        positionId: true,
        mentorId: true,
      },
    });
    return reply.status(200).send({ intern });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ messsage: "Failed to get intern!" });
  }
}

interface AddInternBody {
  login: string;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: Role;
  positionId?: string;
  mentorId?: string;
}

export async function addIntern(
  request: FastifyRequest<{ Body: AddInternBody }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  if (user.role === "INTERN") {
    return reply.status(403).send({ message: "Access denied!" });
  }

  const { login, name, email, password, avatar, role, positionId, mentorId } =
    request.body;

  try {
    // Проверка существует ли стажер/новый разработчик с таким логином
    const isLoginExisted =
      (await prisma.intern.findUnique({ where: { login } })) ||
      (await prisma.teamlead.findUnique({ where: { login } })) ||
      (await prisma.hr.findUnique({ where: { login } }));

    if (isLoginExisted) {
      return reply.status(409).send({ message: "Login is already used!" });
    }
    // Проверка существует ли стажер/новый разработчик с такой почтой
    const isEmailExisted =
      (await prisma.intern.findUnique({ where: { email } })) ||
      (await prisma.teamlead.findUnique({ where: { email } })) ||
      (await prisma.hr.findUnique({ where: { email } }));

    if (isEmailExisted) {
      return reply.status(409).send({ message: "Email is already used!" });
    }

    const hashedPassword = await hashPassword(password);
    const intern = await prisma.intern.create({
      data: {
        login,
        name,
        email,
        password: hashedPassword,
        role: Role.INTERN,
        avatar: avatar ?? null,
        positionId: positionId ?? null,
        mentorId: mentorId ?? null,
      },
    });

    return reply
      .status(201)
      .send({ message: "Intern created successfully", intern });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to create intern" });
  }
}

interface UpdateInternBody {
  login?: string;
  name?: string;
  email?: string;
  positionId?: string;
  mentorId?: string;
  password?: string;
  avatar?: string;
}

export async function updateIntern(
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateInternBody }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  if (user.role === "INTERN") {
    return reply.status(403).send({ message: "Access denied!" });
  }

  const { id } = request.params;
  const { login, name, email, password, positionId, mentorId, avatar } =
    request.body;

  try {
    const existingIntern = await prisma.intern.findUnique({
      where: { id },
    });
    if (!existingIntern) {
      return reply.status(404).send({ message: "Intern not found" });
    }

    // Проверка на уникальность логина, если он изменяется
    if (login && login !== existingIntern.login) {
      const isLoginExisted =
        (await prisma.intern.findUnique({ where: { login } })) ||
        (await prisma.teamlead.findUnique({ where: { login } })) ||
        (await prisma.hr.findUnique({ where: { login } }));

      if (isLoginExisted) {
        return reply.status(409).send({ message: "Login is already used!" });
      }
    }

    // Проверка на уникальность email, если он изменяется
    if (email && email !== existingIntern.email) {
      const isEmailExisted =
        (await prisma.intern.findUnique({ where: { email } })) ||
        (await prisma.teamlead.findUnique({ where: { email } })) ||
        (await prisma.hr.findUnique({ where: { email } }));

      if (isEmailExisted) {
        return reply.status(409).send({ message: "Email is already used!" });
      }
    }

    const dataToUpdate: any = {};
    if (login) dataToUpdate.login = login;
    if (name) dataToUpdate.name = name;
    if (email) dataToUpdate.email = email;
    if (password) dataToUpdate.password = await hashPassword(password);
    if (positionId !== undefined) dataToUpdate.positionId = positionId;
    if (mentorId !== undefined) dataToUpdate.mentorId = mentorId;
    if (avatar !== undefined) dataToUpdate.avatar = avatar;

    const updated = await prisma.intern.update({
      where: { id },
      data: dataToUpdate,
    });

    return reply
      .status(200)
      .send({ message: "Intern updated", intern: updated });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to update intern" });
  }
}

export async function deleteIntern(
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) {
  const user = request.user as { id: string; role: string };
  if (user.role === "INTERN") {
    return reply.status(403).send({ message: "Access denied!" });
  }
  const { id } = request.params;

  try {
    await prisma.intern.delete({ where: { id } });
    return reply.status(200).send({ message: "Intern deleted" });
  } catch (err) {
    request.log.error(err);
    return reply.status(500).send({ message: "Failed to delete intern" });
  }
}
