<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex space-x-8">
              <!-- Home/Gerador de Imagens -->
              <RouterLink 
                to="/" 
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[$route.path === '/' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700']"
              >
                Gerador de Imagens
              </RouterLink>

              <!-- Fine Tuning -->
              <RouterLink 
                to="/fine-tuning" 
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[$route.path === '/fine-tuning' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700']"
              >
                Fine Tuning
              </RouterLink>

              <!-- Usar Modelo (visível apenas quando há um modelo para usar) -->
              <RouterLink 
                v-if="$route.path === '/use-model'"
                to="/use-model" 
                class="inline-flex items-center px-1 pt-1 text-sm font-medium"
                :class="[$route.path === '/use-model' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700']"
              >
                Usar Modelo Treinado
              </RouterLink>
            </div>
          </div>

          <!-- Status indicador -->
          <div v-if="$route.path === '/use-model'" class="flex items-center">
            <span class="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full" 
                  :class="{
                    'bg-green-100 text-green-800': $route.query.modelUrl,
                    'bg-yellow-100 text-yellow-800': !$route.query.modelUrl
                  }">
              {{ $route.query.modelUrl ? 'Modelo Carregado' : 'Nenhum Modelo Selecionado' }}
            </span>
          </div>
        </div>
      </div>
    </nav>

    <!-- Breadcrumbs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div class="flex items-center space-x-2 text-sm text-gray-500">
        <RouterLink to="/" class="hover:text-gray-700">Home</RouterLink>
        <span v-if="$route.path !== '/'">&rsaquo;</span>
        <template v-if="$route.path === '/fine-tuning'">
          <span class="text-blue-600">Fine Tuning</span>
        </template>
        <template v-if="$route.path === '/use-model'">
          <RouterLink to="/fine-tuning" class="hover:text-gray-700">Fine Tuning</RouterLink>
          <span>&rsaquo;</span>
          <span class="text-blue-600">Usar Modelo</span>
          <span v-if="$route.query.triggerWord" class="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
            {{ $route.query.triggerWord }}
          </span>
        </template>
      </div>
    </div>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style>
.router-link-active {
  font-weight: 500;
}
</style>