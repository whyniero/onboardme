<script setup lang="ts">
import { onMounted, ref } from 'vue';
import ApexChart from 'vue3-apexcharts';
import TextCard from '../../../ui/TextCard.vue';
import EditIcon from '../../../assets/icons/edit.svg';
import type { Intern } from '../../../types/types';
import axios from '../../../utils/axios';
import { useRoute } from 'vue-router';

interface User {
  name: string;
  avatar: string;
  value: number;
}

const users: User[] = [
  {
    name: 'Алексей',
    avatar: 'https://example.com/alex.png',
    value: 3
  },
  {
    name: 'Мария',
    avatar: 'https://example.com/maria.png',
    value: 2
  },
  {
    name: 'Иван',
    avatar: 'https://example.com/ivan.png',
    value: 1
  }
]

const route = useRoute();
const error = ref<string | null>(null);
const intern = ref<Intern | null>(null);

async function getInternHandler() {
  const id = route.params.id;
  try {
    if (typeof id !== "string") {
      throw new Error("Недопустимый тип ID!");
    }
    const res = await axios.get(`/users/interns/${id}`);
    intern.value = res.data.intern;
    if (!intern.value) {
      throw new Error("Не удалось получить стажера");
    }
  } catch (err: any) {
    console.error(err);
    error.value = err.response?.data.message ?? "Не удалось получить стажера";
  }
}

onMounted(() => {
  getInternHandler();
});

const activityOptions = ref({
  chart: {
    toolbar: { show: false },
    fontFamily: 'Jost',
    type: 'bar'
  },
  tooltip: {
    theme: 'dark',
    style: {
      fontSize: '1em',
      fontFamily: 'Jost, Inter, sans-serif',
    },
  },
  xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], labels: { style: { colors: '#fff' } } },
  yaxis: { labels: { style: { colors: '#fff' } } },
  colors: ['#7B61FF'],
});
const activitySeries = ref([{ name: 'Активность', data: [4, 5, 3, 2, 4, 1, 5] }]);

const stagesOptions = ref({
  chart: {
    toolbar: { show: false },
    fontFamily: 'Jost',
    type: 'bar'
  },
  tooltip: {
    theme: 'dark',
    style: {
      fontSize: '1em',
      fontFamily: 'Jost, Inter, sans-serif',
    },
  },
  xaxis: { show: false },
  yaxis: { categories: ['Введение', 'Настройка окружения', 'Этап 3', 'Этап 4', 'Этап 5'], labels: { style: { colors: '#fff' } } },
  colors: ['#7B61FF'],
  plotOptions: { bar: { horizontal: true } },
});
const stagesSeries = ref([{ name: 'Прогресс', data: [3.3, 12.7, 15.2, 25.3, 33.5] }]);

const timeOptions = ref({
  chart: {
    toolbar: { show: false },
    fontFamily: 'Jost',
    type: 'line'
  },
  tooltip: {
    theme: 'dark',
    style: {
      fontSize: '1em',
      fontFamily: 'Jost, Inter, sans-serif',
    },
  },
  xaxis: { categories: [1, 2, 3, 4, 5, 6, 7, 8, 9], labels: { style: { colors: '#fff' } } },
  yaxis: { labels: { style: { colors: '#fff' } } },
  stroke: { curve: 'smooth' },
  colors: ['#7B61FF'],
});
const timeSeries = ref([{ name: 'Время', data: [2, 3, 4, 2, 3, 4, 5, 4, 3] }]);

const avgTimeOptions = ref({
  chart: {
    type: 'bar',
    toolbar: { show: false },
    fontFamily: 'Jost',
  },
  xaxis: {
    categories: users.map((_, i) => i),
    labels: {
      useHTML: true,
      formatter: (_: any, i: number) => {
        const user = users[i];
        return user ? `<img src="${user.avatar}" title="${user.name}" style="width:30px;height:30px;border-radius:50%;" />` : '';
      },
      style: {
        colors: '#fff',
      }
    }
  },
  tooltip: {
    x: {
      formatter: (_: any, { dataPointIndex }: { dataPointIndex: number }) => {
        const user = users[dataPointIndex];
        return user ? user.name : '';
      }
    }
  }
});
const avgTimeSeries = ref([{ name: 'Среднее время', data: users.map(u => u.value) }]);

