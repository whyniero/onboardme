<script setup lang="ts">
import axios from '../../../utils/axios';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Position, Teamlead } from '../../../types/types';
import { eventBus } from '../../../utils/eventBus';

const route = useRoute();
const router = useRouter();
const error = ref<string | null>(null);
const internId = route.params.id as string;

const positions = ref<Position[] | null>(null);
const teamleads = ref<Teamlead[] | null>(null);

async function getPositions() {
  try {
    const res = await axios.get("/positions");
    positions.value = res.data.positions;
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

interface InternData {
  login: string | null;
  name: string | null;
  email: string | null;
  password: string | null;
  positionId: string | null;
  mentorId: string | null;
}

const intern = reactive<InternData>({
  login: null,
  name: null,
  email: null,
  password: null,
  positionId: null,
  mentorId: null
});

onMounted(async () => {
  await getPositions();
  await getTeamleads();

  try {
    const res = await axios.get(`/users/interns/${internId}`);
    const data = res.data.intern;
    intern.login = data.login;
    intern.name = data.name;
    intern.email = data.email;
    intern.positionId = data.position?.id || null;
    intern.mentorId = data.mentor?.id || null;
  } catch (err) {
    console.error(err);
    error.value = "Не удалось загрузить стажера";
  }
});

function cancelHandler() {
  error.value = null;
  router.push("/interns");
}

async function updateInternHandler(e: Event) {
  e.preventDefault();
  error.value = null;

  if (!intern.login || !intern.login.trim()) {
    return error.value = "Логин обязателен";
  }

  if (!intern.name || !intern.name.trim()) {
    return error.value = "Имя обязательно";
  }

  if (!intern.email || !intern.email.trim()) {
    return error.value = "Почта обязательна";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(intern.email)) {
    return error.value = "Некорректный email";
  }

  try {
    const res = await axios.put(`/users/interns/${internId}`, intern);
    if (res.status === 200) {
      eventBus.emit('reloadInterns');
      router.push("/interns");
    }
  } catch (err: any) {
    error.value = err.response?.data.message ?? "Ошибка при обновлении стажера";
    console.error(err);
  }
}

async function deleteInternHandler() {
  const confirmed = confirm("Вы уверены, что хотите удалить этого стажера?");
  if (!confirmed) return;

  try {
    const res = await axios.delete(`/users/interns/${internId}`);
    if (res.status === 200) {
      eventBus.emit('reloadInterns');
      router.push("/interns");
    }
  } catch (err: any) {
    error.value = err.response?.data.message ?? "Ошибка при удалении стажера";
    console.error(err);
  }
}
</script>

<template>
  <div @click.stop="cancelHandler" class="updateInternPage">
    <form @submit="updateInternHandler" @click.stop class="dark-blue-container">
      <h2>Изменение стажера</h2>
      <label>
        Логин
        <input v-model="intern.login" type="text" required />
      </label>
      <label>
        Имя
        <input v-model="intern.name" type="text" required />
      </label>
      <label>
        Почта
        <input v-model="intern.email" type="email" required />
      </label>
      <label>
        Пароль
        <input v-model="intern.password" type="password" placeholder="Оставьте пустым, если не меняете" />
      </label>
      <label>
        Должность
        <div class="custom-select">
          <select v-model="intern.positionId" required>
            <option :value="null" selected>Не выбрано</option>
            <option v-for="position in positions" :value="position.id" :key="position.id">
              {{ position.name }}
            </option>
          </select>
        </div>
      </label>
      <label>
        Ментор
        <div class="custom-select">
          <select v-model="intern.mentorId">
            <option :value="null" selected>Не выбрано</option>
            <option v-for="teamlead in teamleads" :value="teamlead.id" :key="teamlead.id">
              {{ teamlead.name }}
            </option>
          </select>
        </div>
      </label>
      <button type="submit" class="form-btn">Обновить стажера</button>
      <button type="button" @click="deleteInternHandler" class="red-btn">Удалить</button>
      <span v-if="error" class="error">{{ error }}</span>
    </form>
  </div>
</template>

<style scoped>
.updateInternPage {
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
  min-width: 200px;
  max-width: 100%;
  padding: 10px 15px;
  border-radius: 15px;
  border: 2px solid transparent;
  background: linear-gradient(#000977, #000977 0) padding-box,
    linear-gradient(to right bottom, #582cff, #5a2cff00, #582cff) border-box;
  color: white;
  font-size: 1em;
  outline: none;
  appearance: none;
  padding-right: 30px;
  cursor: pointer;
}

.custom-select select option {
  color: black;
}
</style>