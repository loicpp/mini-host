import { createRouter, createWebHistory } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import LoginView from '../views/LoginView.vue'
import HomeView from '../views/HomeView.vue'
import GameSessionView from '../views/GameSessionView.vue'
import CreateGameView from '../views/CreateGameView.vue'
import PlaylistConfigView from '../views/PlaylistConfigView.vue'
import SettingsView from '../views/SettingsView.vue'
import DiagnosticsView from '../views/DiagnosticsView.vue'
import Projector from '../views/Projector.vue'

import { isLoggedIn } from '../core/domain/general/state';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: LoginView
    },
    {
      path: '/',
      component: AppLayout,
      children: [
        { path: '', name: 'Home', component: HomeView },
        { path: 'game/selector', name: 'GameSelector', component: () => import('../views/GameSelectorView.vue') },
        { path: 'setup', name: 'SetupSelector', component: () => import('../views/SetupSelectorView.vue') },
        { path: 'game/create/:gameType', name: 'CreateGame', component: CreateGameView },
        { path: 'game/:id', name: 'GameSession', component: GameSessionView },
        { path: 'playlists', name: 'Playlists', component: PlaylistConfigView },
        { path: 'settings', name: 'Settings', component: SettingsView },
        { path: 'diagnostics', name: 'Diagnostics', component: DiagnosticsView }
      ],
      beforeEnter: (to, _from, next) => {
        // If not logged in, we check state. Note: auto-login might still be pending in LoginView.
        if (!isLoggedIn.value && to.name !== 'Login') {
          next({ name: 'Login' });
        } else {
          next();
        }
      }
    },
    {
      path: '/public',
      name: 'Projector',
      component: Projector
    }
  ]
})

export default router
