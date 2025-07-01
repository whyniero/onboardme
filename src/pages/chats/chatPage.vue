<script setup lang="ts">
import TextCard from '../../ui/TextCard.vue';
import EditIcon from '../../assets/icons/edit.svg';
import SendIcon from '../../assets/icons/send.svg';
import CloseIcon from '../../assets/icons/close.svg';
import AttachmentIcon from '../../assets/icons/attach_file.svg';
import DeleteIcon from '../../assets/icons/delete.svg';
import FileIcon from '../../assets/icons/file.svg';
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import axios from '../../utils/axios';
import { useUserStore } from '../../stores/user';
import Loader from '../../components/Loader.vue';
import { io } from 'socket.io-client';
import type { Role } from '../../types/types';

interface Message {
  id: string;
  content: string; // URL файла или текст
  fileName?: string; // Оригинальное имя файла
  senderId: string;
  senderRole: string;
  createdAt: Date;
  chatId: string;
}

interface ChatParticipantData {
  id: string;
  name: string;
  avatar?: string | null;
  role: Role;
  position?: string | null;
}

interface FormattedChat {
  id: string;
  groupName?: string | null;
  createdAt: Date;
  lastMessage: string | null;
  participants: ChatParticipantData[];
}

// Состояние
const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const currentUserId = computed(() => userStore.currentUser?.id || '');
const newMessage = ref(''); // Исправлено на ref<string>
const messages = ref<Message[]>([]);
const chats = ref<FormattedChat[]>([]);
const selectedChatId = ref<string | null>(null);
const isLoading = ref(true);
const attachedFile = ref<File | null>(null);
const editingMessage = ref<{ id: string; originalContent: string } | null>(null);
const hoveredMessage = ref<string | null>(null);

const searchQuery = ref('');
const searchResults = ref<ChatParticipantData[]>([]);
const isSearching = ref(false);

const getDownloadUrl = (filePath: string) =>
  `${import.meta.env.VITE_API_URL}/api/download/chats/${filePath.split('/').pop()}`;

const socket = io('http://localhost:4000', {
  withCredentials: false,
});

const currentChat = computed(() => {
  if (!selectedChatId.value) return null;
  return chats.value.find(chat => chat.id === selectedChatId.value) || null;
});

const otherParticipant = computed(() => {
  if (!currentChat.value) return null;
  const participant = currentChat.value.participants.find(p => p.id !== currentUserId.value);
  console.log('Other participant:', participant);
  return participant || null;
});

// Фильтрация чатов по поисковому запросу
const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) return chats.value;
  const query = searchQuery.value.toLowerCase();
  return chats.value.filter(chat => {
    const participantNames = chat.participants.map(p => p.name.toLowerCase()).join(' ');
    const groupName = chat.groupName?.toLowerCase() || '';
    return participantNames.includes(query) || groupName.includes(query);
  });
});

// Фильтрация пользователей без чата
const filteredSearchResults = computed(() =>
  searchResults.value.filter((user) =>
    !chats.value.some(chat =>
      chat.participants.some(p => p.id === user.id)
    ) && user.id !== currentUserId.value // Исключаем текущего пользователя
  )
);

