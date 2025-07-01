<template>
  <div class="accessDeniedPage">
    <h1>Доступ запрещен!</h1>
    <p>У вас нет прав для просмотра этой страницы.</p>
    <button @click="$router.push('/')">Вернуться</button>
  </div>
</template>

<style scoped>
.access-denied {
  text-align: center;
  padding: 50px;
}
</style>