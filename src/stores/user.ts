import { defineStore } from "pinia";

interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export const useUserStore = defineStore("user", {
  state: () => ({
    currentUser: JSON.parse(
      localStorage.getItem("currentUser") || "null"
    ) as null | CurrentUser,
  }),
  actions: {
    setUser(user: CurrentUser) {
      this.currentUser = user;
      localStorage.setItem("currentUser", JSON.stringify(user));
    },
    logout() {
      this.currentUser = null;
      localStorage.removeItem("currentUser");
    },
  },
  getters: {
    isAuthenticated: (state) => !!state.currentUser,
    userRole: (state) => state.currentUser?.role ?? "",
  },
});
