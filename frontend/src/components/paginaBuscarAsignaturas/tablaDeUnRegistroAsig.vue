<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="formattedAsignaturaData"
      :loading="loading"
      hide-default-footer
      class="single-row-table"
    >
      <template v-slot:loading>
        <v-progress-linear indeterminate color="primary" />
      </template>

      <template v-slot:no-data>
        <v-alert :type="error ? 'error' : 'info'" class="mt-4">
          {{ noDataMessage }}
        </v-alert>
      </template>

      <template v-slot:item="{ item }">
        <tr>
          <td>{{ item.clave }}</td>
          <td>{{ item.nombre }}</td>
          <td class="text-center">{{ item.creditos }}</td>
        </tr>
      </template>
    </v-data-table>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  clave: {
    type: String,
    default: null
  }
});

const headers = [
  { title: 'Clave', key: 'clave', width: '120px' },
  { title: 'Asignatura', key: 'nombre', width: '250px' },
  { title: 'Créditos', key: 'creditos', align: 'center', width: '100px' }
];

const asignaturaData = ref(null);
const loading = ref(false);
const error = ref(null);
const noDataMessage = ref('Ingrese una clave para buscar');

const formattedAsignaturaData = computed(() => {
  if (!asignaturaData.value) return [];
  const { clave, nombre, creditos } = asignaturaData.value;
  return [{ clave, nombre, creditos }];
});

const fetchAsignatura = async (clave) => {
  if (!clave) {
    asignaturaData.value = null;
    noDataMessage.value = 'Ingrese una clave para buscar';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    noDataMessage.value = 'Cargando datos de la asignatura...';

    const response = await fetch(`/api/asignaturas/${clave}`);

    if (!response.ok) {
      throw new Error(
        response.status === 404
          ? `No se encontró la asignatura con clave ${clave}`
          : 'Error al cargar datos de la asignatura'
      );
    }

    const data = await response.json();
    asignaturaData.value = data;
    noDataMessage.value = 'No se encontraron datos para esta asignatura';

  } catch (err) {
    error.value = err.message;
    noDataMessage.value = err.message;
    asignaturaData.value = null;
  } finally {
    loading.value = false;
  }
};

watch(() => props.clave, (newVal) => {
  fetchAsignatura(newVal);
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

.single-row-table :deep(th:nth-child(3)),
.single-row-table :deep(td:nth-child(3)) {
  text-align: center;
}
</style>
