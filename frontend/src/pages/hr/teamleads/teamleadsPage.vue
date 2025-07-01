<script setup lang="ts">
import router from '../../../router';
import TextCard from '../../../ui/TextCard.vue';
import EditIcon from "../../../assets/icons/edit.svg"
import ChatIcon from "../../../assets/icons/chat.svg"
import { RouterLink } from 'vue-router';
import { onBeforeUnmount, onMounted, ref } from 'vue';
import axios from '../../../utils/axios';
import Loader from '../../../components/Loader.vue';
import { eventBus } from '../../../utils/eventBus';

// Определение типов на основе контроллера
interface Position {
  id: string;
  name: string;
  color: string;
}

interface ResponsibleFor {
  id: string;
  name: string;
}

interface Teamlead {
  id: string;
  login: string;
  email: string;
  name: string;
  avatar?: string | null;
  lastOnline?: Date | null;
  createdAt: Date;
  position: Position | null;
  role: "TEAMLEAD";
  responsibleFor: ResponsibleFor[] | null;
}

const teamleads = ref<Teamlead[] | null>(null)
const error = ref<string | null>(null)
const isLoading = ref<boolean>(true)

async function getTeamleadsHandler() {
  try {
    const res = await axios.get("/users/teamleads")
    teamleads.value = res.data.teamleads
    console.log("Teamleads fetched:", teamleads.value) // Для отладки
  } catch (err) {
    console.error(err)
    error.value = "Ошибка при загрузке тимлидов"
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await getTeamleadsHandler()
  eventBus.on('reloadTeamleads', getTeamleadsHandler);
})

onBeforeUnmount(() => {
  eventBus.off('reloadTeamleads', getTeamleadsHandler);
})

const linkToTeamlead = (id: string) => {
  router.push(`/teamleads/${id}`)
}
</script>

<template>
  <div class="teamleadsPage dark-blue-container">
    <h2>Тимлиды</h2>
    <div class="buttons">
      <RouterLink to="/teamleads/add">
        <button class="add">Добавить</button>
      </RouterLink>
    </div>
    <span v-if="error" class="error">{{ error }}</span>
    <table class="teamleads-table">
      <thead>
        <tr>
          <th class="">Сотрудник</th>
          <th class="">Должность</th>
          <th class="">Роль</th>
          <th class="">Статус</th>
          <th class="">Подопечные</th>
          <th class="">Дата регистрации</th>
          <th class="">Изменить</th>
        </tr>
      </thead>
      <tbody>
        <Loader v-if="isLoading" />
        <tr v-else v-for="teamlead in teamleads" :key="teamlead.id" class="teamlead"
          @click="linkToTeamlead(teamlead.id)">
          <td class="profile">
            <img :src="teamlead.avatar || '/img/noimage.jpg'" :alt="teamlead.name">
            <div class="names">
              <span>{{ teamlead.name }}</span>
              <span>{{ teamlead.login }}</span>
            </div>
          </td>
          <td class="textcard">
            <TextCard :color="teamlead.position?.color" :text="teamlead.position?.name" />
          </td>
          <td class="textcard">
            <TextCard color="#ffa500" text="Тимлид" />
          </td>
          <td class="status">
            <button class="status-online"
              v-if="teamlead.lastOnline && new Date(teamlead.lastOnline) > new Date(Date.now() - 5 * 60 * 1000)">
              Online
            </button>
            <button class="status-offline" v-else>
              Offline
            </button>
          </td>
          <td class="">
            {{ teamlead.responsibleFor?.length || 0 }}
          </td>
          <td class="">
            {{ new Date(teamlead.createdAt).toLocaleDateString() }}
          </td>
          <td class="interactions">
            <RouterLink @click.stop :to="`/chats/${teamlead.id}`">
              <button class="icon">
                <ChatIcon />
              </button>
            </RouterLink>
            <RouterLink @click.stop :to="`/teamleads/update/${teamlead.id}`">
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
/* .teamleadsPage {
 
} */

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

.teamleads-table {
   overflow-y: auto;
  max-height: calc(100vh - 24px);
  border-collapse: collapse;
  margin: 0;
  width: 100%;
  font-size: 0.9em;
  margin: 25px 0;
}

.teamleads-table thead tr {
  color: var(--textColorLightGray);
}

.teamleads-table thead th {
  font-weight: 400;
  text-align: left;
}

.teamleads-table th,
.teamleads-table td {
  padding: 1em 1.1em;
}

.teamleads-table tbody tr {
  border-top: 1px solid var(--colorBlue);
}

.teamlead {
  cursor: pointer;
}

.teamlead:hover {
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

.status-online {
  background-color: #00cc00;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: default;
}

.status-offline {
  background-color: #cc0000;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: default;
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