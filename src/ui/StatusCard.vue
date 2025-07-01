<script setup lang="ts">
import { computed } from 'vue';
import type { Status } from '../types/types';

// Определяем пропс с возможностью передачи строки и приведением к Status
const props = defineProps<{
  status: string; // Принимаем строку, но приведем к Status
}>();

// Приведение и валидация статуса
const validatedStatus = computed((): Status => {
  switch (props.status) {
    case "NOT_STARTED":
    case "HAS_STARTED":
    case "DONE":
    case "EXPIRED":
      return props.status as Status;
    default:
      return "NOT_STARTED"; // Дефолтное значение при некорректном статусе
  }
});

// Вычисление текста на основе валидированного статуса
const statusText = computed(() => {
  switch (validatedStatus.value) {
    case "NOT_STARTED":
      return "Не начато";
    case "HAS_STARTED":
      return "В процессе";
    case "DONE":
      return "Завершено";
    case "EXPIRED":
      return "Просрочено";
    default:
      return "Неизвестно";
  }
});

// Вычисление цвета на основе валидированного статуса
const statusColor = computed(() => {
  switch (validatedStatus.value) {
    case "NOT_STARTED":
      return "#d9d9d9";
    case "HAS_STARTED":
      return "#ff00dd";
    case "DONE":
      return "#00ff88";
    case "EXPIRED":
      return "#ff0000";
    default:
      return "#c4c4c4"; // Дефолтный цвет
  }
});

// Преобразование цвета в RGB для стилей
const getRGBFromHex = computed((): number[] => {
  const hex = statusColor.value.replace('#', '').replace('var(--', '').replace(')', '');
  const r = parseInt(hex.substring(0, 2) || "c4", 16);
  const g = parseInt(hex.substring(2, 4) || "c4", 16);
  const b = parseInt(hex.substring(4, 6) || "c4", 16);
  return [r, g, b];
});
</script>

<template>
  <div class="border-shadow">
    <span :style="{ color: statusColor }">{{ statusText }}</span>
  </div>
</template>

<style scoped>
.border-shadow {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 10px;
  border: 1px solid v-bind(statusColor);
  color: v-bind(statusColor);
  background-color: rgba(v-bind('getRGBFromHex[0]'), v-bind('getRGBFromHex[1]'), v-bind('getRGBFromHex[2]'), 0.2);
  border-radius: 10px;
  box-shadow: 0 0 20px 2px rgba(v-bind('getRGBFromHex[0]'), v-bind('getRGBFromHex[1]'), v-bind('getRGBFromHex[2]'), 0.3);
}

.border-shadow span {
  font-size: 0.8em;
  font-weight: 500;
  padding: 0;
  margin: 0;
}
</style>