<template>
  <div>
    <v-data-table
      :headers="headers"
      :items="docentes"
      :loading="loading"
      hide-default-footer
      class="docentes-table"
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
  clave: {
    type: String,
    required: true
  }
});

const headers = [
  { title: 'Clave', key: 'clave', width: '100px' },
  { title: 'Docente', key: 'docente', width: '200px' },
  { title: 'Email', key: 'email', width: '250px' }
];

const docentes = ref([]);
const loading = ref(false);
const error = ref(null);
const noDataMessage = ref('Ingrese una clave para buscar docentes');

const fetchDocentesPorAsignatura = async (clave) => {
  if (!clave) {
    docentes.value = [];
    noDataMessage.value = 'Ingrese una clave para buscar docentes';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    docentes.value = [];
    noDataMessage.value = 'Cargando docentes...';

    const contratosRes = await fetch(`https://localhost:3000/contratos?clave=${clave}&_=${Date.now()}`);
    if (!contratosRes.ok) {
      throw new Error('Error al cargar contratos');
    }

    const contratosData = await contratosRes.json();
    const contratos = contratosData.data ?? [];

    if (contratos.length === 0) {
      noDataMessage.value = 'No hay docentes asignados a esta asignatura';
      return;
    }

    const docentesPromises = contratos.map(async contrato => {
      const docenteRes = await fetch(`https://localhost:3000/docentes/${contrato.docenteId}`);
      if (!docenteRes.ok) {
        throw new Error(`Error al cargar docente ${contrato.docenteId}`);
      }
      const docenteData = await docenteRes.json();
      return {
        clave: contrato.asignatura?.clave ?? clave,
        docente: docenteData?.persona?.nombre ?? 'Desconocido',
        email: docenteData?.persona?.email ?? 'Sin email'
      };
    });

    docentes.value = await Promise.all(docentesPromises);
    noDataMessage.value = 'No hay docentes para mostrar';

  } catch (err) {
    error.value = err.message;
    noDataMessage.value = err.message;
    docentes.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.clave, (newVal) => {
  if (newVal) {
    fetchDocentesPorAsignatura(newVal);
  }
}, { immediate: true });
</script>

<style scoped>
.docentes-table {
  border: thin solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  margin-top: 20px;
}
</style>
