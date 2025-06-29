<script setup lang="ts">
import axios from '../../../utils/axios';
import { onMounted, reactive, ref } from 'vue';
import { onBeforeRouteUpdate, useRouter } from 'vue-router';
import type { Position, Teamlead } from '../../../types/types';

const router = useRouter()
const error = ref<string | null>(null)

const positions = ref<Position[] | null>(null)
const teamleads = ref<Teamlead[] | null>(null)

async function getPositions() {
  try {
    const res = await axios.get("/positions");
    positions.value = res.data.positions;

  } catch (err) {
    console.error(err)
  }
}

async function getTeamleads() {
  try {
    const res = await axios.get("/users/teamleads");
    console.log(res.data)
    teamleads.value = res.data.teamleads;

  } catch (err) {
    console.error(err)
  }
}

onMounted(async () => {
  await getPositions()
  await getTeamleads()
})


interface RegisterBody {
  login: string | null;
  name: string | null;
  email: string | null;
  password: string | null;
  positionId: string | null;
  mentorId: string | null;
}

const registerIntern = reactive<RegisterBody>({
  login: null,
  name: null,
  email: null,
  password: null,
  positionId: null,
  mentorId: null
})

function cancelHandler() {
  error.value = null
  router.push("/interns")
}

async function addInternHandler(e: Event) {
  e.preventDefault()
  error.value = null

  if (!registerIntern.login || !registerIntern.login.trim()) {
    return error.value = "Логин обязателен";
  }

  if (!registerIntern.name || !registerIntern.name.trim()) {
    return error.value = "Имя обязательно";
  }

  if (!registerIntern.email || !registerIntern.email.trim()) {
    return error.value = "Почта обязательна";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(registerIntern.email)) {
    return error.value = "Некорректный email";
  }

  if (!registerIntern.password || registerIntern.password.length < 6) {
    return error.value = "Пароль должен быть не менее 6 символов";
  }

  try {
    const res = await axios.post("/users/interns", registerIntern)
    if (res.status === 201 || res.status === 200) {
      router.push("/interns")
    }
  } catch (err: any) {
    error.value = err.response?.data.message ?? "Ошибка при регистрации стажера"
    console.error(err)
  }
}

</script>
<template>
  <div @click.stop="cancelHandler" class="addInternPage">
    <form @submit="addInternHandler" @click.stop action="" class="dark-blue-container">
      <h2>Добавление стажера</h2>
      <label for="">
        Логин
        <input v-model="registerIntern.login" type="text" required>
      </label>
      <label for="">
        Имя
        <input v-model="registerIntern.name" type="text" required>
      </label>
      <label for="">
        Почта
        <input v-model="registerIntern.email" type="email" required>
      </label>
      <label for="">
        Пароль
        <input v-model="registerIntern.password" type="password" required>
      </label>
      <label for="">
        Должность
        <div class="custom-select">
          <select v-model="registerIntern.positionId" name="position" required>
            <option :value="null" selected>Не выбрано</option>
            <option v-for="position in positions" :value="position.id" :key="position.id">{{ position.name }}</option>
          </select>
        </div>
      </label>
      <label for="">
        Ментор
        <div class="custom-select">
          <select v-model="registerIntern.mentorId" name="teamlead">
            <option :value="null" selected>Не выбрано</option>
            <option v-for="teamlead in teamleads" :value="teamlead.id" :key="teamlead.id">{{ teamlead.name }}</option>
          </select>
        </div>
      </label>
      <button type="submit" class="form-btn">Зарегистрировать стажера</button>
      <span v-if="error" class="error">{{ error }}</span>
    </form>
  </div>
</template>

<style scoped>
.addInternPage {
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

button {
  margin-top: 20px;
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
  -webkit-appearance: none;
  -moz-appearance: none;
  padding-right: 30px;
  cursor: pointer;
}

.custom-select select option {
  color: black;
}

</style>