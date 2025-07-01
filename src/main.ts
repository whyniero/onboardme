import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";
import { createPinia } from "pinia";
import VueDragscroll from "vue-dragscroll";
import VueApexCharts from "vue3-apexcharts";
import Vue3ColorPicker from "vue3-colorpicker";
import "vue3-colorpicker/style.css";

const app = createApp(App);
app.use(router);
app.use(createPinia());
app.use(VueDragscroll);
app.component("apexchart", VueApexCharts);
app.use(Vue3ColorPicker);
app.mount("#app");
