import { createApp } from "vue";
import App from "./App.vue";
import ui from "@nuxt/ui/vue-plugin";
import "./assets/main.css";
import "./assets/modal.css";
import "./assets/surface.css";

const app = createApp(App);

app.use(ui);

app.mount("#app");
