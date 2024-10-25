import { createRouter, createWebHistory } from 'vue-router';
import ImageGenerator from '../components/ImageGenerator.vue';
import FineTuning from '../components/FineTuning.vue';
import UseTrainedModel from '../components/UseTrainedModel.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: ImageGenerator
  },
  {
    path: '/fine-tuning',
    name: 'fine-tuning',
    component: FineTuning
  },
  {
    path: '/use-model',
    name: 'use-model',
    component: UseTrainedModel
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;