<template>
  <div>
    <v-alert v-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <template v-if="!loading && asignaturas.length > 0">
      <v-data-table-virtual
        :headers="headers"
        :items="asignaturas"
        :item-height="50"
        height="auto"
        fixed-header
        class="compact-table"
      >
        <template v-slot:default="{ item }">
          <tr>
            <td>{{ item.clave }}</td>
            <td>{{ item.nombre }}</td>
            <td class="text-center">{{ item.creditos }}</td>
          </tr>
        </template>

        <template v-slot:bottom>
          <div class="text-caption text-right pa-2">
            Mostrando {{ asignaturas.length }} registros
          </div>
        </template>
      </v-data-table-virtual>
    </template>

    <v-alert
      v-else-if="!loading && asignaturas.length === 0"
      type="info"
      class="mt-4"
    >
      No hay asignaturas disponibles
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
  { title: 'Clave', key: 'clave', width: '120px' },
  { title: 'Asignatura', key: 'nombre', width: '200px' },
  { title: 'Créditos', key: 'creditos', align: 'center', width: '100px' },
];

const asignaturas = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchAsignaturas = async () => {
  try {
    loading.value = true;
    error.value = null;
    asignaturas.value = [];

    const response = await fetch('https://localhost:3000/asignaturas');

    if (!response.ok) throw new Error('Error al cargar datos');

    const data = await response.json();
    asignaturas.value = data.map(item => ({
      clave: item.clave,
      nombre: item.nombre,
      creditos: item.creditos
    }));

  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchAsignaturas);
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

.compact-table :deep(th:nth-child(3)),
.compact-table :deep(td:nth-child(3)) {
  text-align: center;
}
</style>
