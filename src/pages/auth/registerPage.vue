<script setup lang="ts">
import axios from '../../utils/axios';
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const error = ref<string | null>(null);

interface RegisterForm {
  login: string;
  email: string;
  name: string;
  password: string;
  secretKey: string;
}

const form = reactive<RegisterForm>({
  login: '',
  email: '',
  name: '',
  password: '',
  secretKey: ''
});

async function handleSubmit(e: Event) {
  e.preventDefault();
  error.value = null;

  // Валидация полей
  if (!form.login.trim()) {
    return error.value = "Логин обязателен";
  }

  if (!form.name.trim()) {
    return error.value = "Имя обязательно";
  }

  if (!form.email.trim()) {
    return error.value = "Почта обязательна";
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    return error.value = "Некорректный email";
  }

  if (!form.password || form.password.length < 6) {
    return error.value = "Пароль должен быть не менее 6 символов";
  }

  if (!form.secretKey.trim()) {
    return error.value = "Секретный ключ обязателен";
  }

  try {
    const response = await axios.post('/auth/register', form);
    
    if (response.status === 201) {
      // После успешной регистрации перенаправляем на страницу входа
      router.push('/login');
    }
  } catch (err: any) {
    error.value = err.response?.data.message ?? "Ошибка при регистрации";
    console.error(err);
  }
}
</script>

<template>
  <div class="registerPage">
    <div class="left"></div>
    <div class="right">
      <h1>Добро пожаловать на OnboardMe!</h1>
      <form @submit="handleSubmit">
        <label>
          Логин
          <input 
            v-model="form.login" 
            type="text" 
            placeholder="Введите свой логин"
            required
          >
        </label>
        <label>
          Почта
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="Введите свою почту"
            required
          >
        </label>
        <label>
          Имя
          <input 
            v-model="form.name" 
            type="text" 
            placeholder="Введите свое имя"
            required
          >
        </label>
        <label>
          Пароль
          <input 
            v-model="form.password" 
            type="password" 
            placeholder="Введите свой пароль"
            required
            minlength="6"
          >
        </label>
        <label>
          Секретный ключ
          <input 
            v-model="form.secretKey" 
            type="password" 
            placeholder="Введите секретный ключ"
            required
          >
        </label>
        <button type="submit" class="light-blue-btn">Зарегистрироваться</button>
        <span v-if="error" class="error">{{ error }}</span>
      </form>
    </div>
  </div>
</template>

<style scoped>
.registerPage {
  width: 100%;
  display: flex;
  height: 100vh;
}

.left,
.right {
  width: 50%;
  height: 100%;
}

.left {
  background-image: url("/img/login_back.jpg");
  background-size: cover;
  background-position: center;
}

.right {
  background: linear-gradient(to left top, #00021C, #000977);
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 8%;
  gap: 20px;
  color: white;
}

h1 {
  font-size: 2rem;
  margin-bottom: 2rem;
}

form {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  width: 100%;
}

form label {
  display: flex;
  flex-direction: column;
}
button {
  margin: 20px;
}

</style>