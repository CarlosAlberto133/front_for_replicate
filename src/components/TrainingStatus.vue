<template>
  <div v-if="trainingStatus" class="mt-6 p-6 bg-white rounded-lg shadow-lg">
    <h3 class="text-xl font-semibold mb-4">Status do Treinamento</h3>
    
    <!-- Status -->
    <div class="mb-4">
      <span class="font-medium">Status: </span>
      <span :class="{
        'text-yellow-600': trainingStatus.status === 'starting',
        'text-blue-600': trainingStatus.status === 'processing',
        'text-green-600': trainingStatus.status === 'succeeded',
        'text-red-600': trainingStatus.status === 'failed'
      }">
        {{ trainingStatus.status }}
      </span>
    </div>

    <!-- Progress -->
    <div v-if="trainingStatus.logs" class="mb-4">
      <pre class="whitespace-pre-wrap bg-gray-50 p-4 rounded text-sm overflow-auto max-h-96">{{ trainingStatus.logs }}</pre>
    </div>

    <!-- Modelo Treinado - Nova seção -->
    <div v-if="trainingStatus.status === 'succeeded' && trainingStatus.modelUrl" 
         class="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
      <h4 class="text-lg font-medium text-green-800 mb-3">Modelo Treinado com Sucesso!</h4>
      
      <div class="space-y-4">
        <div>
          <p class="text-sm text-gray-600 mb-2">URL do modelo (.safetensors):</p>
          <code class="block p-2 bg-white rounded border text-sm break-all">
            {{ trainingStatus.modelUrl }}
          </code>
        </div>

        <button
          @click="useTrainedModel"
          class="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors"
        >
          Usar Este Modelo
        </button>
      </div>
    </div>

    <!-- Error -->
    <div v-if="trainingStatus.error" class="mt-4 p-4 bg-red-100 text-red-700 rounded">
      <p class="font-medium">Erro:</p>
      <p>{{ trainingStatus.error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  trainingId: String
});

const router = useRouter();
const trainingStatus = ref(null);
let statusCheckInterval = null;

const checkStatus = async () => {
  if (!props.trainingId) return;

  try {
    const response = await fetch(`http://localhost:3000/api/check-training-status/${props.trainingId}`);
    const data = await response.json();
    
    trainingStatus.value = data;

    if (['succeeded', 'failed', 'canceled'].includes(data.status)) {
      clearInterval(statusCheckInterval);
    }
  } catch (error) {
    console.error('Erro ao verificar status:', error);
  }
};

const useTrainedModel = () => {
  if (trainingStatus.value?.modelUrl) {
    console.log('Redirecionando para usar modelo com:', {
      modelUrl: trainingStatus.value.modelUrl,
      triggerWord: trainingStatus.value.input.trigger_word
    });
    
    router.push({
      name: 'use-model', // Certifique-se de que este nome corresponde ao definido no router
      query: { 
        modelUrl: trainingStatus.value.modelUrl,
        triggerWord: trainingStatus.value.input.trigger_word
      }
    });
  }
};

onMounted(() => {
  checkStatus();
  statusCheckInterval = setInterval(checkStatus, 10000);
});

onUnmounted(() => {
  if (statusCheckInterval) {
    clearInterval(statusCheckInterval);
  }
});
</script>