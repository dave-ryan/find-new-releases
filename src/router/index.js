import { createRouter, createWebHistory } from "vue-router";
import Home from "../views/Home.vue";
import Csv from "../views/Csv.vue";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/csv",
    name: "Csv",
    component: Csv,
  },
];

const router = createRouter({
  mode: "history",
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
