<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="inscripciones"
      :loading="loading"
      hide-default-footer
      class="inscripciones-table"
    >
      <template v-slot:top>
        <v-alert v-if="asignaturaSeleccionada" type="info" text>
          Mostrando {{ inscripciones.length }} inscripción(es)
        </v-alert>
      </template>

      <template v-slot:loading>
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </template>

      <template v-slot:no-data>
        <v-alert :type="error ? 'error' : 'info'" class="mt-4">
          {{ noDataMessage }}
        </v-alert>
      </template>

      <template v-slot:item.semestre="{ item }">
        {{ formatSemestre(item.semestre) }}
      </template>

      <template v-slot:item.calificacion="{ item }">
        <v-chip :color="getColorCalificacion(item.calificacion)" dark small>
          {{ item.calificacion || 'N/A' }}
        </v-chip>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  asignaturaId: {
    type: String,
    default: null
  }
});

const headers = [
  { title: 'Matrícula', key: 'estudianteId', width: '120px' },
  { title: 'Semestre', key: 'semestre', align: 'center', width: '120px' },
  { title: 'Calificación', key: 'calificacion', align: 'center', width: '120px' },
  { title: 'Fecha', key: 'fecha', align: 'center', width: '150px' }
];

const inscripciones = ref([]);
const asignaturaSeleccionada = ref(null);
const loading = ref(false);
const error = ref(null);
const noDataMessage = ref('Seleccione una asignatura para ver inscripciones');

const formatSemestre = (semestre) => {
  if (!semestre) return 'N/A';
  const str = semestre.toString();
  return `${str.substring(0, 4)}-${str.substring(4)}`;
};

const formatFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString();
};

const getColorCalificacion = (calificacion) => {
  if (!calificacion) return 'grey';
  if (calificacion >= 8) return 'green';
  if (calificacion >= 6) return 'orange';
  return 'red';
};

const fetchInscripciones = async (asignaturaId) => {
  if (!asignaturaId) {
    inscripciones.value = [];
    noDataMessage.value = 'Seleccione una asignatura para ver inscripciones';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    inscripciones.value = [];
    noDataMessage.value = 'Cargando inscripciones...';
    
    const response = await fetch(`https://localhost:3000/inscripciones?asignaturaId=${asignaturaId}`);
    
    if (!response.ok) {
      throw new Error(response.status === 404 
        ? 'No se encontraron inscripciones' 
        : 'Error al cargar inscripciones');
    }
    
    const result = await response.json();
    
    if (result.status !== 'success') {
      throw new Error(result.message || 'Error en la respuesta del servidor');
    }

    inscripciones.value = result.data.map(inscripcion => ({
      ...inscripcion,
      fecha: formatFecha(inscripcion.createdAt)
    }));
    
    noDataMessage.value = result.data.length === 0 
      ? 'No hay inscripciones para esta asignatura'
      : '';
    
  } catch (err) {
    error.value = err.message;
    noDataMessage.value = err.message;
    inscripciones.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.asignaturaId, (newVal) => {
  fetchInscripciones(newVal);
}, { immediate: true });
</script>

<style scoped>
.inscripciones-table {
  border: thin solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  margin-top: 20px;
}

.inscripciones-table :deep(.v-data-table__wrapper) {
  overflow-y: auto;
}

.inscripciones-table :deep(.v-chip) {
  font-size: 0.875rem;
  height: 24px;
}
</style>