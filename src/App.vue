<script setup lang="ts">
import { useRoute } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import { computed } from 'vue';
const route = useRoute()
const isLoginOrRegisterPage = computed((): boolean => route.path === "/login" || route.path === "/register")
</script>

<template>
  <div class="main">
    <Sidebar v-if="!isLoginOrRegisterPage" />
    <RouterView :class="{ container: !isLoginOrRegisterPage }" />
    <RouterView name="modal" v-slot="{ Component }">
      <transition>
        <component v-if="Component" :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>

<style scoped>
.main {
  display: flex;
  min-height: 100%;
}
</style>
