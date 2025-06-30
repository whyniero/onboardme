<script setup lang="ts">
import router from '../../../router';
import TextCard from '../../../ui/TextCard.vue';
import EditIcon from "../../../assets/icons/edit.svg"
import ChatIcon from "../../../assets/icons/chat.svg"
import { RouterLink } from 'vue-router';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { Intern } from '../../../types/types';
import axios from '../../../utils/axios';
import Loader from '../../../components/Loader.vue';
import { eventBus } from '../../../utils/eventBus';


// const interns = [
//   {
//     id: 1,
//     login: "alex",
//     avatar: "https://images.pexels.com/photos/32412580/pexels-photo-32412580.jpeg",
//     name: "Алексей",
//     surname: "Алексеев",
//     position: "Frontend Junior",
//     role: "Стажер",
//     status: "Online",
//     progress: "55%",
//     currentStage: "Этап 1",
//     mentor: "Олег Олегов",
//     startDate: "12.03.2025",
//     endDate: "20.03.2025"
//   },
//   {
//     id: 2,
//     login: "alex",
//     avatar: "https://images.pexels.com/photos/32412580/pexels-photo-32412580.jpeg",
//     name: "Алексей",
//     surname: "Алексеев",
//     position: "Frontend Junior",
//     role: "Стажер",
//     status: "Online",
//     progress: "55%",
//     currentStage: "Этап 1",
//     mentor: "Олег Олегов",
//     startDate: "12.03.2025",
//     endDate: "20.03.2025"
//   },
//   {
//     id: 3,
//     login: "alex",
//     avatar: "https://images.pexels.com/photos/32412580/pexels-photo-32412580.jpeg",
//     name: "Алексей",
//     surname: "Алексеев",
//     position: "Frontend Junior",
//     role: "Стажер",
//     status: "Online",
//     progress: "55%",
//     currentStage: "Этап 1",
//     mentor: "Олег Олегов",
//     startDate: "12.03.2025",
//     endDate: "20.03.2025"
//   },
//   {
//     id: 4,
//     avatar: "https://images.pexels.com/photos/32412580/pexels-photo-32412580.jpeg",
//     login: "alex",
//     name: "Алексей",
//     surname: "Алексеев",
//     position: "Frontend",
//     role: "Стажер",
//     status: "Online",
//     progress: "55%",
//     currentStage: "Этап 1",
//     mentor: "Олег Олегов",
//     startDate: "12.03.2025",
//     endDate: "20.03.2025"
//   },
// ]

const interns = ref<Intern[] | null>(null)
const error = ref<string | null>(null)
const isLoading = ref<boolean>(true)



