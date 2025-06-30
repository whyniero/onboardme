<script setup lang="ts">
import HomeIcon from "../assets/icons/home.svg"
import PeopleIcon from "../assets/icons/people.svg"
import ChatIcon from "../assets/icons/chat.svg"
import PositionsIcon from "../assets/icons/positions.svg"
import OnboardingIcon from "../assets/icons/onboarding.svg"
import ControlIcon from "../assets/icons/control.svg"
import { useRoute, useRouter } from "vue-router"
import { computed, ref } from "vue"
import { useUserStore } from "../stores/user"
import axios from "../utils/axios"

const hrLinks = [
  {
    id: 1,
    content: "Главная",
    icon: HomeIcon,
    path: "/"
  },
  {
    id: 6,
    content: "Тимлиды",
    icon: PeopleIcon,
    path: "/teamleads"
  },
  {
    id: 5,
    content: "Должности",
    icon: PositionsIcon,
    path: "/positions"
  },
  {
    id: 3,
    content: "Чат",
    icon: ChatIcon,
    path: "/chats"
  },
  {
    id: 2,
    content: "Стажеры",
    icon: PeopleIcon,
    path: "/interns"
  },
  {
    id: 4,
    content: "Управление Онбордингами",
    icon: ControlIcon,
    path: "/control"
  },
]

const teamleadLinks = [
  {
    id: 1,
    content: "Главная",
    icon: HomeIcon,
    path: "/"
  },
  {
    id: 2,
    content: "Стажеры",
    icon: PeopleIcon,
    path: "/interns"
  },
  {
    id: 3,
    content: "Чат",
    icon: ChatIcon,
    path: "/chats"
  },
  {
    id: 4,
    content: "Управление Онбордингами",
    icon: ChatIcon,
    path: "/control"
  },
]

const internLinks = [
  {
    id: 1,
    content: "Главная",
    icon: HomeIcon,
    path: "/"
  },
  {
    id: 2,
    content: "Онбординг",
    icon: OnboardingIcon,
    path: "/stages"
  },
  {
    id: 3,
    content: "Чат",
    icon: ChatIcon,
    path: "/chats"
  },
]

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()
const currentUser = userStore.currentUser
const error = ref<string | null>(null)

// Определяем ссылки в зависимости от роли пользователя
const links = computed(() => {
  switch (currentUser?.role) {
    case "HR":
      return hrLinks
    case "TEAMLEAD":
      return teamleadLinks
    case "INTERN":
      return internLinks
  }
})


// Текущий путь из маршрута
const currentPath = computed(() => route.path)

// Обрезанный путь
const basePath = computed((): string => {
  const pathEnd = currentPath.value.indexOf("/", 1)
  if (pathEnd === -1) return currentPath.value
  return currentPath.value.slice(0, pathEnd)
})

// Активен ли url которые соответствует нажатой кнопке в сайдбаре
const isActive = (path: string): boolean => {
  const baseLinkPath = path.indexOf("/", 1) === -1 ? path : path.slice(0, path.indexOf("/", 1))
  return baseLinkPath === basePath.value
}

async function logoutHandler() {
  error.value = null
  try {
    const res = await axios.post("/auth/logout")
    if (res.status === 200 || res.status === 201) {
      userStore.logout()
      router.push("/login")
    }
  } catch (err: any) {
    console.error(err)
    error.value = err.response?.data.message ?? "Ошибка при выходе из аккаунты"
  }
}
</script>
<template>
  <div class="sidebar container">
    <div class="logo">
      OnboardMe
    </div>
    <div class="links-container">
      <RouterLink v-for="link in links" :to="link.path" :key="link.id" class="link"
        :class="{ active: isActive(link.path) }">
        <div class="icon">
          <component :is="link.icon" class="svg-icon" />
        </div>
        <p>{{ link.content }}</p>
      </RouterLink>
    </div>
    <span class="logout-link" @click="logoutHandler">Выйти</span>
    <span v-if="error" class="error">{{ error }}</span>
  </div>
</template>

<style scoped>
.sidebar {
  margin: 12px 0 12px 12px;
  padding: 12px;
  min-width: 280px;
  max-width: 280px;
  min-height: 0;
  flex: 1;
  background: linear-gradient(to right, rgb(0, 2, 28), rgb(0, 2, 28, 0.8), rgb(0, 2, 28, 0.5));
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  border-radius: 15px;
}

.logout-link {
  cursor: pointer;
}

.logout-link:hover {
  text-decoration: underline;
}

.logo {
  flex-shrink: 0;
  font-size: 2rem;
  font-weight: 400;
  padding: 20px;
}

.logo::after {
  content: '';
  display: block;
  height: 2px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0), white, rgba(255, 255, 255, 0));
  width: 100%;
}

.links-container {
  width: 100%;
  flex: 1;
}

.links-container .link {
  width: 100%;
  padding: 12px;
  gap: 8px;
  display: flex;
  align-items: center;
  color: #fff;
  text-decoration: none;
  background: transparent;
  border-radius: 15px;
}



.link:hover {
  background: var(--hoverColor);
}

.link .icon {
  width: 42px;
  height: 42px;
  background: #1A1F37;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.svg-icon {
  width: 30px;
  height: 30px;
  padding: 4px;
  color: var(--colorBlue);
}

.link p {
  font-size: 1rem;
  margin: 0;
}

.link.active {
  background: linear-gradient(to right bottom, rgba(135, 138, 174, 0.4), rgba(135, 138, 174, 0.1) 80%, transparent);
}

.link.active .icon {
  background: var(--colorBlue);
}

.link.active .icon .svg-icon {
  color: #1A1F37;
}

@media (max-width: 1400px) {
  .sidebar {
    min-width: 240px;
  }
}
</style>