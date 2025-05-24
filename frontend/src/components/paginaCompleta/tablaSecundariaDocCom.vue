<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="asignaturas"
      :loading="loading"
      hide-default-footer
      @click:row="handleRowClick"
      class="asignaturas-table"
    >
      <template v-slot:top>
       
      </template>

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
import { ref, watch } from 'vue';

const props = defineProps({
  numEmpleado: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['select']);

const headers = [
  { title: 'Clave', key: 'clave', width: '100px' },
  { title: 'Asignatura', key: 'nombre' },
  { title: 'Créditos', key: 'creditos', align: 'center', width: '100px' }
];

const asignaturas = ref([]);
const loading = ref(false);
const error = ref(null);
const noDataMessage = ref('Ingrese un número de empleado para buscar asignaturas');

const handleRowClick = (event, { item }) => {
  emit('select', item.clave);
};

const fetchAsignaturas = async (numEmpleado) => {
  if (!numEmpleado) {
    asignaturas.value = [];
    noDataMessage.value = 'Ingrese un número de empleado para buscar';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    asignaturas.value = [];
    noDataMessage.value = 'Cargando asignaturas...';
    
    const response = await fetch(`https://localhost:3000/docentes/${numEmpleado}/contratos`);
    
    if (!response.ok) {
      throw new Error(response.status === 404 
        ? 'No se encontraron asignaturas para este docente' 
        : 'Error al cargar asignaturas');
    }
    
    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Error en la respuesta del servidor');
    }

    asignaturas.value = result.data.map(contrato => ({
      clave: contrato.asignatura.clave,
      nombre: contrato.asignatura.nombre,
      creditos: contrato.asignatura.creditos
    }));
    
    noDataMessage.value = 'No se encontraron asignaturas';
    
  } catch (err) {
    error.value = err.message;
    noDataMessage.value = err.message;
    asignaturas.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.numEmpleado, (newVal) => {
  fetchAsignaturas(newVal);
}, { immediate: true });
</script>

<style scoped>
.asignaturas-table {
  border: thin solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  margin-top: 20px;
}

.asignaturas-table :deep(.v-data-table__wrapper) {
  overflow-y: auto;
}
</style>