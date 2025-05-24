<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="formattedStudentData"
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
  matricula: {
    type: String,
    default: null
  }
});

const headers = [
  { title: 'Matrícula', key: 'matricula', width: '120px' },
  { title: 'Nombre', key: 'nombre', width: '200px' },
  { title: 'Email', key: 'email' }
];

const studentData = ref(null);
const loading = ref(false);
const error = ref(null);
const noDataMessage = ref('Ingrese una matrícula para buscar');

const formattedStudentData = computed(() => {
  if (!studentData.value) return [];
  
  return [{
    matricula: studentData.value.matricula,
    nombre: studentData.value.persona.nombre,
    email: studentData.value.persona.email
  }];
});

const fetchStudent = async (matricula) => {
  if (!matricula) {
    studentData.value = null;
    noDataMessage.value = 'Ingrese una matrícula para buscar';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    noDataMessage.value = 'Cargando datos del estudiante...';
    
    const response = await fetch(`/api/estudiantes/${matricula}`);
    
    if (!response.ok) {
      throw new Error(response.status === 404 
        ? `No se encontró el estudiante con matrícula ${matricula}` 
        : 'Error al cargar datos del estudiante');
    }
    
    const data = await response.json();
    studentData.value = data;
    noDataMessage.value = 'No se encontraron datos para este estudiante';
    
  } catch (err) {
    error.value = err.message;
    noDataMessage.value = err.message;
    studentData.value = null;
  } finally {
    loading.value = false;
  }
};

watch(() => props.matricula, (newVal) => {
  fetchStudent(newVal);
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