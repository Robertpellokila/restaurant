import About from "@/views/About.vue";
import CartPage from "@/views/CartPage.vue";
import Home from "@/views/Home.vue";
import ProductPage from "@/views/ProductPage.vue";
import RecipePage from "@/views/RecipePage.vue";
import TestimonialsPage from "@/views/TestimonialsPage.vue";
import { createMemoryHistory, createRouter } from "vue-router";

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
  {
    path: "/product",
    name: "Product",
    component: ProductPage,
  },
  {
    path: "/recipe",
    name: "Recipe",
    component: RecipePage,
  },
  {
    path: "/testimonial",
    name: "Testimonila",
    component: TestimonialsPage,
  },
  {
    path: "/cart",
    name: "Cart",
    component: CartPage,
  },
];

export const router = createRouter({
  history: createMemoryHistory(),
  routes,
});
