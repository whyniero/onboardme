<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import TextCard from '../../../ui/TextCard.vue';
import axios from '../../../utils/axios';
import EditIcon from "../../../assets/icons/edit.svg"


interface Position {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

const positions = ref<Position[] | null>(null)


async function getPositions() {
  try {
    const res = await axios.get("/positions");
    positions.value = res.data.positions;

  } catch (err) {
    console.error(err)
  }
}

onMounted(async () => {
  await getPositions();

});


</script>
<template>
  <div class="templatesPage container">
    <div class="dark-blue-container">
      <h2>Управление должностями</h2>
      <div class="cards">
        <RouterLink :to="`/positions/update/${position.id}`" v-for="position in positions" class="card"
          :key="position.id">
          <TextCard :color="position.color" :text="position.name" />
          <div class="edit">
            <EditIcon />
          </div>

        </RouterLink>
      </div>
      <RouterLink to="/positions/add">
        <button class="light-blue-btn">Добавить должность</button>
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.cards {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  padding: 20px;
  font-size: 1.2em;
}

.card {
  position: relative;
  user-select: none;
  cursor: pointer;
}

.card .edit {
  display: none;
  width: 26px;
  height: 26px;
  border-radius: 5px;
  padding: 2px;
  background-color: var(--colorBlue);
  position: absolute;
  top: 6px;
  right: 8px;
}

.card:hover .edit {
  display: inline-block;
}

.card .edit svg {
  width: 100%;
  color: white;
}
</style>