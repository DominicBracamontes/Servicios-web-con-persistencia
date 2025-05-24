<template>
    <div>
      <v-data-table
        :headers="headers"
        :items="formattedDocenteData"
        :loading="loading"
        hide-default-footer
        class="single-row-table"
      >
        <template v-slot:loading>
          <v-progress-linear indeterminate color="primary"></v-progress-linear>
        </template>
  
        <template v-slot:no-data>
          <v-alert :type="error ? 'error' : 'info'" class="mt-4">
            {{ noDataMessage }}
          </v-alert>
        </template>
      </v-data-table>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  
  const props = defineProps({
    numEmpleado: {
      type: String,
      default: null
    }
  });
  
  const headers = [
    { title: 'Núm. Empleado', key: 'numEmpleado', width: '120px' },
    { title: 'Nombre', key: 'nombre', width: '200px' },
    { title: 'Categoría', key: 'categoria' },
    { title: 'Email', key: 'email' }
  ];
  
  const docenteData = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const noDataMessage = ref('Ingrese un número de empleado para buscar');
  
  const formattedDocenteData = computed(() => {
    if (!docenteData.value) return [];
    
    return [{
      numEmpleado: docenteData.value.numEmpleado,
      nombre: docenteData.value.persona?.nombre || 'No disponible',
      categoria: docenteData.value.categoriaId?.toString() || 'Sin categoría',
      email: docenteData.value.persona?.email || 'No disponible'
    }];
  });
  
  const fetchDocente = async (numEmpleado) => {
    if (!numEmpleado) {
      docenteData.value = null;
      noDataMessage.value = 'Ingrese un número de empleado para buscar';
      return;
    }
  
    try {
      loading.value = true;
      error.value = null;
      noDataMessage.value = 'Cargando datos del docente...';
      
      const response = await fetch(`https://localhost:3000/docentes/${numEmpleado}`);
      
      if (!response.ok) {
        throw new Error(response.status === 404 
          ? `No se encontró el docente con número ${numEmpleado}` 
          : 'Error al cargar datos del docente');
      }
      
      const data = await response.json();
      docenteData.value = data;
      noDataMessage.value = 'No se encontraron datos para este docente';
      
    } catch (err) {
      error.value = err.message;
      noDataMessage.value = err.message;
      docenteData.value = null;
    } finally {
      loading.value = false;
    }
  };
  
  watch(() => props.numEmpleado, (newVal) => {
    fetchDocente(newVal);
  }, { immediate: true });
  </script>
  
  <style scoped>
  .single-row-table {
    border: thin solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
  }
  
  .single-row-table :deep(.v-data-table__wrapper) {
    overflow-y: auto;
  }
  </style>