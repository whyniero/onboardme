<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { RouterLink } from 'vue-router';
import { useUserStore } from '../../stores/user';
import axios from '../../utils/axios';
import Loader from '../../components/Loader.vue';

interface Stage {
  id: string;
  number: number;
  name: string;
  tasks: { id: string; number: number; name: string }[];
  showTasks: boolean;
  internId?: string;
}

const stages = ref<Stage[]>([]);
const loading = ref<boolean>(true);
const error = ref<string | null>(null);

const userStore = useUserStore();
const internId = computed(() => userStore.currentUser?.id || null);
const internName = computed(() => userStore.currentUser?.name || 'Неизвестно');

async function fetchStages() {
  if (!internId.value) {
    error.value = 'Информация о стажере отсутствует.';
    loading.value = false;
    return;
  }

  try {
    const res = await axios.get(`/stages/interns/${internId.value}`);
    stages.value = res.data.stages.map((stage: any) => ({
      id: stage.id,
      number: stage.number,
      name: stage.name,
      tasks: stage.tasks.map((task: any) => ({
        id: task.id,
        number: task.number || task.id,
        name: task.name,
      })) || [],
      showTasks: false,
      internId: stage.internId,
    }));
    console.log("Stages fetched for intern:", internId.value, stages.value);
  } catch (err: any) {
    console.error(err);
    error.value = err.response?.data.message || 'Не удалось загрузить этапы.';
  } finally {
    loading.value = false;
  }
}

onMounted(async () => {
  await fetchStages();
});


// Управление видимостью заданий
const showTasks = (index: number): void => {
  stages.value[index].showTasks = true;
};

const hideTasks = (index: number): void => {
  stages.value[index].showTasks = false;
};

// Поскольку API фильтрует по internId, фильтрация не требуется
const filteredStages = computed(() => stages.value);
</script>

<template>
  <div class="stagesPage container dark-blue-container" v-dragscroll.x="true">
    <h1>Этапы онбординга для стажера {{ internName }}</h1>
    <Loader v-if="loading" />
    <div v-if="error" class="error">{{ error }}</div>
    <div v-if="!loading && !error" class="stages">
      <div class="roadmap-line"></div>
      <div v-for="(stage, index) in filteredStages" :key="index" class="stage" @mouseover="showTasks(index)"
        @mouseleave="hideTasks(index)">
        <div class="stage-circle">{{ stage.number }}</div>
        <div class="stage-label">{{ stage.name }}</div>
        <div v-show="stage.showTasks" class="tasks">
          <div v-if="!stage.tasks.length" class="task-link">Нет задач</div>
          <div v-if="stage.tasks.length" v-for="(task, taskIndex) in stage.tasks" :key="taskIndex" class="task">
            <RouterLink :to="`/stages/${stage.id}/tasks/${task.id}`" class="task-link">
              <b>{{ task.number }}.</b>
              {{ task.name }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stagesPage {
  overflow-x: auto;
  overflow-y: hidden;
  user-select: none;
  position: relative;
  padding: 20px;
  border-radius: 10px;
}

.roadmap-line {
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, #000, #333);
  transform: translateY(-50%);
  z-index: 1;
}

.stages {
  position: relative;
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: 100%;
  z-index: 2;
  gap: 50px;
}

.stage {
  position: relative;
  text-align: center;
}

.stage-circle {
  font-size: 2em;
  width: 72px;
  height: 72px;
  background-color: #00aaff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 10px;
  position: relative;
  z-index: 3;
}

.stage-circle::after {
  content: '';
  position: absolute;
  bottom: -20px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 10px solid transparent;
  border-right: 10px solid transparent;
  border-top: 10px solid #00aaff;
}

.stage-label {
  background-color: #f0f0f0;
  padding: 5px 10px;
  font-size: 1.4em;
  border-radius: 5px;
  color: #333;
  white-space: nowrap;
}

.tasks {
  position: absolute;
  top: 60px;
  left: 50%;
  transform: translateX(-50%);
  background-color: #f0f0f0;
  border-radius: 5px;
  padding: 8px 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 4;
  min-width: 150px;
  text-align: left;
}

.task {
  color: #333;
  width: 100%;
}

.task-link {
  color: #333;
  display: block;
  width: 100%;
  padding: 10px;
}

.task:hover {
  background-color: rgb(189, 194, 198);
  cursor: pointer;
}

.task:hover {
  cursor: pointer;
}
</style>