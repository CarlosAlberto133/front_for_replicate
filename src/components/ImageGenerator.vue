<template>
  <div class="container mx-auto p-4 max-w-2xl">
    <h1 class="text-2xl font-bold mb-6">Gerador de Imagens</h1>

    <!-- Modelo Treinado Info -->
    <div v-if="modelUrl" class="mb-6 p-4 bg-blue-50 rounded-lg">
      <h2 class="font-semibold text-blue-800">Usando Modelo Treinado</h2>
      <p class="text-sm text-gray-600 mt-1">
        Trigger Word: <span class="font-medium">{{ triggerWord }}</span>
      </p>
    </div>
    
    <div class="space-y-4">
      <!-- Prompt Input -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Prompt
        </label>
        <textarea
          v-model="prompt"
          :placeholder="modelUrl 
            ? `Use a trigger word '${triggerWord}' no seu prompt para aplicar o estilo`
            : 'Descreva a imagem que você quer gerar...'"
          rows="3"
          class="w-full p-3 border rounded-lg"
          :disabled="isGenerating"
        ></textarea>
      </div>

      <!-- Generate Button -->
      <button
        @click="generateImage"
        :disabled="isGenerating || !prompt"
        class="w-full py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
      >
        {{ isGenerating ? 'Gerando...' : 'Gerar Imagem' }}
      </button>

      <!-- Error Message -->
      <div v-if="error" class="p-4 bg-red-100 text-red-700 rounded-lg">
        {{ error }}
      </div>

      <!-- Generated Image -->
      <div v-if="imageUrl" class="mt-6">
        <img 
          :src="imageUrl" 
          alt="Imagem gerada"
          class="w-full rounded-lg shadow-lg"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const prompt = ref('');
const imageUrl = ref('');
const error = ref('');
const isGenerating = ref(false);

// Parâmetros do modelo treinado
const modelUrl = ref('');
const triggerWord = ref('');

onMounted(() => {
  // Pegar parâmetros da URL
  if (route.query.modelUrl) {
    modelUrl.value = route.query.modelUrl;
  }
  if (route.query.triggerWord) {
    triggerWord.value = route.query.triggerWord;
  }
});

const generateImage = async () => {
  if (!prompt.value) return;
  
  isGenerating.value = true;
  error.value = '';
  imageUrl.value = '';

  try {
    const response = await fetch('http://localhost:3000/api/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt.value,
        extra_lora: modelUrl.value // URL do modelo S3
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao gerar imagem');
    }

    imageUrl.value = data.base64Image;
  } catch (err) {
    error.value = err.message;
    console.error('Erro:', err);
  } finally {
    isGenerating.value = false;
  }
};
</script>