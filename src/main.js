import { createApp } from "vue";

import App from "./App.vue";
import router from "./router";

// Self-hosted fonts (scripts/fetch-fonts.mjs), then the app's styles.
import "./assets/fonts/fonts.css";
import "./assets/main.css";

const app = createApp(App);

app.use(router);

app.mount("#app");