async function getInternsHandler() {
  try {
    const res = await axios.get("/users/interns")
    interns.value = res.data.interns
  } catch (err) {
    console.error(err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await getInternsHandler()
  eventBus.on('reloadInterns', getInternsHandler);
})

onBeforeUnmount(() => {
  eventBus.off('reloadInterns', getInternsHandler);
})

const linkToIntern = (id: string) => {
  router.push(`/interns/${id}`)
}

</script>
<template>
  <div class="internsPage dark-blue-container">
    <h2>Стажеры/Новые разработчики</h2>
    <div class="buttons">
      <RouterLink to="/interns/add">
        <button class="add">Добавить стажера</button>
      </RouterLink>
      <button class="statistics">Общая статистика</button>
    </div>
    <span v-if="error" class="error">{{ error }}</span>
    <table class="interns-table">
      <thead>
        <tr>
          <th class="">Сотрудник</th>
          <th class="">Должность</th>
          <th class="">Роль</th>
          <th class="">Статус</th>
          <th class="">Прогресс</th>
          <th class="">Текущий этап</th>
          <th class="">Наставник</th>
          <th class="">Дата начала</th>
          <th class="">Изменить</th>
        </tr>
      </thead>
      <tbody>
        <Loader v-if="isLoading" />
        <tr v-else v-for="intern in interns" :key="intern.id" class="intern" @click="linkToIntern(intern.id)">
          <td class="profile">
            <img :src="intern.avatar || '/img/noimage.jpg'" :alt="intern.name">
            <div class="names">
              <span>{{ intern.name }}</span>
              <span>{{ intern.login }}</span>
            </div>
          </td>
          <td class="textcard">
            <TextCard :color="intern.position?.color" :text="intern.position?.name" />
          </td>
          <td class="textcard">
            <TextCard color="#adff2f" text="Стажер" />

          </td>
          <td class="">
            <!-- {{ intern.status || "none" }} -->
          </td>
          <td class="progress">
            <!-- <div class="progress-bar">
              <div :style="{ width: intern.progress + '%' }" class="progress-fill"></div>
            </div> -->
            <!-- {{ intern.progress || "none" }}% -->
          </td>
          <td class="">
            <!-- {{ intern.currentStage || "none" }} -->
          </td>
          <td class="">
            {{ intern.teamlead?.name }}
          </td>
          <td class="">
            <!-- {{ intern.startDate || "none" }} -->
          </td>
          <td class="interactions">
            <RouterLink @click.stop :to="`/chats/userId`">
              <button class="icon">
                <ChatIcon />
              </button>
            </RouterLink>
            <RouterLink @click.stop :to="`/interns/update/${intern.id}`">
              <button class="icon">
                <EditIcon />
              </button>
            </RouterLink>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

</template>

<style scoped>
.internsPage {
  overflow-y: auto;
  max-height: calc(100vh - 24px);
}

.buttons {
  padding-top: 20px;
  display: flex;
  justify-content: flex-start;
  gap: 10px;
}

.buttons button {
  cursor: pointer;
  padding: 5px 10px;
  border-radius: 15px;
  color: white;
}

.buttons .add,
.buttons .statistics {
  padding: 8px 18px;
  border-radius: 2em;
  font-weight: 400;
}

.statistics {
  background-color: blue;
}

.add {
  background-color: var(--colorGreen);
}

.interns-table {
  border-collapse: collapse;
  margin: 0;
  width: 100%;
  font-size: 0.9em;
  margin: 25px 0;
}

.interns-table thead tr {
  color: var(--textColorLightGray);
}

.interns-table thead th {
  font-weight: 400;
  text-align: left;
}

.interns-table th,
.interns-table td {
  padding: 1em 1.1em;
}

.interns-table tbody tr {
  border-top: 1px solid var(--colorBlue);
}

.intern {
  cursor: pointer;
}

.intern:hover {
  background: rgba(128, 128, 128, 0.127);
}

.names {
  display: flex;
  flex-direction: column;
}

.profile img {
  flex-shrink: 0;
  width: 2.7em;
  height: 2.7em;
  border-radius: 50%;
}



.profile {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 30px;
  height: 30px;
  border-radius: 50%;
}

.status-online {
  background-color: #00cc00;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: default;
}

.progress-bar {
  width: 100px;
  height: 10px;
  background-color: #333;
  border-radius: 5px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: #5470c6;
  border-radius: 5px;
  transition: width 0.3s;
}

.interactions {
  flex-shrink: 0;
  min-width: 100px;
}

.interactions button {
  cursor: pointer;
  padding: 4px;
  width: 2em;
  height: 2em;
  background-color: var(--colorBlue);
  border-radius: 0.5em;
  transition: .2s background-color ease;
}

.interactions button:hover {
  background-color: white;
}

.icon svg {
  width: 1.4em;
  color: white;
  transition: .2s color ease;
}

.interactions button:hover svg {
  color: var(--colorBlue);
}

.interactions button:nth-child(1) {
  margin-right: 8px;
}




.textcard {
  font-size: 0.9em;
}


@media (max-width: 1400px) {
  .textcard {
    font-size: 0.8em;
  }
}
</style>