<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import TextCard from '../../../ui/TextCard.vue';
import { useRouter } from 'vue-router';
import axios from '../../../utils/axios';
import { eventBus } from '../../../utils/eventBus';

const router = useRouter()
const error = ref<string | null>(null)

async function addPositionHandler(e: Event) {
  e.preventDefault()
  error.value = null
  try {
    if (!newPosition.name || !newPosition.color) {
      error.value = "Название или цвет должности не выбраны!"
      throw new Error("Данные заполнены не полностью!")
    }

    const position = await axios.post("/positions", {
      name: newPosition.name.trim(),
      color: newPosition.color.trim()
    })

    if (position) {
      eventBus.emit('reloadPositions');
      router.push("/positions")
    }

  } catch (err: any) {
    if (err.response) {
      error.value = err.response.data.message
    }
    console.error(err)
  }
}

function cancelHandler() {
  router.push("/positions")
  newPosition.color = ""
  newPosition.name = ""
  error.value = null
}

interface NewPosition {
  color: string;
  name: string;
}

const newPosition = reactive<NewPosition>({
  color: "",
  name: ""
})

const preview = reactive<NewPosition>({
  color: "#fa0202",
  name: "Должность"
})

watch(newPosition, () => {
  preview.color = newPosition.color
  preview.name = newPosition.name

  if (preview.name === "") {
    preview.name = "Должность"
    preview.color = "#fa0202"
  }
})

</script>
<template>
  <div @click.stop="cancelHandler" class="addPositionPage">
    <div @click.stop class="modal-container dark-blue-container">
      <h2>Добавление должности</h2>
      <form @submit="addPositionHandler">
        <label for="">
          <ColorPicker v-model:pureColor="newPosition.color" shape="circle" format="hex" picker-type="chrome"
            theme="black" />
          <input type="text" v-model="newPosition.name" placeholder="Название должности">
        </label>
        <button type="submit" class="form-btn">Добавить должность</button>
        <span v-if="error" class="error">{{ error }}</span>
      </form>
      <h4>Превью</h4>
      <TextCard :color="preview.color" :text="preview.name" class="preview" />
    </div>
  </div>
</template>

<style scoped>
.addPositionPage {
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
  padding: 0 0 12px 0;
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

label {
  padding: 12px 0;
}


.error {
  color: red;
}
</style>