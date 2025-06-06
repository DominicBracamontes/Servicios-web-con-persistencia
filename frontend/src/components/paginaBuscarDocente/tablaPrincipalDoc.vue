<template>
  <div>
    <v-alert v-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <template v-if="!loading && docentes.length > 0">
      <v-data-table-virtual
        :headers="headers"
        :items="docentes"
        :item-height="50"
        height="auto"
        fixed-header
        class="compact-table"
      >
        <template v-slot:bottom>
          <div class="text-caption text-right pa-2">
            Mostrando {{ docentes.length }} registros
          </div>
        </template>
      </v-data-table-virtual>
    </template>

    <v-alert
      v-else-if="!loading && docentes.length === 0"
      type="info"
      class="mt-4"
    >
      No hay docentes disponibles
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
  { title: 'Núm. Empleado', key: 'numEmpleado', width: '120px' },
  { title: 'Nombre', key: 'nombre', width: '200px' },
  { title: 'Categoría', key: 'categoriaEmpleado' },
  { title: 'Email', key: 'email' }
];

const docentes = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchDocentes = async () => {
  try {
    loading.value = true;
    error.value = null;
    docentes.value = [];
    
    const response = await fetch('https://localhost:3000/docentes');
    
    if (!response.ok) throw new Error('Error al cargar docentes');
    
    const data = await response.json();
    
    docentes.value = data.map(item => ({
      numEmpleado: item.numEmpleado,
      nombre: item.persona?.nombre || 'No disponible',
      categoriaEmpleado: item.categoriaId?.toString() || 'Sin categoría',
      email: item.persona?.email || 'No disponible'
    }));
    
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchDocentes);
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