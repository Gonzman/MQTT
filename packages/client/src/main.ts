import { createApp } from "vue";
import App from "./App.vue";
import ui from "@nuxt/ui/vue-plugin";
import "./assets/main.css";
import "./assets/modal.css";
import "./assets/surface.css";
import router from "./router";

const app = createApp(App);

app.use(ui);
app.use(router);

app.mount("#app");
