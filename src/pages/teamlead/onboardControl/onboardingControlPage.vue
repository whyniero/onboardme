<script setup lang="ts">
import { ref, onMounted, computed, onBeforeUnmount } from 'vue';
import { RouterLink } from 'vue-router';
import Loader from '../../../components/Loader.vue';
import type { Intern } from "../../../types/types";
import axios from '../../../utils/axios';
import StatusCard from '../../../ui/StatusCard.vue';
import { eventBus } from '../../../utils/eventBus';

// Определение типа Stage и Task, совместимых с данными бэкенда
interface Task {
  id: string;
  number: number;
  name: string;
  status: string;
  deadline: Date | string | null;
  stageId: string;
}

interface Stage {
  id: string;
  number: number;
  name: string;
  status: string;
  startedAt?: Date | string | null;
  endedAt?: Date | string | null;
  internId?: string;
  createdFor?: Intern;
  tasks?: Task[];
}

const error = ref<string | null>(null);
const isLoading = ref<boolean>(true);
const expandedStageId = ref<string | null>(null);
const stages = ref<Stage[]>([]);

async function getStages() {
  try {
    const res = await axios.get("/stages");
    // Явно маппим данные, приводя stageId к строке
    stages.value = res.data.stages.map((stage: any) => ({
      id: stage.id,
      number: stage.number,
      name: stage.name,
      status: stage.status,
      startedAt: stage.startedAt,
      endedAt: stage.endedAt,
      internId: stage.internId,
      createdFor: stage.createdFor,
      tasks: stage.tasks ? stage.tasks.map((task: any) => ({
        id: task.id,
        number: task.number,
        name: task.name,
        status: task.status,
        deadline: task.deadline,
        stageId: task.stageId
      })) : [],
    })) as Stage[];
    console.log(stages.value);
    isLoading.value = false;
  } catch (err) {
    console.error("Ошибка загрузки этапов:", err);
    error.value = "Не удалось загрузить этапы. Проверьте подключение или обратитесь к администратору.";
  }
}

// Переключение раскрытия этапа
const toggleStage = (stageId: string): void => {
  expandedStageId.value = expandedStageId.value === stageId ? null : stageId;
};

// Подсчет задач
const taskCount = computed(() => {
  return (stage: Stage) => stage.tasks?.length || 0;
});

// Получение данных пользователя
const getInternInfo = (stage: Stage): Intern | null => {
  return stage.createdFor || null;
};

// Получение отсортированных задач в обратном порядке
const getSortedTasks = (tasks: Task[] | undefined): Task[] => {
  return tasks ? [...tasks].sort((a, b) => a.number - b.number) : [];
};

onMounted(async () => {
  await getStages();
  eventBus.on('reloadStages', getStages);
});

onBeforeUnmount(() => {
  eventBus.off('reloadStages', getStages);
})
</script>

