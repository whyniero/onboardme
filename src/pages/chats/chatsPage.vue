<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import TextCard from '../../ui/TextCard.vue';
import { RouterLink, useRouter } from 'vue-router';
import axios from '../../utils/axios';
import { useUserStore } from '../../stores/user';
import Loader from '../../components/Loader.vue';
import type { Role } from '../../types/types';

const router = useRouter();

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

const isLoading = ref<boolean>(true);
const chats = ref<FormattedChat[] | null>(null);
const userStore = useUserStore();

const searchQuery = ref('');
const searchResults = ref<ChatParticipantData[]>([]);
const isSearching = ref(false);

// Фильтрация чатов по поисковому запросу с удалением дубликатов
const filteredChats = computed(() => {
  if (!searchQuery.value.trim()) {
    return chats.value ? [...new Map(chats.value.map(chat => [chat.id, chat])).values()] : [];
  }
  const query = searchQuery.value.toLowerCase();
  return chats.value?.filter(chat => {
    const participantNames = chat.participants.map(p => p.name.toLowerCase()).join(' ');
    const groupName = chat.groupName?.toLowerCase() || '';
    return participantNames.includes(query) || groupName.includes(query);
  }) || [];
});

// Фильтрация пользователей без чата (убираем дубликаты)
const filteredSearchResults = computed(() =>
  searchResults.value.filter((user) =>
    !chats.value?.some(chat =>
      chat.participants.some(p => p.id === user.id)
    )
  ).filter((user, index, self) => // Удаляем дубликаты
    index === self.findIndex((u) => u.id === user.id)
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
    const { data } = await axios.get(`/chats/search-users`, {
      params: { query: searchQuery.value },
    });
    searchResults.value = data.users;
  } catch (err) {
    console.error(err);
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
          userId: userStore.currentUser?.id,
          role: userStore.currentUser?.role,
        },
        {
          userId: user.id,
          role: user.role,
        },
      ],
    });

    const chatId = res.data.chat.id;
    // Обновляем чаты после создания
    await getChatsHandler();
    router.push(`/chats/${chatId}`);
  } catch (err) {
    console.error('Ошибка при создании чата:', err);
  }
}

async function getChatsHandler() {
  try {
    const id = userStore.currentUser?.id;
    const res = await axios.get(`/chats/for-user/${id}`);
    chats.value = res.data.chats || []; // Обработка пустого результата
    isLoading.value = false;
  } catch (err: any) {
    console.error(err);
    if (err.response?.status === 404) {
      chats.value = []; // Устанавливаем пустой массив при 404
    }
    isLoading.value = false;
  }
}

onMounted(async () => {
  await getChatsHandler();
});
</script>

<template>
  <div class="chatsPage">
    <div class="chats dark-blue-container">
      <h2>Чаты</h2>
      <input type="text" v-model="searchQuery" @input="debouncedSearchUsersHandler" placeholder="Поиск пользователей"
        class="search-input" />

      <Loader v-if="isLoading || isSearching" />

      <!-- Сообщение при отсутствии чатов -->
      <div v-else-if="!isLoading && (!chats || chats.length === 0) && !searchQuery.trim()" class="no-chats-message">
        У вас пока нет чатов. Начните общение, найдя пользователя через поиск.
      </div>

      <template v-else>
        <!-- Сначала чаты -->
        <RouterLink v-for="chat in filteredChats" :key="chat.id" :to="`/chats/${chat.id}`" class="chat">
          <img :src="chat.participants[0]?.avatar || '/img/noimage.jpg'" />
          <div class="content">
            <div class="profile">
              <div class="name">
                {{ chat.groupName || chat.participants[0]?.name || 'Без имени' }}
              </div>
              <TextCard v-if="chat.participants[0]?.position" :text="chat.participants[0].position" color="#0075FF" />
              <TextCard :text="chat.participants[0]?.role" color="#adff2f" />
            </div>
            <div class="last-msg" v-if="chat.lastMessage">
              {{ chat.lastMessage.length > 150 ? chat.lastMessage.substring(0, 150) + '...' : chat.lastMessage }}
            </div>
          </div>
        </RouterLink>

        <!-- Затем пользователи без чата -->
        <div v-for="user in filteredSearchResults" :key="user.id" class="chat" @click="goToOrCreateChat(user)">
          <img :src="user.avatar || '/img/noimage.jpg'" />
          <div class="content">
            <div class="profile">
              <div class="name">{{ user.name }}</div>
              <TextCard v-if="user.position" :text="user.position" color="#0075FF" />
              <TextCard :text="user.role" color="#adff2f" />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.chatsPage {
  overflow-y: auto;
  max-height: calc(100vh - 24px);
}

.chats {
  display: flex;
  flex-direction: column;
}

.search-input {
  width: 30%;
  margin: 12px 0;
}

.chat {
  display: flex;
  padding: 12px;
  border-radius: 15px;
  gap: 12px;
}

.chat:hover {
  background: rgba(128, 128, 128, 0.127);
  cursor: pointer;
}

.chat .content {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.chat .profile {
  display: flex;
  gap: 20px;
  align-items: flex-start;
}

.chat img {
  width: 68px;
  height: 68px;
  border-radius: 50%;
}

.chat .profile .name {
  font-size: 1.1em;
}

.text-card {
  font-size: 0.8em;
}

.last-msg {
  color: var(--textColorLightGray);
  padding: 4px;
  white-space: pre-wrap;
  word-break: break-word;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

.group-indicator {
  font-size: 0.9em;
  color: var(--textColorLightGray);
  margin-left: 5px;
}

.no-chats-message {
  padding: 20px;
  text-align: center;
  color: var(--textColorLightGray);
  font-style: italic;
}
</style>