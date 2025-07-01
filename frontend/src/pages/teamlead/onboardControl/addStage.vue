<script setup lang="ts">
import axios from '../../../utils/axios';
import { onMounted, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { Intern, Stage, Teamlead } from '../../../types/types';
import { eventBus } from '../../../utils/eventBus';

const router = useRouter();
const error = ref<string | null>(null);

const interns = ref<Intern[] | null>(null);
const teamleads = ref<Teamlead[] | null>(null);
const stages = ref<Stage[] | null>(null); // Добавляем этапы для подсчета

async function getInterns() {
  try {
    const res = await axios.get("/users/interns");
    interns.value = res.data.interns;
  } catch (err) {
    console.error(err);
  }
}

async function getTeamleads() {
  try {
    const res = await axios.get("/users/teamleads");
    teamleads.value = res.data.teamleads;
  } catch (err) {
    console.error(err);
  }
}

async function getStages() {
  try {
    const res = await axios.get("/stages");
    stages.value = res.data.stages;
  } catch (err) {
    console.error(err);
  }
}

onMounted(async () => {
  await Promise.all([getInterns(), getTeamleads(), getStages()]);
});

interface StageForm {
  number: number | null;
  name: string | null;
  internId: string | null;
  teamleadId: string | null;
}

const stageForm = reactive<StageForm>({
  number: null,
  name: null,
  internId: null,
  teamleadId: null
});

// Обновление номера этапа при выборе стажера
watch(() => stageForm.internId, (newInternId) => {
  if (newInternId && stages.value) {
    const internStages = stages.value.filter(stage => stage.internId === newInternId);
    stageForm.number = internStages.length + 1;
  } else {
    stageForm.number = null;
  }
});

function cancelHandler() {
  error.value = null;
  router.push("/control");
}

async function createStageHandler(e: Event) {
  e.preventDefault();
  error.value = null;

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
    const res = await axios.post("/stages", {
      number: stageForm.number,
      name: stageForm.name,
      internId: stageForm.internId,
      teamleadId: stageForm.teamleadId
    });

    if (res.status === 201) {
      eventBus.emit('reloadStages');
      router.push("/control");
    }
  } catch (err: any) {
    error.value = err.response?.data.message ?? "Ошибка при создании этапа";
    console.error(err);
  }
}
</script>

<template>
  <div @click.stop="cancelHandler" class="addStagePage">
    <form @submit="createStageHandler" @click.stop class="dark-blue-container">
      <h2>Создание этапа</h2>

      <label for="">
        Номер этапа
        <input v-model.number="stageForm.number" type="number" min="1" required disabled>
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

      <button type="submit" class="form-btn">Создать этап</button>
      <span v-if="error" class="error">{{ error }}</span>
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

.error {
  color: #ff4d4f;
  margin-top: 10px;
}

input:disabled {
  background-color: #333;
  opacity: 0.7;
}
</style>