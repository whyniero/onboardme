import fsPromises from "fs/promises";
import fs from "fs";
import prisma from "../utils/prisma.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { io } from "socket.io-client";
import { fileURLToPath } from "url";
const socket = io("http://localhost:4000", {
    withCredentials: false,
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export async function getMessages(request, reply) {
    try {
        const { chatId } = request.params;
        const messages = await prisma.message.findMany({
            where: {
                chatId,
            },
            orderBy: { createdAt: "asc" },
        });
        return reply.status(200).send({ messages });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to get messages" });
    }
}
export async function sendMessage(request, reply) {
    try {
        const { chatId } = request.params;
        const { senderId, senderRole, content } = request.body;
        const message = await prisma.message.create({
            data: {
                content,
                senderId,
                senderRole,
                chatId,
            },
        });
        return reply.status(201).send({ message });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to send message" });
    }
}
// Загруза файла в сообщение
export async function uploadFile(request, reply) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    try {
        console.log("Request headers:", request.headers);
        // Безопасное логирование request.body
        console.log("Request body (summary):", {
            chatId: (_b = (_a = request.body) === null || _a === void 0 ? void 0 : _a.chatId) === null || _b === void 0 ? void 0 : _b.value,
            senderId: (_d = (_c = request.body) === null || _c === void 0 ? void 0 : _c.senderId) === null || _d === void 0 ? void 0 : _d.value,
            senderRole: (_f = (_e = request.body) === null || _e === void 0 ? void 0 : _e.senderRole) === null || _f === void 0 ? void 0 : _f.value,
            fileName: (_h = (_g = request.body) === null || _g === void 0 ? void 0 : _g.file) === null || _h === void 0 ? void 0 : _h.filename,
            fileSize: ((_l = (_k = (_j = request.body) === null || _j === void 0 ? void 0 : _j.file) === null || _k === void 0 ? void 0 : _k._buf) === null || _l === void 0 ? void 0 : _l.length) || ((_o = (_m = request.body) === null || _m === void 0 ? void 0 : _m.file) === null || _o === void 0 ? void 0 : _o.bytesRead),
        });
        // Проверяем наличие файла в request.body
        const body = request.body;
        const fileData = body.file;
        if (!fileData || fileData.type !== "file") {
            return reply.status(400).send({ error: "No file uploaded" });
        }
        // Получаем поля формы
        const { chatId, senderId, senderRole } = body;
        if (!chatId || !senderId || !senderRole) {
            return reply.status(400).send({
                error: "Missing required fields (chatId, senderId, or senderRole)",
            });
        }
        // Приведение senderRole к типу Role
        const role = senderRole.value;
        // Генерируем уникальное имя файла на основе messageId
        const messageId = uuidv4();
        const fileExtension = path.extname(fileData.filename);
        const fileName = `${messageId}${fileExtension}`;
        const uploadDir = path.join(__dirname, "../../uploads/chats");
        const filePath = path.join(uploadDir, fileName);
        console.log("Upload directory:", uploadDir);
        console.log("File path:", filePath);
        // Создаем директорию, если она не существует
        await fsPromises.mkdir(uploadDir, { recursive: true });
        // Сохраняем файл
        let bytesWritten = 0;
        if (fileData._buf && fileData._buf.length > 0) {
            await fsPromises.writeFile(filePath, fileData._buf);
            bytesWritten = fileData._buf.length;
            console.log(`File written with _buf, size: ${bytesWritten} bytes`);
        }
        else if (fileData.toBuffer) {
            const buffer = await fileData.toBuffer();
            await fsPromises.writeFile(filePath, buffer);
            bytesWritten = buffer.length;
            console.log(`File written with toBuffer, size: ${bytesWritten} bytes`);
        }
        else {
            const fileStream = fileData.file;
            if (fileStream && typeof fileStream.pipe === "function") {
                await new Promise((resolve, reject) => {
                    fileStream.on("data", (chunk) => {
                        bytesWritten += chunk.length;
                        console.log(`Writing chunk, total bytes: ${bytesWritten}`);
                    });
                    fileStream
                        .pipe(fs.createWriteStream(filePath))
                        .on("finish", () => {
                        console.log(`File written, total bytes: ${bytesWritten}`);
                        resolve();
                    })
                        .on("error", (err) => reject(err));
                });
            }
            else {
                throw new Error("No valid file data (_buf, toBuffer, or stream) available");
            }
        }
        // Генерируем URL
        const fileUrl = `/uploads/chats/${fileName}`;
        // Создаем запись в базе данных
        const message = await prisma.message.create({
            data: {
                content: fileUrl,
                fileName: fileData.filename,
                senderId: senderId.value,
                senderRole: role,
                chatId: chatId.value,
            },
        });
        // Уведомляем через внешний сокет-клиент
        socket.emit("getMessage", message);
        return reply.send({
            success: true,
            messageId: message.id,
            fileUrl,
            createdAt: message.createdAt,
        });
    }
    catch (err) {
        console.error("Upload error:", err);
        return reply
            .status(500)
            .send({ error: "Internal server error", details: err.message });
    }
}
export async function deleteMessage(request, reply) {
    const { id } = request.params;
    console.log("Delete request received for message ID:", id);
    try {
        const message = await prisma.message.findUnique({
            where: { id },
        });
        if (!message) {
            return reply.status(404).send({ error: "Message not found" });
        }
        // Удаление файла, если он был
        if (message.content.includes("/uploads/")) {
            const fileName = message.content.split("/").pop();
            if (!fileName) {
                console.warn("No filename extracted from content:", message.content);
                return reply.status(500).send({ error: "Invalid file path" });
            }
            const uploadDir = path.join(__dirname, "../../uploads/chats");
            const filePath = path.join(uploadDir, fileName);
            console.log("Attempting to delete file at:", filePath);
            try {
                await fsPromises.access(filePath); // Проверяем доступ
                const stats = await fsPromises.stat(filePath);
                if (stats.isFile()) {
                    await fsPromises.unlink(filePath);
                    console.log("Файл удалён:", filePath);
                }
                else {
                    console.warn("Path is not a file:", filePath);
                }
            }
            catch (err) {
                if (err.code === "ENOENT") {
                    console.warn("File not found, skipping deletion:", filePath);
                }
                else if (err.code === "EACCES") {
                    console.warn("Permission denied for file:", filePath, err.message);
                }
                else {
                    console.warn("Не удалось удалить файл:", filePath, err.message);
                }
            }
        }
        // Удаление из БД
        await prisma.message.delete({ where: { id } });
        socket.emit("messageDeleted", { id });
        return reply.send({ success: true });
    }
    catch (err) {
        console.error("Ошибка удаления:", err);
        return reply.status(500).send({ error: "Ошибка при удалении сообщения" });
    }
}
export async function updateMessage(request, reply) {
    try {
        const { id } = request.params;
        const { content } = request.body;
        const updatedMessage = await prisma.message.update({
            where: { id },
            data: { content },
        });
        return reply.status(200).send({ updatedMessage });
    }
    catch (err) {
        request.log.error(err);
        return reply.status(500).send({ message: "Failed to update message" });
    }
}
