import Vue from "vue";
import VueRouter from "vue-router";
import Home from "../views/Home.vue";
import Privacy from "../views/Privacy.vue";
import Terms from "../views/Terms.vue";

import store from "@/store";

Vue.use(VueRouter);

const routes = [{
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/privacy",
    name: "Privacy",
    component: Privacy
  },
  {
    path: "/terms",
    name: "Terms",
    component: Terms
  },
  {
    path: "/license",
    name: "License",
    component: () =>
      import( /* webpackChunkName: "license" */ "../views/License.vue")
  },
  {
    path: "/citation",
    name: "Citation",
    component: () =>
      import( /* webpackChunkName: "license" */ "../views/Citation.vue")
  },
  {
    path: "/about",
    name: "About",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "about" */ "../views/About.vue")
  },
  {
    path: "/maps",
    name: "Compare",
    props: route => ({
      admin_level: route.query.admin_level,
      location: route.query.location,
      variable: route.query.variable,
      sort: route.query.sort,
      date: route.query.date,
      min: route.query.min,
      max: route.query.max
    }),
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "compare" */ "../views/Compare.vue")
  },
  {
    path: "/latest",
    name: "Latest",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "latest" */ "../views/Latest.vue")
  },
  {
    path: "/data",
    name: "Data",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import( /* webpackChunkName: "data" */ "../views/Data.vue")
  },
  {
    path: "/sources",
    name: "Sources",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "sources" */ "../views/Sources.vue")
  },
  {
    path: "/contributing-data",
    name: "Contributing",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "contributing" */ "../views/Contributing.vue")
  },
  {
    path: "/topics",
    name: "Topics",
    component: () =>
      import( /* webpackChunkName: "topics" */ "../views/Topics.vue")
  },
  {
    path: "/niaid",
    name: "NIAID",
    component: () =>
      import( /* webpackChunkName: "topics" */ "../views/NIAID.vue")
  },
  {
    path: "/topics/definitions",
    name: "Topic Definitions",
    component: () =>
      import( /* webpackChunkName: "topic-definitions" */ "../views/TopicDefinitions.vue")
  },
  {
    path: "/resources",
    name: "Resource Summary",
    component: () =>
      import( /* webpackChunkName: "resource-summary" */ "../views/ResourceSummary.vue")
  },
  {
    path: "/resources/search",
    name: "Resources",
    props: route => ({
      q: route.query.q,
      page: route.query.page,
      size: route.query.size,
      filter: route.query.filter,
      sort: route.query.sort
    }),
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import( /* webpackChunkName: "resources" */ "../views/Resources.vue")
  },
  {
    path: "/resources/:id",
    name: "Resource Page",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(
        /* webpackChunkName: "resources-types" */
        "../views/ResourcePage.vue"
      )
  },

  {
    path: "/summary",
    name: "Summary",
    props: route => ({
      location: route.query.location
    }),
    meta: {
      hideNavigation: true
    },
    component: () =>
      import( /* webpackChunkName: "summary" */ "../views/Summary.vue")
  },
  {
    path: "/epidemiology",
    name: "Epidemiology",
    props: route => ({
      location: route.query.location,
      xVariable: route.query.xVariable,
      variable: route.query.variable,
      log: route.query.log,
      fixedY: route.query.fixedY,
      percapita: route.query.percapita
    }),
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import( /* webpackChunkName: "epi" */ "../views/Epi.vue")
  },
  // {
  //   path: "/timelapse",
  //   name: "Timelapse",
  //   component: () =>
  //     import(/* webpackChunkName: "timelapse" */ "../views/Timelapse.vue")
  // },
  {
    path: "/doubling-rates",
    name: "Doubling Rates",
    props: route => ({
      location: route.query.location,
      variable: route.query.variable
    }),
    component: () =>
      import(
        /* webpackChunkName: "doubling-rates" */
        "../views/DoublingRates.vue"
      )
  }
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  linkExactActiveClass: "active",
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return {
        selector: to.hash
      };
    }
    if (!to.params.disableScroll) {
      return {
        x: 0,
        y: 0
      };
    }
  }
});

// add loading icon between routes
router.beforeEach((to, from, next) => {
  store.commit("admin/setLoading", true);
  next();
})
router.afterEach((to, from) => {
  store.commit("admin/setLoading", false);
})

export default router;
