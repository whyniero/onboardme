<script setup lang="ts">
import axios from '../../../utils/axios';
import { onMounted, reactive, ref, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import type { Stage, Task } from '../../../types/types';
import { eventBus } from '../../../utils/eventBus';

const router = useRouter();
const route = useRoute();
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);
const createdTask = ref<Task | null>(null);

const stages = ref<Stage[] | null>(null);
const tasksCount = ref<Record<string, number>>({});

const initialStageId = route.params.stageId as string | undefined;
const taskForm = reactive({
  number: null as number | null,
  name: null as string | null,
  desc: null as string | null,
  deadline: null as string | null,
  stageId: initialStageId || null as string | null,
});

async function getStages() {
  try {
    const res = await axios.get("/stages");
    stages.value = res.data.stages;
    console.log("Stages loaded:", res.data.stages);
    // Автоматически выбираем этап при загрузке, если stageId доступен
    if (taskForm.stageId && stages.value) {
      const stage = stages.value.find(s => s.id === taskForm.stageId);
      if (!stage) await getTasksCount(taskForm.stageId); // Загружаем задачи, если этап не найден
    }
  } catch (err) {
    console.error("Error loading stages:", err);
  }
}

async function getTasksCount(stageId: string) {
  try {
    const res = await axios.get(`/stages/${stageId}/tasks`);
    tasksCount.value[stageId] = res.data.tasks.length;
    console.log(`Tasks count for ${stageId}:`, tasksCount.value[stageId]);
  } catch (err) {
    console.error(`Error loading tasks for ${stageId}:`, err);
    tasksCount.value[stageId] = 0;
  }
}

onMounted(async () => {
  await getStages();
  if (taskForm.stageId) {
    await getTasksCount(taskForm.stageId);
    taskForm.number = taskNumber.value;
  }
});

const taskNumber = computed(() => {
  if (!taskForm.stageId) return null;
  const count = tasksCount.value[taskForm.stageId] || 0;
  console.log(`Computed taskNumber for ${taskForm.stageId}:`, count + 1);
  return count + 1;
});

watch(() => taskForm.stageId, async (newStageId) => {
  console.log("StageId changed to", newStageId);
  if (newStageId) {
    await getTasksCount(newStageId);
    taskForm.number = taskNumber.value;
    console.log("Updated taskForm.number:", taskForm.number);
  } else {
    taskForm.number = null;
    console.log("Cleared taskForm.number");
  }
});

function cancelHandler() {
  error.value = null;
  successMessage.value = null;
  createdTask.value = null;
  router.push("/control");
}

async function createTaskHandler(e: Event) {
  e.preventDefault();
  error.value = null;
  successMessage.value = null;

  const number = taskForm.number || 1;
  const name = taskForm.name?.trim() || null;
  const desc = taskForm.desc?.trim() || null; // Опциональное поле
  const deadline = taskForm.deadline || null;
  const stageId = taskForm.stageId || null;

  if (!name) return (error.value = "Название задачи обязательно");
  if (!stageId) return (error.value = "Необходимо выбрать этап");
  if (!deadline) return (error.value = "Дедлайн обязателен");

  try {
    const res = await axios.post(`/stages/${stageId}/tasks`, {
      number,
      name,
      desc,
      deadline,
      status: "NOT_STARTED",
    });
    console.log("Task created:", res.data.task);

    if (res.status === 201) {
      createdTask.value = res.data.task;
      successMessage.value = `Задача создана! Номер задачи: ${createdTask.value?.number}`;

      eventBus.emit('reloadStages');
      router.push('/control');
    }
  } catch (err: any) {
    error.value = err.response?.data.message ?? "Ошибка при создании задачи";
    console.error("Error creating task:", err);
  }
}

</script>

<template>
  <div @click.stop="cancelHandler" class="addTaskPage">
    <form @submit.prevent="createTaskHandler" @click.stop class="dark-blue-container">
      <h2>Создание задачи</h2>

      <label for="">
        Номер задачи
        <input :value="taskForm.number" type="number" readonly required>
      </label>

      <label for="">
        Название задачи
        <input v-model="taskForm.name" type="text" required>
      </label>

      <label for="">
        Описание
        <input v-model="taskForm.desc" type="text">
      </label>

      <label for="">
        Дедлайн
        <input v-model="taskForm.deadline" type="date" required>
      </label>

      <label for="">
        Этап
        <div class="custom-select">
          <select v-model="taskForm.stageId" required>
            <option :value="null" selected>Не выбрано</option>
            <option v-for="stage in stages" :value="stage.id" :key="stage.id">
              {{ stage.name }} (№{{ stage.number }})
            </option>
          </select>
        </div>
      </label>

      <button type="submit" class="form-btn">Создать задачу</button>
      <span v-if="error" class="error">{{ error }}</span>
      <span v-if="successMessage" class="success">{{ successMessage }}</span>
    </form>
  </div>
</template>

<style scoped>
/* Стили остаются без изменений */
.addTaskPage {
  position: fixed;
  z-index: 999;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
}

form {
  padding: 60px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

input,
.custom-select select {
  width: 100%;
  padding: 10px 15px;
  border-radius: 15px;
  border: 2px solid transparent;
  background: linear-gradient(#000977, #000977 0) padding-box,
    linear-gradient(to right bottom, #582cff, #5a2cff00, #582cff) border-box;
  color: white;
  font-size: 1em;
  outline: none;
}

.custom-select {
  position: relative;
  width: 100%;
}

.custom-select::after {
  content: "▼";
  font-size: 0.8em;
  color: white;
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.custom-select select {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 30px;
  cursor: pointer;
}

.custom-select select option {
  color: black;
}

.error {
  color: #ff4d4f;
  margin-top: 10px;
}

.success {
  color: #4caf50;
  margin-top: 10px;
}
</style>