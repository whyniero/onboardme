import { Server } from "socket.io";
import { createServer } from "http";
import prisma from "../src/utils/prisma";

const httpServer = createServer();

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:8080"],
    methods: ["GET", "POST", "PUT"],
  },
});

// Хранилище онлайн-пользователей с массивом socketId для одного userId
let onlineUsers: { userId: string; socketIds: string[] }[] = [];

const addUser = (userId: string, socketId: string) => {
  const existingUser = onlineUsers.find((u) => u.userId === userId);
  if (existingUser) {
    if (!existingUser.socketIds.includes(socketId)) {
      existingUser.socketIds.push(socketId);
    }
  } else {
    onlineUsers.push({ userId, socketIds: [socketId] });
  }
  console.log("👥 Online users updated:", onlineUsers);
};

const removeUser = (socketId: string) => {
  onlineUsers = onlineUsers.map((u) => {
    u.socketIds = u.socketIds.filter((id) => id !== socketId);
    return u;
  }).filter((u) => u.socketIds.length > 0);
  console.log("👥 Online users after disconnect:", onlineUsers);
};

const getUser = (userId: string) => {
  return onlineUsers.find((u) => u.userId === userId);
};

io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  socket.on("newUser", (userId: string) => {
    addUser(userId, socket.id);
    io.emit("getOnlineUsers", onlineUsers); // Отправляем обновленный список онлайн-пользователей
  });

  socket.on("joinChat", (chatId: string) => {
    // Проверяем, не подключен ли уже к этому chatId
    if (!socket.rooms.has(chatId)) {
      socket.join(chatId);
      console.log(`👥 User ${socket.id} joined chat ${chatId}`);
    } else {
      console.log(`⚠️ User ${socket.id} already in chat ${chatId}, skipping join`);
    }
  });

  socket.on("sendMessage", async (data, callback) => {
    const { chatId, senderId, senderRole, content } = data;

    if (!chatId || !senderId || !content) {
      console.error("❌ Invalid message data:", data);
      if (callback) callback({ error: "Missing required fields" });
      return;
    }

    try {
      const message = await prisma.message.create({
        data: {
          content,
          senderId,
          senderRole,
          chatId,
        },
      });

      io.to(chatId).emit("getMessage", message);
      if (callback) callback({ success: true, messageId: message.id });
    } catch (err) {
      console.error("❌ Socket message error:", err);
      if (callback) callback({ error: "Failed to send message" });
    }
  });

  socket.on("editMessage", async (data, callback) => {
    const { chatId, messageId, content } = data;

    if (!chatId || !messageId || !content) {
      if (callback) callback({ error: "Missing required fields" });
      return;
    }

    try {
      const updatedMessage = await prisma.message.update({
        where: { id: messageId },
        data: { content },
      });
      io.to(chatId).emit("messageEdited", {
        messageId,
        content: updatedMessage.content,
      });
      if (callback) callback({ success: true });
    } catch (err) {
      console.error("❌ Edit message error:", err);
      if (callback) callback({ error: "Failed to edit message" });
    }
  });

  socket.on("deleteMessage", async (data, callback) => {
    const { chatId, messageId } = data;

    if (!chatId || !messageId) {
      if (callback) callback({ error: "Missing required fields" });
      return;
    }

    try {
      await prisma.message.delete({
        where: { id: messageId },
      });
      io.to(chatId).emit("messageDeleted", { messageId });
      if (callback) callback({ success: true });
    } catch (err) {
      console.error("❌ Delete message error:", err);
      if (callback) callback({ error: "Failed to delete message" });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
    removeUser(socket.id);
    io.emit("getOnlineUsers", onlineUsers); // Обновляем список после отключения
  });
});

httpServer.listen(4000, () => console.log("✅ Socket server running on :4000"));