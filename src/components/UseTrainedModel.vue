<template>
    <div class="max-w-4xl mx-auto p-6">
      <div class="bg-white rounded-lg shadow-lg p-6">
        <h1 class="text-black text-2xl font-bold mb-6">Gerar Imagem com Modelo Treinado</h1>
  
        <!-- Informações do Modelo -->
        <div class="bg-blue-50 p-4 rounded-lg mb-6">
          <h2 class="text-lg font-semibold text-blue-800 mb-2">Modelo em Uso</h2>
          <div class="space-y-2">
            <div>
              <p class="mb-2">
                <span class="text-black font-medium">Trigger Word:</span>
                <code class="text-black ml-2 px-2 py-1 bg-blue-100 rounded">{{ triggerWord }}</code>
              </p>
              <p class="text-sm text-gray-600">
                Use esta palavra no seu prompt para ativar o estilo treinado
              </p>
            </div>
            
            <div>
              <p class="text-sm font-medium text-gray-700">Modelo Base:</p>
              <code class="text-black block p-2 bg-white rounded border text-xs mt-1">
                fofr/flux-tesla-robovan
              </code>
            </div>
  
            <div>
              <p class="text-sm font-medium text-gray-700">Seu Modelo Treinado (.safetensors):</p>
              <code class="text-black block p-2 bg-white rounded border text-xs mt-1 break-all">
                {{ modelUrl }}
              </code>
            </div>
          </div>
        </div>
  
        <!-- Prompt Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Seu Prompt
          </label>
          <textarea
            v-model="prompt"
            rows="4"
            class="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
            :placeholder="`Exemplo: Uma foto de ${triggerWord} em estilo futurista, perspectiva 3/4...`"
            :disabled="isGenerating"
          ></textarea>
          <p class="mt-2 text-sm text-gray-500">
            Dica: Use "{{ triggerWord }}" no início do seu prompt para melhores resultados
          </p>
        </div>
  
        <!-- Configurações adicionais -->
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Aspect Ratio
            </label>
            <select
              v-model="aspectRatio"
              class="w-full p-2 border rounded-lg"
              :disabled="isGenerating"
            >
              <option value="3:2">3:2 (Paisagem)</option>
              <option value="2:3">2:3 (Retrato)</option>
              <option value="1:1">1:1 (Quadrado)</option>
            </select>
          </div>
  
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Qualidade
            </label>
            <input
              v-model="quality"
              type="range"
              min="60"
              max="100"
              step="5"
              class="w-full"
              :disabled="isGenerating"
            />
            <span class="text-sm text-gray-500">{{ quality }}%</span>
          </div>
        </div>
  
        <!-- Generate Button -->
        <button
          @click="generateImage"
          :disabled="isGenerating || !prompt"
          class="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
        >
          <span v-if="isGenerating" class="flex items-center justify-center">
            <svg class="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Gerando Imagem...
          </span>
          <span v-else>Gerar Imagem</span>
        </button>
  
        <!-- Error Message -->
        <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {{ error }}
        </div>
  
        <!-- Generated Image -->
        <div v-if="generatedImage" class="mt-6">
          <h3 class="text-black font-semibold mb-3">Imagem Gerada:</h3>
          <img 
            :src="generatedImage" 
            alt="Imagem gerada"
            class="w-full rounded-lg shadow-lg"
          />
          <div class="mt-4 text-sm text-gray-500">
            <p>Configurações usadas:</p>
            <ul class="list-disc list-inside mt-1">
              <li>Aspect Ratio: {{ aspectRatio }}</li>
              <li>Qualidade: {{ quality }}%</li>
              <li>Trigger Word: {{ triggerWord }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  
  const route = useRoute();
  const router = useRouter();
  
  const prompt = ref('');
  const modelUrl = ref('');
  const triggerWord = ref('');
  const isGenerating = ref(false);
  const error = ref('');
  const generatedImage = ref('');
  const aspectRatio = ref('3:2');
  const quality = ref(90);
  
  onMounted(() => {
    modelUrl.value = route.query.modelUrl;
    triggerWord.value = route.query.triggerWord;
  
    if (!modelUrl.value || !triggerWord.value) {
      error.value = 'Parâmetros do modelo ausentes';
      router.push('/fine-tuning');
    }
  });
  
  const generateImage = async () => {
    if (!prompt.value || !modelUrl.value) return;
  
    isGenerating.value = true;
    error.value = '';
    generatedImage.value = '';
  
    try {
      const response = await fetch('http://localhost:3000/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.value,
          extra_lora: modelUrl.value,
          aspect_ratio: aspectRatio.value,
          output_quality: quality.value
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Erro ao gerar imagem');
      }
  
      generatedImage.value = data.base64Image;
    } catch (err) {
      error.value = err.message;
      console.error('Erro:', err);
    } finally {
      isGenerating.value = false;
    }
  };
  </script>