<template>
  <div>
    <v-alert v-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <template v-if="!loading && students.length > 0">
      <v-data-table-virtual
        :headers="headers"
        :items="students"
        :item-height="50"
        height="auto"
        fixed-header
        class="compact-table"
      >
        <template v-slot:bottom>
          <div class="text-caption text-right pa-2">
            Mostrando {{ students.length }} registros
          </div>
        </template>
      </v-data-table-virtual>
    </template>

    <v-alert
      v-else-if="!loading && students.length === 0"
      type="info"
      class="mt-4"
    >
      No hay estudiantes disponibles
    </v-alert>

    <v-progress-linear
      v-if="loading"
      indeterminate
      color="primary"
      class="mt-4"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const headers = [
  { title: 'Matrícula', key: 'matricula', width: '120px' },
  { title: 'Nombre', key: 'nombre', width: '200px' },
  { title: 'Email', key: 'email' },
];

const students = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchStudents = async () => {
  try {
    loading.value = true;
    error.value = null;
    students.value = [];
    
    const response = await fetch('https://localhost:3000/estudiantes');
    
    if (!response.ok) throw new Error('Error al cargar datos');
    
    const data = await response.json();
    students.value = data.map(item => ({
      matricula: item.matricula,
      nombre: item.persona.nombre,
      email: item.persona.email
    }));
    
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchStudents);
</script>

<style scoped>
.compact-table {
  max-height: 70vh;
  border: thin solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.compact-table :deep(.v-table__wrapper) {
  overflow-y: auto;
  max-height: calc(70vh - 48px);
}
</style>