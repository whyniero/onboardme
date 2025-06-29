<script setup lang="ts">
import axios from '../../../utils/axios';
import { onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Intern, Stage, Teamlead } from '../../../types/types';

const route = useRoute();
const router = useRouter();
const error = ref<string | null>(null);
const successMessage = ref<string | null>(null);

const interns = ref<Intern[] | null>(null);
const teamleads = ref<Teamlead[] | null>(null);
const stage = ref<Stage | null>(null);

async function getInterns() {
  try {
    const res = await axios.get("/users/interns");
    interns.value = res.data.interns;
    console.log("Interns loaded:", res.data.interns);
  } catch (err: any) {
    console.error(err);
    error.value = err.response?.data.message;
  }
}

async function getTeamleads() {
  try {
    const res = await axios.get("/users/teamleads");
    teamleads.value = res.data.teamleads;
    console.log("Teamleads loaded:", res.data.teamleads);
  } catch (err: any) {
    console.error(err);
    error.value = err.response?.data.message;
  }
}

async function getStage() {
  const stageId = route.params.stageId as string | undefined;
  console.log("Route params:", route.params);
  try {
    console.log(`Fetching stage with id: ${stageId}`);
    const res = await axios.get(`/stages/${stageId}`);
    stage.value = res.data.stage;
    console.log("Stage data received:", res.data.stage);
  } catch (err: any) {
    console.error(err);
    error.value = err.response?.data.message || "Не удалось загрузить этап.";
  }
}

onMounted(async () => {
  await getInterns();
  await getTeamleads();
  await getStage();
});

interface StageForm {
  number: number | undefined;
  name: string | undefined;
  internId: string | undefined;
  teamleadId: string | undefined;
}

const stageForm = reactive<StageForm>({
  number: undefined,
  name: undefined,
  internId: undefined,
  teamleadId: undefined,
});

watch(stage, (newStage) => {
  if (newStage) {
    stageForm.number = newStage.number;
    stageForm.name = newStage.name;
    stageForm.internId = newStage.internId;
    stageForm.teamleadId = newStage.teamleadId;
    console.log("Stage form updated:", stageForm);
  }
});

async function deleteStage() {
  const stageId = route.params.stageId as string | undefined;
  console.log("Deleting stage with id:", stageId);
  if (!stageId) {
    error.value = "Не удалось определить этап для удаления.";
    return;
  }
  if (confirm("Вы уверены, что хотите удалить этот этап? Это действие нельзя отменить.")) {
    try {
      const res = await axios.delete(`/stages/${stageId}`);
      console.log("Stage deleted response:", res.data);
      if (res.status === 200) {
        successMessage.value = "Этап успешно удален!";
        router.push('/control');
      }
    } catch (err: any) {
      error.value = err.response?.data.message ?? "Ошибка при удалении этапа";
      console.error("Error deleting stage:", err.response?.data || err);
    }
  }
}

async function updateStageHandler(e: Event) {
  e.preventDefault();
  error.value = null;
  successMessage.value = null;

  const stageId = route.params.stageId as string | undefined;
  console.log("Updating stage with id:", stageId);
  if (!stageId) {
    error.value = "Не удалось определить этап для обновления.";
    return;
  }

  if (!stageForm.number) {
    return error.value = "Номер этапа обязателен";
  }

  if (!stageForm.name || !stageForm.name.trim()) {
    return error.value = "Название этапа обязательно";
  }

  if (!stageForm.internId) {
    return error.value = "Необходимо выбрать стажёра";
  }

  try {
    const res = await axios.put(`/stages/${stageId}`, {
      number: stageForm.number,
      name: stageForm.name,
      internId: stageForm.internId,
      teamleadId: stageForm.teamleadId,
    });

    if (res.status === 200) {
      successMessage.value = "Этап успешно обновлен!";
    }
  } catch (err: any) {
    error.value = err.response?.data.message ?? "Ошибка при обновлении этапа";
    console.error(err);
  }
}

function cancelHandler() {
  error.value = null;
  successMessage.value = null;
  router.push("/control");
}
</script>

<template>
  <div @click.stop="cancelHandler" class="addStagePage">
    <form @submit.prevent="updateStageHandler" @click.stop class="dark-blue-container">
      <h2>Редактирование этапа</h2>

      <label for="">
        Номер этапа
        <input v-model.number="stageForm.number" type="number" min="1" required>
      </label>

      <label for="">
        Название этапа
        <input v-model="stageForm.name" type="text" required>
      </label>

      <label for="">
        Стажёр
        <div class="custom-select">
          <select v-model="stageForm.internId" required>
            <option :value="null" selected>Не выбрано</option>
            <option v-for="intern in interns" :value="intern.id" :key="intern.id">
              {{ intern.name }} ({{ intern.login }})
            </option>
          </select>
        </div>
      </label>

      <label for="">
        Тимлид
        <div class="custom-select">
          <select v-model="stageForm.teamleadId">
            <option :value="null" selected>Не выбрано</option>
            <option v-for="teamlead in teamleads" :value="teamlead.id" :key="teamlead.id">
              {{ teamlead.name }} ({{ teamlead.login }})
            </option>
          </select>
        </div>
      </label>

      <button type="submit" class="form-btn">Обновить этап</button>
      <button type="button" class="red-btn" @click="deleteStage">Удалить</button>
      <span v-if="error" class="error">{{ error }}</span>
      <span v-if="successMessage" class="success">{{ successMessage }}</span>
    </form>
  </div>
</template>

<style scoped>
.addStagePage {
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
</style>