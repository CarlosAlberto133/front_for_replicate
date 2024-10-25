<!-- Template do componente -->
<template>
  <!-- Container principal com largura máxima e padding -->
  <div class="container mx-auto p-4 max-w-4xl">
    <h1 class="text-black text-2xl font-bold mb-6">Fine Tuning Model</h1>

    <!-- Formulário principal com prevenção de submit padrão -->
    <form @submit.prevent="startTraining" class="space-y-6">
      <!-- Seção de Upload de Imagens -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">
          Upload de Imagens
        </label>
        <!-- Área de drop de arquivos -->
        <div class="border-2 border-dashed border-gray-300 rounded-lg p-6">
          <!-- Input de arquivo oculto -->
          <input
            type="file"
            @change="handleFileUpload"
            multiple
            accept="image/*"
            class="hidden"
            ref="fileInput"
          />
          <!-- Botão de seleção de arquivos -->
          <div class="text-center">
            <button
              type="button"
              @click="$refs.fileInput.click()"
              class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              :disabled="isUploading"
            >
              {{ isUploading ? 'Enviando...' : 'Selecionar Imagens' }}
            </button>
          </div>
        </div>
        
        <!-- Grid de preview das imagens -->
        <div v-if="uploadedFiles.length" class="mt-4 grid grid-cols-4 gap-4">
          <div v-for="file in uploadedFiles" :key="file.filename" class="relative">
            <img :src="file.preview" class="w-full h-24 object-cover rounded" />
            <!-- Botão de remover imagem -->
            <button
              @click="removeFile(file)"
              class="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
              type="button"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      <!-- Grid de parâmetros de treinamento -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Campo Trigger Word -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Trigger Word (obrigatório)
          </label>
          <input
            v-model="formData.triggerWord"
            type="text"
            required
            class="w-full p-2 border rounded"
            placeholder="Palavra que irá ativar o estilo"
          />
        </div>

        <!-- Campo Steps -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Steps
          </label>
          <input
            v-model="formData.steps"
            type="number"
            required
            class="w-full p-2 border rounded"
            min="1"
          />
        </div>
      </div>

      <!-- Botão de Submit -->
      <div>
        <button
          type="submit"
          class="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          :disabled="!canStartTraining"
        >
          {{ isTraining ? 'Iniciando Treinamento...' : 'Iniciar Fine Tuning' }}
        </button>

        <!-- Mensagens de validação -->
        <div v-if="!canStartTraining" class="mt-2 text-sm text-red-600">
          <p v-if="!uploadedFiles.length">Selecione pelo menos 5 imagens</p>
          <p v-if="!formData.triggerWord">Digite uma trigger word</p>
        </div>
      </div>

      <!-- Exibição do status do treinamento -->
      <div v-if="trainingStatus" class="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 class="font-semibold">Status do Treinamento:</h3>
        <pre class="mt-2 whitespace-pre-wrap">{{ JSON.stringify(trainingStatus, null, 2) }}</pre>
      </div>

      <!-- Exibição de erros -->
      <div v-if="error" class="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
        {{ error }}
      </div>

      <!-- Componente de status do treinamento -->
      <TrainingStatus 
        v-if="trainingId"
        :trainingId="trainingId" 
      />
    </form>
  </div>
</template>

<!-- Script do componente -->
<script setup>
import { ref, reactive, computed } from 'vue';
import TrainingStatus from './TrainingStatus.vue';

// Referências e estados
const fileInput = ref(null);
const uploadedFiles = ref([]);
const isUploading = ref(false);
const isTraining = ref(false);
const trainingStatus = ref(null);
const error = ref(null);
const trainingId = ref(null);

// Estado reativo do formulário com valores padrão
const formData = reactive({
  steps: 1000,
  loraRank: 16,
  optimizer: 'adamw8bit',
  batchSize: 1,
  resolution: '512,768,1024',
  autocaption: true,
  triggerWord: '',
  learningRate: 0.0004,
  wandbProject: 'flux_train_replicate',
  wandbSaveInterval: 100,
  captionDropoutRate: 0.05,
  cacheLatentsToDisk: false,
  wandbSampleInterval: 100
});

// Computed property para validação do formulário
const canStartTraining = computed(() => {
  return uploadedFiles.value.length > 0 && 
         formData.triggerWord.trim() !== '' && 
         !isTraining.value;
});

// Função para manipular upload de arquivos
const handleFileUpload = async (event) => {
  isUploading.value = true;
  const files = event.target.files;
  
  const formData = new FormData();
  Array.from(files).forEach(file => {
    formData.append('images', file);
  });

  try {
    const response = await fetch('http://localhost:3000/api/upload-images', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Erro no upload');

    const data = await response.json();
    uploadedFiles.value = data.files.map(file => ({
      ...file,
      preview: URL.createObjectURL(files[uploadedFiles.value.length])
    }));
  } catch (error) {
    console.error('Erro:', error);
    error.value = 'Erro ao fazer upload das imagens';
  } finally {
    isUploading.value = false;
  }
};

// Função para remover arquivo
const removeFile = (file) => {
  uploadedFiles.value = uploadedFiles.value.filter(f => f.filename !== file.filename);
};

// Função para iniciar o treinamento
const startTraining = async () => {
  if (!canStartTraining.value) return;
  
  isTraining.value = true;
  error.value = null;
  
  try {
    const response = await fetch('http://localhost:3000/api/start-training', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...formData,
        imageFiles: uploadedFiles.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Erro ao iniciar treinamento');
    }

    trainingId.value = data.id;

  } catch (err) {
    error.value = err.message;
    console.error('Erro completo:', err);
  } finally {
    isTraining.value = false;
  }
};
</script>