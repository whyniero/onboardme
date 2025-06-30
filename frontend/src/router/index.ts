import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import dashboardPage from "../pages/teamlead/dashboardPage.vue";
import chatsPage from "../pages/chats/chatsPage.vue";
import internsPage from "../pages/teamlead/controlInterns/internsPage.vue";
import internProfilePage from "../pages/teamlead/controlInterns/internProfilePage.vue";
import loginPage from "../pages/auth/loginPage.vue";
import stagesPage from "../pages/intern/stagesPage.vue";
import taskPage from "../pages/intern/taskPage.vue";
import chatPage from "../pages/chats/chatPage.vue";
import registerPage from "../pages/auth/registerPage.vue";
import addInternPage from "../pages/teamlead/controlInterns/addInternPage.vue";
import positionsPage from "../pages/hr/positions/positionsPage.vue";
import addPositionPage from "../pages/hr/positions/addPositionPage.vue";
import managePositionPage from "../pages/hr/positions/managePositionPage.vue";
import { useUserStore } from "../stores/user";
import teamleadsPage from "../pages/hr/teamleads/teamleadsPage.vue";
import onboardingControlPage from "../pages/teamlead/onboardControl/onboardingControlPage.vue";
import addStage from "../pages/teamlead/onboardControl/addStage.vue";
import addTaskPage from "../pages/teamlead/onboardControl/addTaskPage.vue";
import updateStagePage from "../pages/teamlead/onboardControl/updateStagePage.vue";
import updateTaskPage from "../pages/teamlead/onboardControl/updateTaskPage.vue";
import accessDeniedPage from "../pages/accessDeniedPage.vue";
import updateInternPage from "../pages/teamlead/controlInterns/updateInternPage.vue";
import addTeamleadPage from "../pages/hr/teamleads/addTeamleadPage.vue";
import updateTeamleadPage from "../pages/hr/teamleads/updateTeamleadPage.vue";

declare module "vue-router" {
  interface RouteMeta {
    requiresGuest?: boolean;
    requiresRole?: string[];
  }
}

const routes: Array<RouteRecordRaw> = [
  // Авторизация
  { path: "/login", component: loginPage, meta: { requiresGuest: true } },
  {
    path: "/register", // регистрироваться может только HR по специальному коду, который хранится в .env бекенда
    component: registerPage,
    meta: { requiresGuest: true },
  },

  // Главная страница
  {
    path: "/",
    component: dashboardPage,
    meta: { requiresRole: ["HR", "TEAMLEAD", "INTERN"] },
  },

  // Чаты
  {
    path: "/chats",
    component: chatsPage,
    meta: { requiresRole: ["HR", "TEAMLEAD", "INTERN"] },
  },
  { path: "/chats/:chatId", component: chatPage, props: true },

  // Стажеры (доступ только HR и Teamlead)
  {
    path: "/interns",
    component: internsPage,
    meta: { requiresRole: ["HR", "TEAMLEAD"] },
  },
  {
    path: "/interns/:id",
    component: internProfilePage,
    meta: { requiresRole: ["HR", "TEAMLEAD"] },
  },

  {
    path: "/interns/add",
    components: { default: internsPage, modal: addInternPage },
    meta: { requiresRole: ["HR", "TEAMLEAD"] },
  },
  {
    path: "/interns/update/:id",
    components: { default: internsPage, modal: updateInternPage },
    meta: { requiresRole: ["HR", "TEAMLEAD"] },
  },

  // Тимлиды (доступ только для HR)
  {
    path: "/teamleads",
    component: teamleadsPage,
    meta: { requiresRole: ["HR"] },
  },
  {
    path: "/teamleads/add",
    components: {
      default: teamleadsPage,
      modal: addTeamleadPage,
    },
    meta: { requiresRole: ["HR"] },
  },
  {
    path: "/teamleads/update/:id",
    components: {
      default: teamleadsPage,
      modal: updateTeamleadPage,
    },
    meta: { requiresRole: ["HR"] },
  },

  // Управление онбордингам (доступ и для HR и для Teamlead)
  {
    path: "/control",
    component: onboardingControlPage,
    meta: { requiresRole: ["HR", "TEAMLEAD"] },
  },
  {
    path: "/control/stages/add",
    components: {
      default: onboardingControlPage,
      modal: addStage,
    },
    meta: { requiresRole: ["HR", "TEAMLEAD"] },
  },
  {
    path: "/control/stages/:stageId/update",
    components: {
      default: onboardingControlPage,
      modal: updateStagePage,
    },
    meta: { requiresRole: ["HR", "TEAMLEAD"] },
  },

  {
    path: "/control/stages/:stageId/tasks/add",
    components: {
      default: onboardingControlPage,
      modal: addTaskPage,
    },
    meta: { requiresRole: ["HR", "TEAMLEAD"] },
  },

  {
    path: "/control/stages/:stageId/tasks/:id/update",
    components: {
      default: onboardingControlPage,
      modal: updateTaskPage,
    },
    meta: { requiresRole: ["HR", "TEAMLEAD"] },
  },
  // Этапы для стажеров. фактически доступ только для стажеров
  { path: "/stages", component: stagesPage },
  {
    path: "/stages/:stageId/tasks/:id",
    component: taskPage,
    meta: { requiresRole: ["INTERN"] },
  },

  // Должности (только для HR)
  {
    path: "/positions",
    component: positionsPage,
    meta: { requiresRole: ["HR"] },
  },
  {
    path: "/positions/add",
    components: {
      default: positionsPage,
      modal: addPositionPage,
    },
    meta: { requiresRole: ["HR"] },
  },
  {
    path: "/positions/update/:id",
    components: {
      default: positionsPage,
      modal: managePositionPage,
    },
    meta: { requiresRole: ["HR"] },
  },
  {
    path: "/access-denied",
    component: accessDeniedPage,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _, next) => {
  const userStore = useUserStore();
  const isAuth = userStore.isAuthenticated;
  const userRole = userStore.userRole;

  if (to.meta.requiresGuest && isAuth) {
    next("/"); // если авторизован, не пускаем на login
  } else if (!to.meta.requiresGuest && !isAuth) {
    next("/login"); // если не авторизован — редиректим
  } else if (to.meta.requiresRole && !to.meta.requiresRole.includes(userRole)) {
    next("/access-denied"); // проверка роли для доступа
  } else {
    next();
  }
});

export default router;
