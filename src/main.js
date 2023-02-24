import { createApp } from "vue";
import App from "./App.vue";
import "bootstrap/dist/css/bootstrap.css";
import axios from "axios";
import "bootstrap";

createApp(App).mount("#app");

axios.defaults.baseURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://griffith3.fly.dev/";
