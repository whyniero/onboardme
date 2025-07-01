<script setup lang="ts">
import { ref } from 'vue';
import ApexChart from 'vue3-apexcharts';


// Настройки радиального графика с количеством стажеров/новых разработчиков,
// которые прошли онбординг
const internsSeries = ref([72]) // 72% выполнения
const internsOptions = ref({
  chart: {
    toolbar: {
      show: false
    },
    fontFamily: 'Jost',
    type: 'radialBar',
    offsetY: -20,
    sparkline: {
      enabled: true
    },
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
        name: {
          show: false
        },
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
  fill: {
    colors: ['#7B61FF']
  },
  stroke: {
    lineCap: 'round'
  },
  labels: ['Progress']
})
</script>

<template>
  <div class="dashboardPage">
    <div class="dark-blue-contaoner mes">В РАЗРАБОТКЕ</div>
    <div class="counters dark-blue-container">
      <div class="stats">
        <h4>Онбординг</h4>
        <p>Всего сотрудников: <strong>34</strong></p>
        <p>Завершили онбординг: <strong>26</strong></p>
      </div>
      <ApexChart type="radialBar" width="100%" height="300px" :options="internsOptions" :series="internsSeries" />
    </div>
    <div class="progress dark-blue-container">
      <h4>Проблемные зоны</h4>
    </div>
    <div class="activity dark-blue-container">
      <h4>Последняя активность</h4>
    </div>
    <div class="positions dark-blue-container">
      <h4>Должности</h4>
      <p>Всего: <strong>25</strong></p>
      <ApexChart type="radialBar" width="100%" height="300px" :options="internsOptions" :series="internsSeries" />

    </div>
    <div class="new-users dark-blue-container">
      <div class="new-user-item dark-blue-container">леха</div>
    </div>
    <div class="users-graph dark-blue-container">
      <h4>Последняя активность</h4>
    </div>
  </div>
</template>

<style scoped>
/* .chart {
  width: 200px;
  height: 400px;
} */

.mes {
  font-size: 5em;
  font-weight: 900;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  left: 300px;
  top: 0;
}

.dashboardPage {
  width: 100%;
  display: grid;
  grid-template-areas:
    "counters positions activity"
    "counters positions progress"
    "counters positions users-graph"
    "new-users new-users users-graph";
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 2fr;
  gap: 12px;
  color: white;
}

.counters {
  grid-area: counters;
}

.progress {
  grid-area: progress;
}

.positions {
  grid-area: positions;
}

.new-users {
  grid-area: new-users;
}

.users-graph {
  grid-area: users-graph;
}

.new-users {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.new-user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* @media (max-width: 768px) {
  .dashboard {
    grid-template-areas:
      "counters"
      "progress"
      "chart"
      "users"
      "users-graph";
    grid-template-columns: 1fr;
  }
} */
</style>