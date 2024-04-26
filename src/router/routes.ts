const routes = [
  {
    path: "/",
    component: () => import("@/views/login/index.vue") //路由懒加载
  },
  {
    path: "/home",
    component: () => import("@/views/home/index.vue")
  }
];

export default routes;