const tasksSeries = ref([72]);
const tasksOptions = ref({
  chart: {
    toolbar: { show: false },
    fontFamily: 'Jost',
    type: 'radialBar',
    offsetY: -20,
    sparkline: { enabled: true },
  },
  plotOptions: {
    radialBar: {
      startAngle: -90,
      endAngle: 90,
      track: {
        background: '#E0E0E0',
        strokeWidth: '100%',
        margin: 5
      },
      hollow: {
        margin: 0,
        size: '60%',
      },
      dataLabels: {
        name: { show: false },
        value: {
          color: 'white',
          offsetY: -10,
          fontSize: '24px',
          fontWeight: 700,
          formatter: (val: number) => `${val}%`
        }
      }
    }
  },
  fill: { colors: ['#7B61FF'] },
  stroke: { lineCap: 'round' },
  labels: ['Progress']
});
</script>


<template>
  <div class="internProfilePage">
    <div v-if="intern" class="edit-profile dark-blue-container">
      <div class="profile">
        <img :src="intern.avatar || '/img/noimage.jpg'" :alt="intern.name" />
        <div class="names">
          <div class="name">
            {{ intern.name }}
            <TextCard :color="intern.position?.color" :text="intern.position?.name" />
            <TextCard color="#adff2f" :text="intern.role" />
          </div>
          <div class="login">{{ intern.login }}</div>
        </div>
      </div>
      <button class="edit">
        <EditIcon />
      </button>
    </div>

    <div class="statistics-grid">
      <div class="chart-container activity dark-blue-container">
        <h4>Активность</h4>
        <ApexChart type="bar" width="100%" height="300px" :options="activityOptions" :series="activitySeries" />
      </div>
      <div class="chart-container stages dark-blue-container">
        <h4>Этапы</h4>
        <ApexChart type="bar" width="100%" height="300px" :options="stagesOptions" :series="stagesSeries" />
      </div>
      <div class="chart-container tasks dark-blue-container">
        <div class="stats">
          <p>Всего задач: <strong>34</strong></p>
          <p>Выполнено: <strong>26</strong></p>
        </div>
        <ApexChart type="radialBar" width="100%" height="300px" :options="tasksOptions" :series="tasksSeries" />
      </div>
      <div class="time dark-blue-container">
        <h4>Время выполнения задач</h4>
        <ApexChart type="line" width="100%" height="300px" :options="timeOptions" :series="timeSeries" />
      </div>
      <div class="chart-container avg-time dark-blue-container">
        <h4>Среднее время выполнения задач</h4>
        <ApexChart type="bar" width="100%" height="300px" :options="avgTimeOptions" :series="avgTimeSeries" />
      </div>
    </div>
  </div>
</template>


<style scoped>
.internProfilePage {
  width: 100%;
}

.statistics-grid {
  margin-top: 12px;
  display: grid;
  grid-template-areas:
    'activity stages stages tasks'
    'time time avgTime avgTime';
  grid-template-columns: repeat(4, 1fr);
  grid-template-rows: auto auto;
  gap: 12px;
}

.activity {
  grid-area: activity;
}

.stages {
  grid-area: stages;
}

.tasks {
  grid-area: tasks;
}

.time {
  grid-area: time;
}

.avg-time {
  grid-area: avgTime;
}

.edit-profile {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
}

.profile {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  font-size: 1.15em;
}

.profile .login {
  font-size: 0.9em;
  color: var(--textСolorGray);
}

.profile img {
  width: 80px;
  height: 80px;
  border-radius: 15px;
}

.profile .name {
  display: flex;
  align-items: center;
  gap: 15px;
}

.edit {
  background-color: var(--colorBlue);
  width: 32px;
  height: 32px;
  border-radius: 5px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px;
  cursor: pointer;
}

.edit svg {
  color: white;
  width: 18px;
}
</style>