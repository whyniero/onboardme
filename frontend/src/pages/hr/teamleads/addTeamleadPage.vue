<script setup lang="ts">
import axios from '../../../utils/axios';
import { onMounted, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import type { Position } from '../../../types/types';

const router = useRouter();
const error = ref<string | null>(null);
const positions = ref<Position[] | null>(null);

async function getPositions() {
  try {
    const res = await axios.get("/positions");
    positions.value = res.data.positions;
  } catch (err) {
    console.error(err);
  }
}

onMounted(async () => await getPositions());

interface RegisterTeamleadBody {
  login: string | null;
  name: string | null;
  email: string | null;
  password: string | null;
  positionId: string | null;
}

const registerTeamlead = reactive<RegisterTeamleadBody>({
  login: null,
  name: null,
  email: null,
  password: null,
  positionId: null,
});

function cancelHandler() {
  error.value = null;
  router.push("/teamleads");
}

async function addTeamleadHandler(e: Event) {
  e.preventDefault();
  error.value = null;

  if (!registerTeamlead.login || !registerTeamlead.login.trim()) {
    return error.value = "Логин обязателен";
  }

  if (!registerTeamlead.name || !registerTeamlead.name.trim()) {
    return error.value = "Имя обязательно";
  }

  if (!registerTeamlead.email || !registerTeamlead.email.trim()) {
    return error.value = "Почта обязательна";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(registerTeamlead.email)) {
    return error.value = "Некорректный email";
  }

  if (!registerTeamlead.password || registerTeamlead.password.length < 6) {
    return error.value = "Пароль должен быть не менее 6 символов";
  }

  try {
    const res = await axios.post("/users/teamleads", registerTeamlead);
    if (res.status === 201 || res.status === 200) {
      router.push("/teamleads");
    }
  } catch (err: any) {
    error.value = err.response?.data.message ?? "Ошибка при регистрации тимлида";
    console.error(err);
  }
}
</script>

<template>
  <div @click.stop="cancelHandler" class="addTeamleadPage">
    <form @submit="addTeamleadHandler" @click.stop class="dark-blue-container">
      <h2>Добавление тимлида</h2>

      <label>
        Логин
        <input v-model="registerTeamlead.login" type="text" required />
      </label>

      <label>
        Имя
        <input v-model="registerTeamlead.name" type="text" required />
      </label>

      <label>
        Почта
        <input v-model="registerTeamlead.email" type="email" required />
      </label>

      <label>
        Пароль
        <input v-model="registerTeamlead.password" type="password" required />
      </label>

      <label>
        Должность
        <div class="custom-select">
          <select v-model="registerTeamlead.positionId" required>
            <option :value="null">Не выбрано</option>
            <option v-for="position in positions" :key="position.id" :value="position.id">{{ position.name }}</option>
          </select>
        </div>
      </label>

      <button type="submit" class="form-btn">Зарегистрировать тимлида</button>
      <span v-if="error" class="error">{{ error }}</span>
    </form>
  </div>
</template>

<style scoped>
.addTeamleadPage {
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
