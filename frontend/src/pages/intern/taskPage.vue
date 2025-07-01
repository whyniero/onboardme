<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
import axios from '../../utils/axios';
import TextCard from '../../ui/TextCard.vue';
import Loader from '../../components/Loader.vue';
import StatusCard from '../../ui/StatusCard.vue';
import type { Position } from '../../types/types';

interface Task {
  id: string;
  number: number;
  name: string;
  desc: string;
  status: string;
  deadline: string;
  stage: {
    id: string;
    name: string;
    number: number;
    createdBy: {
      id: number;
      name: string;
      login: string;
      role: string;
      position: Position;
      avatar: string | null; // Добавлено поле для аватарки
    } | null; // createdBy как mentor
  };
  attachments: { id: string; url: string }[];
  comments: { id: string; content: string; senderId: string; senderRole: string }[];
}

const route = useRoute();
const router = useRouter();
const task = ref<Task | null>(null);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

const userStore = useUserStore();
const internId = computed(() => userStore.currentUser?.id || null);

const stageId = computed(() => route.params.stageId as string);
const taskId = computed(() => route.params.id as string);

const formatDate = (dateString: string) => computed((): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
})

async function fetchTask() {
  if (!internId.value || !stageId.value || !taskId.value) {
    error.value = 'Информация о задаче, этапе или стажере отсутствует.';
    loading.value = false;
    console.log('Missing params:', { internId: internId.value, stageId: stageId.value, taskId: taskId.value });
    return;
  }

  try {
    console.log('Fetching task from:', `/stages/${stageId.value}/tasks/${taskId.value}`);
    const res = await axios.get(`/stages/${stageId.value}/tasks/${taskId.value}`);
    task.value = res.data.task;
    console.log("Task fetched:", task.value);
  } catch (err: any) {
    console.error(err);
    error.value = err.response?.data.message || 'Не удалось загрузить задачу.';
  } finally {
    loading.value = false;
  }
}

async function updateTaskStatus(newStatus: string) {
  if (!task.value?.id) return;

  try {
    await axios.post(`/stages/${stageId.value}/tasks/${task.value.id}/status`, { status: newStatus });
    if (task.value) task.value.status = newStatus;
    console.log(`Status updated to: ${newStatus}`);
  } catch (err: any) {
    console.error(err);
    error.value = err.response?.data.message || 'Не удалось обновить статус.';
  }
}

onMounted(() => {
  fetchTask();
});
</script>

<template>
  <div class="taskPage container">
    <Loader v-if="loading" />
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="!loading && !error && task" class="task dark-blue-container">
      <div class="back-btn">
        <button @click="router.go(-1)">
          <img src="" alt="">
        </button>
        <div class="title">
          <h2>{{ `Задание ${task.number}: ${task.name}` }}</h2>
          <StatusCard :status="task.status" class="status" />
          <span>до {{ formatDate(task.deadline) }}</span>
        </div>
      </div>
      <div>
        <h4>Ответственный:</h4>
        <div class="profile" v-if="task.stage.createdBy">
          <img :src="task.stage.createdBy.avatar || '/img/noimage.jpg'" alt="Mentor Avatar" class="avatar">
          <div class="name">
            {{ task.stage.createdBy.name }}
          </div>
          <TextCard v-if="task.stage.createdBy.position" :text="task.stage.createdBy.position.name"
            :color="task.stage.createdBy.position.color" class="textcard" />
          <TextCard :text="task.stage.createdBy.role" color="#adff2f" class="textcard" />
        </div>
        <p v-else>Ответственный не назначен</p>
      </div>
    </div>
    <div class="attachments dark-blue-container">
      <h4>Вложения</h4>
      <h1>в разработке</h1>
    </div>
    <div class="desc dark-blue-container">
      <h4>Описание</h4>
      <p>{{ task?.desc }}</p>
    </div>
    <div class="comments dark-blue-container">
      <h4>Комментарии</h4>
      <h1>в разработке</h1>

    </div>
    <div class="statistics">
      <div class="dark-blue-container">
        <h1>в разработке</h1>

      </div>
      <button v-if="task?.status === 'NOT_STARTED'" class="status-btn" @click="updateTaskStatus('HAS_STARTED')">
        Начать
      </button>
      <button v-else-if="task?.status === 'HAS_STARTED'" class="status-btn active" @click="updateTaskStatus('DONE')">
        Завершить
      </button>
      <button v-else class="status-btn done" disabled>Завершено</button>
    </div>
  </div>
</template>

<style scoped>
.taskPage {
  display: grid;
  grid-template-areas:
    "task attachments"
    "desc comments"
    "desc statistics";
  grid-template-columns: 2fr 1fr;
  grid-template-rows: 1fr 1fr 1fr;
  gap: 12px;
}

.task {
  grid-area: task;
}

.attachments {
  grid-area: attachments;
}

.desc {
  grid-area: desc;
}

.comments {
  grid-area: comments;
}

.statistics {
  grid-area: statistics;
}

.task {
  display: flex;
  flex-direction: column;
}

.title {
  display: flex;
  align-items: center;
  gap: 20px;
}

.status {
  font-size: 1.4em;
}

.status-btn {
  width: 100%;
  background-color: var(--colorGreen);
  border-radius: 15px;
  color: var(--textColorWhite);
  padding: 12px;
  font-size: 1.2em;
  font-weight: 500;
}

.status-btn.active {
  background-color: rgba(255, 0, 0, 0.4);
  border: solid 2px var(--colorRed);
  box-shadow: 0 0 30px 5px rgba(255, 0, 0, 0.5);
  color: red;
}

.status-btn.done {
  display: none;
}

.profile {
  padding: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}


.textcard {
  font-size: 0.7em;
}
</style>