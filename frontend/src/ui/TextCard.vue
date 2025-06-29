<script setup lang="ts">
import { computed, ref } from 'vue';

const props = defineProps({
  text: {
    type: String,
    default: "Не назначена",
  },
  color: {
    type: String,
    default: "#c4c4c4",
  }
});

const getRGBFromHex = computed((): number[] => {
  const hex = (props.color || "#c4c4c4").replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return [r, g, b];
});
</script>

<template>
  <div class="border-shadow">
    <span :style="{ color: color }">{{ text }}</span>
  </div>
</template>

<style scoped>
.border-shadow {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 5px 10px;
  border: 1px solid v-bind(color);
  color: v-bind(color);
  background-color: rgba(v-bind('getRGBFromHex[0]'), v-bind('getRGBFromHex[1]'), v-bind('getRGBFromHex[2]'), 0.2);
  border-radius: 10px;
  box-shadow: 0 0 20px 2px rgba(v-bind('getRGBFromHex[0]'), v-bind('getRGBFromHex[1]'), v-bind('getRGBFromHex[2]'), 0.3);
}

.border-shadow span {
  font-weight: 500;
  padding: 0;
  margin: 0;
}
</style>