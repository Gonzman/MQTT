import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";
import ui from "@nuxt/ui/vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vueDevTools(), ui()],
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./src", import.meta.url)),
            "@view": fileURLToPath(new URL("./src/views", import.meta.url)),
            "@store": fileURLToPath(new URL("./src/stores", import.meta.url)),
            "@component": fileURLToPath(new URL("./src/components", import.meta.url)),
            "@asset": fileURLToPath(new URL("./src/assets", import.meta.url)),
            "@router": fileURLToPath(new URL("./src/router", import.meta.url))
        }
    }
});