// Кастомная реализация debounce с типизацией
function debounce<T extends any[]>(func: (...args: T) => void, delay: number) {
  let timeoutId: number;
  return function (this: void, ...args: T) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

async function searchUsersHandler() {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  try {
    const { data } = await axios.get<{ users: ChatParticipantData[] }>('/chats/search-users', {
      params: { query: searchQuery.value },
    });
    // Дедубликация по id
    searchResults.value = Array.from(new Map(data.users.map(user => [user.id, user])).values());
  } catch (err) {
    console.error('Ошибка поиска пользователей:', err);
    searchResults.value = [];
  } finally {
    isSearching.value = false;
  }
}

// Дебounced версия searchUsersHandler
const debouncedSearchUsersHandler = debounce(searchUsersHandler, 300);

async function goToOrCreateChat(user: ChatParticipantData) {
  try {
    const res = await axios.post('/chats', {
      participants: [
        {
          userId: currentUserId.value,
          role: userStore.currentUser?.role || 'INTERN',
        },
        {
          userId: user.id,
          role: user.role,
        },
      ],
    });

    const chatId = res.data.chat.id;
    selectedChatId.value = chatId;
    await fetchMessages(chatId);
    socket.emit('joinChat', chatId);
    router.push(`/chats/${chatId}`);
  } catch (err) {
    console.error('Ошибка при создании чата:', err);
  }
}

const fetchChats = async () => {
  try {
    console.log('Current User ID from store:', currentUserId.value);
    if (!currentUserId.value) {
      console.error('currentUserId is undefined or null');
      isLoading.value = false;
      return;
    }
    const res = await axios.get(`/chats/for-user/${currentUserId.value}`, {
      withCredentials: true,
    });
    chats.value = res.data.chats;
    console.log('Fetched chats:', chats.value);
    if (!selectedChatId.value && chats.value.length) {
      selectedChatId.value = chats.value[0].id;
      await fetchMessages(selectedChatId.value);
      router.push(`/chats/${selectedChatId.value}`);
    } else if (route.params.id && chats.value.some(chat => chat.id === route.params.id)) {
      selectedChatId.value = route.params.id as string;
      await fetchMessages(selectedChatId.value);
    }
  } catch (err) {
    console.error('Ошибка загрузки чатов:', err);
  } finally {
    isLoading.value = false;
  }
};

const fetchMessages = async (chatId: string) => {
  try {
    console.log('Fetching messages for chat:', chatId);
    const res = await axios.get(`/chats/${chatId}/messages`);
    messages.value = res.data.messages || [];
    console.log('Fetched messages for chat', chatId, ':', messages.value);
    scrollToBottom();
  } catch (err: any) {
    console.error('Ошибка загрузки сообщений:', err);
    if (err.response?.status === 404) {
      messages.value = [];
      console.log('No messages or chat not found for', chatId);
    }
  }
};

const selectChat = async (chatId: string) => {
  if (selectedChatId.value !== chatId) {
    selectedChatId.value = chatId;
    console.log('Selected chat:', selectedChatId.value);
    await fetchMessages(chatId);
    socket.emit('joinChat', chatId);
    router.push(`/chats/${chatId}`);
  }
};

const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files?.[0]) {
    attachedFile.value = input.files[0];
    newMessage.value = ''; // Очищаем текстовый инпут при прикреплении файла
  }
};

const removeFile = () => {
  attachedFile.value = null;
  const fileInput = document.querySelector('.attach-input') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
};

const startEditing = (message: Message) => {
  if (message.senderId === currentUserId.value) {
    editingMessage.value = { id: message.id, originalContent: message.content };
    newMessage.value = message.content;
    attachedFile.value = null; // Сбрасываем файл при редактировании
  }
};

const cancelEditing = () => {
  editingMessage.value = null;
  newMessage.value = '';
  attachedFile.value = null;
};

const deleteMessage = (messageId: string) => {
  if (confirm('Вы уверены, что хотите удалить сообщение?')) {
    axios.delete(`/chats/${selectedChatId.value}/messages/${messageId}`, {
      withCredentials: true,
    }).then(() => {
      messages.value = messages.value.filter(msg => msg.id !== messageId);
    }).catch(err => {
      console.error('Ошибка удаления:', err.response?.data || err.message);
    });
  }
};

const deleteChat = async () => {
  if (!selectedChatId.value || !confirm('Вы уверены, что хотите удалить этот чат?')) {
    return;
  }

  try {
    await axios.delete(`/chats/${selectedChatId.value}`, {
      withCredentials: true,
    });
    chats.value = chats.value.filter(chat => chat.id !== selectedChatId.value);
    messages.value = [];
    selectedChatId.value = chats.value.length > 0 ? chats.value[0].id : null;
    if (selectedChatId.value) {
      await fetchMessages(selectedChatId.value);
      router.push(selectedChatId.value ? `/chats/${selectedChatId.value}` : '/chats');
    } else {
      router.push('/chats');
    }
  } catch (err: any) {
    console.error('Ошибка удаления чата:', err.response?.data || err.message);
  }
};

