<script setup lang="ts">
import axios from '../../../utils/axios';
import { onMounted, reactive, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import type { Position } from '../../../types/types';
import { eventBus } from '../../../utils/eventBus';

const route = useRoute();
const router = useRouter();
const error = ref<string | null>(null);
const teamleadId = route.params.id as string;

const positions = ref<Position[] | null>(null);

async function getPositions() {
  try {
    const res = await axios.get("/positions");
    positions.value = res.data.positions;
  } catch (err) {
    console.error(err);
  }
}

interface TeamleadData {
  login: string | null;
  name: string | null;
  email: string | null;
  password: string | null;
  positionId: string | null;
}

const teamlead = reactive<TeamleadData>({
  login: null,
  name: null,
  email: null,
  password: null,
  positionId: null
});

onMounted(async () => {
  await getPositions();

  try {
    const res = await axios.get(`/users/teamleads/${teamleadId}`);
    const data = res.data.teamlead;
    teamlead.login = data.login;
    teamlead.name = data.name;
    teamlead.email = data.email;
    teamlead.positionId = data.position?.id || null; // Извлекаем id из объекта position
    console.log("Loaded teamlead:", teamlead); // Для отладки
  } catch (err) {
    console.error(err);
    error.value = "Не удалось загрузить тимлида";
  }
});

function cancelHandler() {
  error.value = null;
  router.push("/teamleads");
}

async function updateTeamleadHandler(e: Event) {
  e.preventDefault();
  error.value = null;

  if (!teamlead.login || !teamlead.login.trim()) {
    return error.value = "Логин обязателен";
  }

  if (!teamlead.name || !teamlead.name.trim()) {
    return error.value = "Имя обязательно";
  }

  if (!teamlead.email || !teamlead.email.trim()) {
    return error.value = "Почта обязательна";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(teamlead.email)) {
    return error.value = "Некорректный email";
  }

  try {
    const res = await axios.put(`/users/teamleads/${teamleadId}`, teamlead);
    console.log(res.data)
    if (res.status === 200) {
      eventBus.emit('reloadTeamleads');
      router.push("/teamleads");
    }
  } catch (err: any) {
    error.value = err.response?.data.message ?? "Ошибка при обновлении тимлида";
    console.error(err);
  }
}

async function deleteTeamleadHandler() {
  const confirmed = confirm("Вы уверены, что хотите удалить этого тимлида?");
  if (!confirmed) return;

  try {
    const res = await axios.delete(`/users/teamleads/${teamleadId}`);
    if (res.status === 200) {
      router.push("/teamleads");
    }
  } catch (err: any) {
    error.value = err.response?.data.message ?? "Ошибка при удалении тимлида";
    console.error(err);
  }
}
</script>

<template>
  <div @click.stop="cancelHandler" class="updateTeamleadPage">
    <form @submit="updateTeamleadHandler" @click.stop class="dark-blue-container">
      <h2>Изменение тимлида</h2>
      <label>
        Логин
        <input v-model="teamlead.login" type="text" required />
      </label>
      <label>
        Имя
        <input v-model="teamlead.name" type="text" required />
      </label>
      <label>
        Почта
        <input v-model="teamlead.email" type="email" required />
      </label>
      <label>
        Пароль
        <input v-model="teamlead.password" type="password" placeholder="Оставьте пустым, если не меняете" />
      </label>
      <label>
        Должность
        <div class="custom-select">
          <select v-model="teamlead.positionId" required>
            <option :value="null" selected>Не выбрано</option>
            <option v-for="position in positions" :value="position.id" :key="position.id">
              {{ position.name }}
            </option>
          </select>
        </div>
      </label>
      <button type="submit" class="form-btn">Обновить тимлида</button>
      <button type="button" @click="deleteTeamleadHandler" class="red-btn">Удалить</button>
      <span v-if="error" class="error">{{ error }}</span>
    </form>
  </div>
</template>

<style scoped>
.updateTeamleadPage {
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