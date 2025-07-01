<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import TextCard from '../../../ui/TextCard.vue';
import { useRoute, useRouter } from 'vue-router';
import axios from '../../../utils/axios';
import type { Position } from '../../../types/types';
import { eventBus } from '../../../utils/eventBus';

const router = useRouter()
const route = useRoute()
const positionId = ref<string | null>(null)
const error = ref<string | null>(null)

const position = ref<Position | null>(null)

const preview = reactive<{ name: string; color: string }>({
  color: "",
  name: ""
})

const managedPosition = reactive<{ name?: string; color?: string }>({})

onMounted(async () => {
  // Извлечение id из пути и получение должности
  const id = route.params.id
  try {
    if (typeof id !== "string") {
      throw new Error("Недопустимый тип ID!")
    }
    positionId.value = id
    console.log(positionId.value)

    const res = await axios.get(`/positions/${positionId.value}`)
    position.value = res.data.position

    console.log(position.value)

    if (position.value) {
      preview.name = position.value.name;
      preview.color = position.value.color;
    }
  } catch (err: any) {
    console.error(err)
    error.value = err.response?.data.message ?? 'Не удалось загрузить должность';
  }
})

function cancelHandler() {
  router.push("/positions")
  error.value = null
}


async function updatePositionHandler(e: Event) {
  e.preventDefault();
  error.value = null;

  if (!position.value) return;

  // очищаем managedPosition перед каждым обновлением
  managedPosition.name = undefined;
  managedPosition.color = undefined;

  if (preview.name.trim() && preview.name.trim() !== position.value.name) {
    managedPosition.name = preview.name.trim();
  }

  if (preview.color.trim() && preview.color.trim() !== position.value.color) {
    managedPosition.color = preview.color.trim();
  }

  if (!managedPosition.name && !managedPosition.color) {
    // Ничего не изменилось
    return router.push('/positions');
  }

  try {
    const res = await axios.put(`/positions/${positionId.value}`, managedPosition);
    if (res) {
      eventBus.emit('reloadPositions');
      router.push('/positions');
    }
  } catch (err: any) {
    error.value = err.response?.data.message ?? 'Ошибка обновления';
    console.error(err);
  }
}


async function deletePositionHandler(e: Event) {
  e.preventDefault();
  error.value = null;

  if (!position.value) return;

  try {
    const res = await axios.delete(`/positions/${positionId.value}`);
    if (res) {
      router.push('/positions');
    }
  } catch (err: any) {
    error.value = err.response?.data.message ?? 'Ошибка удаления';
    console.error(err);
  }
}




</script>
<template>
  <div @click.stop="cancelHandler" class="managePositionPage">
    <div @click.stop class="modal-container dark-blue-container">
      <h2>Изменение должности</h2>
      <form @submit="updatePositionHandler">
        <label for="">
          <ColorPicker v-model:pureColor="preview.color" shape="circle" format="hex" picker-type="chrome"
            theme="black" />
          <input type="text" v-model="preview.name" placeholder="Название должности">
        </label>
        <button type="submit" class="form-btn">Обновить должность</button>
        <span v-if="error" class="error">{{ error }}</span>
        <button @click.stop="deletePositionHandler" class="red-btn">Удалить</button>
      </form>
      <h4>Превью</h4>
      <TextCard :color="preview.color" :text="preview.name" class="preview" />
    </div>
  </div>
</template>

<style scoped>
.managePositionPage {
  position: fixed;
  z-index: 999;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

}

h2 {
  text-align: center;
  padding: 0 0 24px 0;
}

h4 {
  margin-top: 40px;
}

.preview {
  font-size: 1.4em;
}

form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.error {
  color: red;
}
</style>