const handleSendMessage = async () => {
  if ((!newMessage.value.trim() && !attachedFile.value) || !selectedChatId.value) {
    console.error('Сообщение не может быть пустым или чат не выбран');
    return;
  }

  if (editingMessage.value) {
    socket.emit('editMessage', { chatId: selectedChatId.value, messageId: editingMessage.value.id, content: newMessage.value.trim() }, (response: any) => {
      if (response?.success) {
        const msgIndex = messages.value.findIndex(msg => msg.id === editingMessage.value?.id);
        if (msgIndex !== -1) {
          messages.value[msgIndex].content = newMessage.value.trim();
        }
        cancelEditing();
      } else {
        console.error('Ошибка редактирования:', response?.error);
      }
    });
  } else if (attachedFile.value) {
    const formData = new FormData();
    formData.append('chatId', selectedChatId.value!);
    formData.append('senderId', currentUserId.value);
    formData.append('senderRole', userStore.currentUser?.role || 'INTERN');
    formData.append('file', attachedFile.value);

    try {
      console.log("Sending FormData:", Object.fromEntries(formData)); // Для отладки
      const res = await axios.post(`/chats/${selectedChatId.value}/messages/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true,
      });
      const message: Message = {
        id: res.data.messageId,
        content: res.data.fileUrl,
        fileName: attachedFile.value.name,
        senderId: currentUserId.value,
        senderRole: userStore.currentUser?.role || 'INTERN',
        createdAt: new Date(),
        chatId: selectedChatId.value!,
      };
      if (!messages.value.some(msg => msg.id === message.id)) {
        messages.value.push(message);
        scrollToBottom();
      }
      newMessage.value = '';
      attachedFile.value = null;
    } catch (err: any) {
      console.error('Ошибка отправки файла:', err.response?.data || err.message);
    }
  } else {
    socket.emit('sendMessage', { chatId: selectedChatId.value, senderId: currentUserId.value, senderRole: userStore.currentUser?.role || 'INTERN', content: newMessage.value.trim() }, (response: any) => {
      if (response?.success) {
        console.log('Message sent successfully, ID:', response.messageId);
        if (!messages.value.some(msg => msg.id === response.messageId)) {
          const newMessageObj: Message = {
            id: response.messageId,
            content: newMessage.value.trim(),
            senderId: currentUserId.value,
            senderRole: userStore.currentUser?.role || 'INTERN',
            createdAt: new Date(),
            chatId: selectedChatId.value!,
          };
          messages.value.push(newMessageObj);
          scrollToBottom();
        }
        newMessage.value = '';
        attachedFile.value = null;
      } else {
        console.error('Ошибка отправки сообщения:', response?.error);
      }
    });
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.chat-container');
    if (container) container.scrollTop = container.scrollHeight;
  });
};

onMounted(async () => {
  console.log('User Store:', userStore.currentUser);
  if (!currentUserId.value) return;

  await fetchChats();

  socket.on('connect', () => {
    socket.emit('newUser', currentUserId.value);
  });

  const handleGetMessage = (message: Message) => {
    if (message.chatId === selectedChatId.value && !messages.value.some(msg => msg.id === message.id)) {
      messages.value.push(message);
      scrollToBottom();
    }
  };

  socket.on('getMessage', handleGetMessage);

  socket.on('messageDeleted', (data: { messageId: string }) => {
    messages.value = messages.value.filter(msg => msg.id !== data.messageId);
  });

  socket.on('messageEdited', (data: { messageId: string; content: string }) => {
    const msgIndex = messages.value.findIndex(msg => msg.id === data.messageId);
    if (msgIndex !== -1) {
      messages.value[msgIndex].content = data.content;
    }
  });

  socket.connect();
});

onUnmounted(() => {
  socket.off('getMessage');
  socket.disconnect();
});

watch(messages, scrollToBottom);
</script>

<template>
  <div class="chatPage">
    <div class="sidebar-chat dark-blue-container">
      <h4>Чаты</h4>
      <input type="text" v-model="searchQuery" @input="debouncedSearchUsersHandler" placeholder="Поиск пользователей"
        class="search-input" />
      <Loader v-if="isLoading || isSearching" />
      <div class="mini-chats" v-else>
        <!-- Отображение отфильтрованных чатов -->
        <div v-for="chat in filteredChats" :key="chat.id" class="mini-chat"
          :class="{ active: chat.id === selectedChatId }" @click="selectChat(chat.id)">
          <img :src="chat.participants[0]?.avatar || '/img/noimage.jpg'" alt="" />
          <div class="content">
            <div class="name">
              {{ chat.groupName || chat.participants[0]?.name || 'Без имени' }}
              <span v-if="chat.participants.length > 1" class="group-indicator">
                ({{ chat.participants.length }})
              </span>
            </div>
            <div class="last-msg" v-if="chat.lastMessage">
              {{ chat.lastMessage.length > 10 ? chat.lastMessage.substring(0, 10) + '...' : chat.lastMessage }}
            </div>
          </div>
        </div>
        <!-- Отображение пользователей без чата -->
        <div v-for="user in filteredSearchResults" :key="user.id" class="mini-chat" @click="goToOrCreateChat(user)">
          <img :src="user.avatar || '/img/noimage.jpg'" alt="" />
          <div class="content">
            <div class="name">{{ user.name }}</div>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-window" v-if="currentChat && !isLoading" :key="selectedChatId || '' + Date.now()">
      <div class="edit-profile dark-blue-container">
        <div class="profile" v-if="currentChat">
          <img :src="otherParticipant?.avatar || '/img/noimage.jpg'" alt="" />
          <div class="names">
            <div class="name">
              {{ currentChat.groupName || otherParticipant?.name || 'Без имени' }}
              <TextCard v-if="otherParticipant?.position" color="#0075FF" :text="otherParticipant.position" />
              <TextCard v-if="otherParticipant?.role" color="#adff2f" :text="otherParticipant.role" />
            </div>
          </div>
        </div>
        <button class="delete-chat" @click="deleteChat">
          <DeleteIcon />
        </button>
      </div>

      <div class="chat-container dark-blue-container">
        <div class="messages">
          <div v-for="message in messages" :key="message.id"
            :class="['message', { sent: message.senderId === currentUserId, received: message.senderId !== currentUserId }]"
            @mouseover="hoveredMessage = message.id" @mouseleave="hoveredMessage = null">
            <div v-if="message.content.includes('/uploads/')" class="file-message">
              <a :href="getDownloadUrl(message.content)" download class="file-link">
                <FileIcon />
                <span class="file-name">{{ message.fileName }}</span>
              </a>
            </div>
            <div v-else class="content">
              <div class="message-text">{{ message.content }}</div>
            </div>
            <div class="timestamp">{{ new Date(message.createdAt).toLocaleString('ru-RU', {
              year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            }) }}</div>
            <div v-if="hoveredMessage === message.id && message.senderId === currentUserId" class="message-actions">
              <button @click="startEditing(message)" class="action-btn">
                <EditIcon />
              </button>
              <button @click="deleteMessage(message.id)" class="action-btn">
                <DeleteIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      <form @submit.prevent="handleSendMessage">
        <div v-if="attachedFile" class="attached-file">
          <span class="file-name">{{ attachedFile.name }}</span>
          <button type="button" class="remove-file" @click="removeFile">
            <CloseIcon />
          </button>
        </div>
        <input v-model="newMessage" type="text" :disabled="!!attachedFile" placeholder="Введите сообщение..." />
        <label class="attach">
          <AttachmentIcon />
          <input type="file" class="attach-input" @change="handleFileUpload" />
        </label>
        <button v-if="editingMessage" type="button" class="cancel-btn" @click="cancelEditing">
          Отмена
        </button>
        <button class="send" type="submit">
          <SendIcon />
        </button>
      </form>
    </div>

    <div v-else-if="!isLoading" class="chat-window empty-chat">
      {{ !chats?.length ? 'Нет доступных чатов' : 'Чат не найден, выберите другой' }}
    </div>
  </div>
</template>

<style scoped>
.chatPage {
  display: flex;
  gap: 12px;
}

.delete-chat {
  width: 32px;
  height: 32px;
  padding: 2px;
  border: 2px solid red;
  border-radius: 5px;
}

.delete-chat svg {
  width: 100%;
}

.sidebar-chat {
  padding: 12px;
  max-width: 30%;
}

.search-input {
  width: 100%;
  height: 40px;
  margin: 12px 0;
}

.mini-chats {
  max-width: 100%;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.mini-chat {
  display: flex;
  padding: 12px 20px 12px 12px;
  gap: 8px;
  border-radius: 15px;
}

.mini-chat:hover {
  background: rgba(128, 128, 128, 0.127);
  cursor: pointer;
}

.mini-chat.active {
  background: rgba(128, 128, 128, 0.127);
}

.mini-chat .content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.mini-chat img {
  flex-shrink: 0;
  width: 60px;
  height: 60px;
  border-radius: 50%;
}

.mini-chat .name {
  font-size: 1em;
}

.last-msg {
  color: var(--textColorLightGray);
  padding: 4px;
}

.chat-window {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  height: calc(100vh - 60px);
}

.chat-container {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  max-height: calc(100vh - 200px);
  display: flex;
  flex-direction: column;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.message {
  max-width: 70%;
  min-width: 120px;
  padding: 10px 15px;
  border-radius: 10px;
  position: relative;
  word-break: break-word;
  overflow-wrap: break-word;
}

.sent {
  background-color: #007bff;
  color: white;
  align-self: flex-end;
}

.received {
  background-color: #e9ecef;
  color: black;
  align-self: flex-start;
}

.file-message {
  display: flex;
  align-items: center;
  gap: 8px;
  color: white;
}

.file-link {
  display: flex;
  align-items: center;
  color: inherit;
  text-decoration: none;
  max-width: 100%;
}

.file-link:hover {
  color: #0056b3;
}

.file-link svg {
  width: 26px;
  height: 26px;
  color: white;
  margin-right: 5px;
}

.file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

.content {
  margin-bottom: 5px;
}

.timestamp {
  font-size: 0.7em;
  color: inherit;
  opacity: 0.8;
  text-align: right;
  margin-top: 4px;
}

.message-actions {
  position: absolute;
  top: 5px;
  right: 5px;
  display: flex;
  gap: 5px;
}

.action-btn {
  background: var(--colorDarkBlue);
  border-radius: 5px;
  width: 26px;
  height: 26px;
  border: none;
  cursor: pointer;
  padding: 0.2em;
}

.action-btn svg {
  width: 100%;
  color: white;
}

.edit-profile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
}

.edit-profile .profile {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  font-size: 1.15em;
}

.edit-profile .profile .login {
  font-size: 0.9em;
  color: var(--textСolorGray);
}

.edit-profile .profile img {
  flex-shrink: 0;
  width: 80px;
  height: 80px;
  border-radius: 15px;
}

.edit-profile .profile .name {
  display: flex;
  align-items: center;
  gap: 15px;
}

.edit-profile .edit {
  background-color: var(--colorBlue);
  width: 32px;
  height: 32px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  cursor: pointer;
}

.edit-profile .edit svg {
  color: white;
  width: 18px;
}

form {
  display: flex;
  width: 100%;
  position: relative;
}

input {
  border-radius: 0;
  flex: 1;
  border-radius: 0.5em;
}

input:disabled {
  background-color: #f0f0f0;
  cursor: not-allowed;
}

.send,
.attach,
.cancel-btn {
  background-color: var(--colorBlue);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0.5em;
  cursor: pointer;
  margin: 2px;
  border-radius: 0.5em;
  position: relative;
}

.cancel-btn {
  color: white;
}

.send svg,
.attach svg {
  color: white;
  width: 1.8em;
}

.attach-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  border: 0;
  opacity: 0;
}

.group-indicator {
  font-size: 0.9em;
  color: var(--textColorLightGray);
  margin-left: 5px;
}

.attached-file {
  display: flex;
  align-items: center;
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 12px;
  margin-top: 4px;
  font-size: 0.8em;
  color: black;
}

.remove-file {
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  margin-left: 4px;
  padding: 2px;
}

.remove-file svg {
  width: 15px;
  height: 15px;
}

.cancel-btn {
  margin-left: 5px;
}
</style>