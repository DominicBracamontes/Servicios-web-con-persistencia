<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="inscripciones"
      :loading="loading"
      hide-default-footer
      class="inscripciones-table"
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
import { ref, watch } from 'vue';

const props = defineProps({
  matricula: {
    type: String,
    required: true
  }
});

const headers = [
  { title: 'Clave', key: 'clave', width: '100px' },
  { title: 'Asignatura', key: 'asignatura' },
  { title: 'Créditos', key: 'creditos', align: 'center', width: '100px' },
  { title: 'Semestre', key: 'semestre', align: 'center', width: '120px' },
  { title: 'Calificación', key: 'calificacion', align: 'center', width: '120px' }
];

const inscripciones = ref([]);
const loading = ref(false);
const error = ref(null);
const noDataMessage = ref('Ingrese una matrícula para buscar asignaturas');

const fetchInscripciones = async (matricula) => {
  if (!matricula) {
    inscripciones.value = [];
    noDataMessage.value = 'Ingrese una matrícula para buscar';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    noDataMessage.value = 'Cargando asignaturas inscritas...';
    
    const response = await fetch(`https://localhost:3000/inscripciones/estudiante/${matricula}`);
    
    if (!response.ok) {
      throw new Error(response.status === 404 
        ? 'No se encontraron asignaturas para este estudiante' 
        : 'Error al cargar asignaturas');
    }
    
    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Error en la respuesta del servidor');
    }

    inscripciones.value = result.data.map(item => ({
      clave: item.asignatura.clave,
      asignatura: item.asignatura.nombre,
      creditos: item.asignatura.creditos,
      semestre: item.semestre.toString().replace(/(\d{4})(\d{1})/, '$1-$2'), 
      calificacion: item.calificacion || 'N/A'
    }));
    
    noDataMessage.value = 'No se encontraron asignaturas inscritas';
    
  } catch (err) {
    error.value = err.message;
    noDataMessage.value = err.message;
    inscripciones.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.matricula, (newVal) => {
  if (newVal) {
    fetchInscripciones(newVal);
  }
}, { immediate: true });
</script>

<style scoped>
.inscripciones-table {
  border: thin solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  margin-top: 20px;
}

.inscripciones-table :deep(td:nth-child(5)) {
  font-weight: bold;
  color: var(--v-primary-base);
}
</style>