<template>
  <div class="onboardingControlPage dark-blue-container">
    <h1>Управление онбордингами</h1>
    <div class="buttons">
      <RouterLink to="/control/stages/add">
        <button class="add">Добавить этап</button>
      </RouterLink>
    </div>
    <span v-if="error" class="error">{{ error }}</span>

    <div class="stages-table">
      <table>
        <thead>
          <tr>
            <th>Номер</th>
            <th>Название</th>
            <th>Статус</th>
            <th>Начато</th>
            <th>Завершено</th>
            <th>Для кого</th>
            <th>Кол-во задач</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="isLoading">
            <tr>
              <td colspan="8" class="loading-row">
                <Loader />
              </td>
            </tr>
          </template>
          <template v-else>
            <template v-for="stage in stages" :key="stage.id">
              <tr class="stage-row" @click="toggleStage(stage.id)">
                <td>{{ stage.number }}</td>
                <td>{{ stage.name }}</td>
                <td>
                  <StatusCard :status="stage.status" />
                </td>
                <td>{{ stage.startedAt ? new Date(stage.startedAt).toLocaleDateString('ru-RU') : "Нету" }}</td>
                <td>{{ stage.endedAt ? new Date(stage.endedAt).toLocaleDateString('ru-RU') : "Нету" }}</td>
                <td>
                  <template v-if="getInternInfo(stage)">
                    {{ getInternInfo(stage)?.name || "Неизвестный стажер" }}
                  </template>
                  <span v-else>Не указан</span>
                </td>
                <td>{{ taskCount(stage) }}</td>
                <td class="actions">
                  <RouterLink :to="`/control/stages/${stage.id}/update`" @click.stop>
                    <button class="edit-btn">Изменить</button>
                  </RouterLink>
                </td>
              </tr>
              <tr v-if="expandedStageId === stage.id" class="tasks-row">
                <td colspan="8">
                  <div class="tasks-container">
                    <div v-if="stage.tasks && stage.tasks.length" class="tasks-list">
                      <div v-for="task in getSortedTasks(stage.tasks)" :key="task.id" class="task-item">
                        <div class="task-info">
                          <span class="task-name">{{ task.number }}. {{ task.name }}</span>
                          <StatusCard :status="task.status" />
                          <span class="task-deadline">Дедлайн: {{ task.deadline ? new
                            Date(task.deadline).toLocaleDateString('ru-RU')
                            : "Нет" }}</span>
                        </div>
                        <div class="task-actions">
                          <RouterLink :to="`/control/tasks/${task.id}`" @click.stop>
                            <button class="task-btn">Предпросмотр</button>
                            <RouterLink :to="`/control/stages/${stage.id}/tasks/${task.id}/update`" @click.stop>
                              <button class="edit-task-btn">Изменить</button>
                            </RouterLink>
                          </RouterLink>
                        </div>
                      </div>
                    </div>
                    <div v-else class="no-tasks">
                      Нет задач для этого этапа
                    </div>
                    <div class="add-task-section">
                      <RouterLink :to="`/control/stages/${stage.id}/tasks/add`" class="add-task-link">
                        <button class="add-task-btn">Добавить задачу</button>
                      </RouterLink>
                    </div>
                  </div>
                </td>
              </tr>
            </template>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.onboardingControlPage {
  overflow-y: auto;
  max-height: calc(100vh - 24px);
  width: 100%;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.buttons {
  padding-top: 20px;
  display: flex;
  justify-content: flex-start;
}

.buttons .add {
  background-color: var(--colorGreen);
  padding: 8px 18px;
  border-radius: 2em;
  font-weight: 400;
  color: var(--textWhiteColor);
  border: none;
  cursor: pointer;
}

.error {
  color: var(--colorRed);
  margin-top: 10px;
}

.stages-table {
  width: 100%;
  overflow-x: auto;
  margin-top: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid var(--colorBlue);
}

th {
  color: var(--textColorLightGray);
  font-weight: 400;
}

.loading-row {
  text-align: center;
  padding: 20px;
}

.stage-row {
  cursor: pointer;
}

.stage-row:hover {
  background-color: rgba(128, 128, 128, 0.1);
}

.tasks-row {
  background-color: rgba(30, 40, 60, 0.5);
}

.tasks-container {
  padding: 15px;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 15px;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 5px;
}

.task-info {
  display: flex;
  gap: 15px;
  align-items: center;
  flex-wrap: wrap;
}

.task-name {
  font-weight: 500;
}

.task-deadline {
  color: var(--textColorLightGray);
  font-size: 0.9em;
}

.no-tasks {
  padding: 15px;
  text-align: center;
  color: var(--textColorLightGray);
  font-style: italic;
}

.actions {
  white-space: nowrap;
}

.task-actions {
  display: flex;
  gap: 10px;
}

.edit-btn,
.edit-task-btn,
.add-task-btn {
  padding: 6px 12px;
  border-radius: 15px;
  border: none;
  cursor: pointer;
  font-size: 0.9em;
  transition: opacity 0.2s;
}

.edit-btn {
  background-color: var(--colorBlue);
  color: white;
  transition: .2s all ease;
}

.edit-task-btn {
  background-color: var(--colorBlue);
  color: white;
  transition: .2s all ease;
}

.task-btn {
  padding: 6px 12px;
  cursor: pointer;
  font-size: 0.9em;
  color: white;
}

.task-btn:hover {
  text-decoration: underline;
}

.add-task-btn {
  background-color: var(--colorGreen);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  margin-top: 10px;
}

.edit-btn:hover,
.edit-task-btn:hover {
  background-color: white;
  color: var(--colorBlue);
}

.add-task-btn:hover {
  opacity: 0.9;
}

.add-task-section {
  margin-top: 15px;
  text-align: center;
}

.add-task-link {
  text-decoration: none;
}
</style>