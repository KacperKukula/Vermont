import { createApp } from 'vue';
import App from './App.vue';
import { createWebHistory } from 'vue-router';
import { createAppRouter } from './router';
import './styles/main.scss';

createApp(App).use(createAppRouter(createWebHistory())).mount('#app');
