import { comparePasswords, hashPassword } from "../utils/authPassword.js";
import prisma from "../utils/prisma.js";
export async function loginHandler(request, reply) {
    var _a, _b;
    const { login, password } = request.body;
    try {
        const user = (_b = (_a = (await prisma.intern.findUnique({ where: { login } }))) !== null && _a !== void 0 ? _a : (await prisma.hr.findUnique({ where: { login } }))) !== null && _b !== void 0 ? _b : (await prisma.teamlead.findUnique({ where: { login } }));
        if (!user)
            return reply.status(400).send({ message: "User does not exist!" });
        // Проверка пароля
        const isValid = await comparePasswords(password, user.password);
        if (!isValid)
            return reply.status(400).send({ message: "Password is incorrect!" });
        // Регистрация токена
        const token = request.server.jwt.sign({
            userId: user.id,
            role: user.role,
            email: user.email,
        });
        reply.setCookie("token", token, {
            httpOnly: true,
            path: "/",
            secure: process.env.NODE_ENV === "production", // Secure в продакшене
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", // SameSite=None в продакшене
            maxAge: 60 * 60 * 24 * 7, // 7 дней
            signed: true,
        });
        const userResponse = {
            id: user.id,
            login: user.login,
            name: user.name,
            email: user.email,
            role: user.role,
        };
        return reply.status(200).send({
            message: "User logged in successfully!",
            user: userResponse,
        });
    }
    catch (error) {
        request.log.error(error);
        return reply.status(500).send({ message: "Failed to login user" });
    }
}
// Самостоятельно регистрироваться может только HR с использованием секретного ключа
export async function registerHandler(request, reply) {
    const { login, name, email, password, avatar, secretKey } = request.body;
    if (secretKey !== process.env.HR_SECRET_KEY) {
        return reply.status(403).send({ message: "Secret key is wrong!" });
    }
    try {
        const isLoginExisted = (await prisma.hr.findUnique({ where: { login } })) ||
            (await prisma.intern.findUnique({ where: { login } })) ||
            (await prisma.teamlead.findUnique({ where: { login } }));
        if (isLoginExisted) {
            return reply.status(409).send({ message: "HR already exists!" });
        }
        const isEmailExisted = (await prisma.hr.findUnique({ where: { email } })) ||
            (await prisma.intern.findUnique({ where: { email } })) ||
            (await prisma.teamlead.findUnique({ where: { email } }));
        if (isEmailExisted) {
            return reply.status(409).send({ message: "Email is already used!" });
        }
        const hashedPassword = await hashPassword(password);
        const HR = await prisma.hr.create({
            data: {
                login,
                name,
                email,
                password: hashedPassword,
                role: "HR",
                avatar: avatar !== null && avatar !== void 0 ? avatar : null,
            },
        });
        return reply.status(201).send({ message: "HR created successfully", HR });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to create HR" });
    }
}
export async function logoutHandler(request, reply) {
    try {
        reply.clearCookie("token", { path: "/" });
        reply.send({ message: "Logged out successfully" });
    }
    catch (error) {
        request.log.error(error);
        return reply.status(500).send({ message: "Failed to log out user" });
    }
}
