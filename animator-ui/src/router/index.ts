import { createRouter, createWebHistory } from 'vue-router'
import ControlPanel from '../views/ControlPanel.vue'
import Projector from '../views/Projector.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'ControlPanel',
      component: ControlPanel
    },
    {
      path: '/public',
      name: 'Projector',
      component: Projector
    }
  ]
})

export default router
