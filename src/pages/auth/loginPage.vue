<script setup lang="ts">
import { useRouter } from 'vue-router';
import axios from '../../utils/axios';
import { reactive, ref } from 'vue';
import { useUserStore } from '../../stores/user';


interface LoginData {
  login: string | null;
  password: string | null;
}

const loginData = reactive<LoginData>({
  login: null,
  password: null
})

const userStore = useUserStore()

const router = useRouter()
const error = ref<string | null>(null)

async function loginHandler(e: Event) {
  e.preventDefault()
  error.value = null
  try {
    const res = await axios.post("/auth/login", loginData)
    if (res.status === 201 || res.status === 200) {
      userStore.setUser(res.data.user)
      router.push("/")
    }
    console.log(res.data)
  } catch (err: any) {
    error.value = err.response?.data.message ?? "Ошибка при авторизации"
    console.error(err)
  }
}

</script>

<template>
  <div class="loginPage">
    <div class="left"></div>
    <div class="right">
      <h1>Добро пожаловать на OnboardMe!</h1>
      <form @submit="loginHandler">
        <label for="">
          Логин
          <input v-model="loginData.login" type="text" placeholder="Введите свой логин">
        </label>
        <label for="">
          Пароль
          <input v-model="loginData.password" type="password" placeholder="Введите свой пароль">
        </label>
        <span v-if="error" class="eror">{{ error }}</span>
        <button type="submit" class="light-blue-btn">Войти</button>
      </form>
    </div>
  </div>
</template>
<style scoped>
.loginPage {
  width: 100%;
  display: flex;
}

.left,
.right {
  width: 50%;
  height: 100%;
}

.left {
  background-image: url("/img/login_back.jpg");
  background-size: cover;
}

.right {
  background: linear-gradient(to left top, #00021C, #000977);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 10%;
  gap: 20px;
}

form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
}

form label {
  display: flex;
  flex-direction: column;
}

form button {
  margin-top: 20px;
  height: 50px;
  align-self: center;
  width: 100%;
}
</style>