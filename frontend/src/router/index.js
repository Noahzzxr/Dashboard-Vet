import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import TutoresView from '../views/TutoresView.vue'
import PetsView from '../views/PetsView.vue'
import VeterinariosView from '../views/VeterinariosView.vue'
import ConsultasView from '../views/ConsultasView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { title: 'Painel Principal' }
  },
  {
    path: '/tutores',
    name: 'tutores',
    component: TutoresView,
    meta: { title: 'Gerenciar Tutores' }
  },
  {
    path: '/pets',
    name: 'pets',
    component: PetsView,
    meta: { title: 'Gerenciar Pets' }
  },
  {
    path: '/veterinarios',
    name: 'veterinarios',
    component: VeterinariosView,
    meta: { title: 'Gerenciar Veterinários' }
  },
  {
    path: '/consultas',
    name: 'consultas',
    component: ConsultasView,
    meta: { title: 'Gerenciar Consultas' }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Define o título da aba do navegador de forma dinâmica
router.beforeEach((to, from, next) => {
  document.title = `${to.meta.title || 'Clínica'} | VetCare`
  next()
})

export default router
