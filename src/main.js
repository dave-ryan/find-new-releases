import { createApp } from "vue";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.css";

import axios from "axios";
import "bootstrap";
import router from "./router";

createApp(App).use(router).mount("#app");

axios.defaults.baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://griffith3.fly.dev/";
