<template>
    <div>
      <div class="d-flex justify-end mb-2">
        <!--BOTON-->
        <v-btn
          color="primary"
          @click="fetchInscripciones(matricula)"
          :disabled="loading"
          prepend-icon="mdi-refresh"
        >
          Recargar
        </v-btn>
      </div>

    <!--TABLA-->
      <v-data-table
        :headers="headers"
        :items="docentesPorAsignatura"
        :loading="loading"
        hide-default-footer
        class="docentes-table"
      >
        <template v-slot:loading>
          <v-progress-linear indeterminate color="primary"></v-progress-linear>
        </template>
  
        <template v-slot:no-data>
          <div class="text-caption text-grey">
            {{ noDataMessage }}
          </div>
        </template>
  
        <template v-slot:item.semestres="{ item }">
          <div>
            {{ item.semestres.join(', ') }}
          </div>
        </template>
  
        <template v-slot:item.docentes="{ item }">
          <div v-if="item.docentes.length > 0">
            {{ item.docentes.map(d => d.nombre).join(', ') }}
          </div>
          <span v-else class="text-grey">Sin docentes asignados</span>
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
  { title: 'Clave', value: 'clave' },
  { title: 'Asignatura', value: 'semestres' },
  { title: 'Docente(s)', value: 'docentes' }
];
  
  const docentesPorAsignatura = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const noDataMessage = ref('No hay datos disponibles');
  
async function fetchDocente(numEmpleado) {
  try {
    const response = await fetch(`https://localhost:3000/contratos/${numEmpleado}`);
    if (!response.ok) throw new Error('Error al obtener docente');
    const result = await response.json();
    console.log('Respuesta docente:', result);

    if (result.status !== 'success') throw new Error('Error en respuesta docente');

    if (Array.isArray(result.data) && result.data.length > 0) {
      console.log('Primer contrato:', result.data[0]);
      return result.data[0].docente?.persona?.nombre || 'Sin nombre';
    } else if (result.data?.docente) {
      return result.data.docente.persona.nombre || 'Sin nombre';
    }
    return 'Sin nombre';

  } catch (e) {
    console.error(e);
    return 'Sin nombre';
  }
}

async function fetchDocentesDeAsignatura(claveAsignatura) {
  try {
    const response = await fetch(`https://localhost:3000/contratos/asignaturas/${claveAsignatura}`);
    if (!response.ok) return [];
    const result = await response.json();
    if (result.status !== 'success') return [];

    const docentes = result.data.map(d => ({
      numEmpleado: d.numEmpleado,
      nombre: d.nombre || 'Sin nombre'
    }));

    return docentes;

  } catch (err) {
    console.error('Error fetching contratos docentes:', err);
    return [];
  }
}

  async function fetchInscripciones(matricula) {
    if (!matricula) return;
  
    try {
      loading.value = true;
      docentesPorAsignatura.value = [];
  
      const response = await fetch(`https://localhost:3000/inscripciones/estudiante/${matricula}`);
      if (!response.ok) throw new Error('Error al obtener inscripciones');
  
      const result = await response.json();
      if (result.status !== 'success') throw new Error('Error en respuesta inscripciones');
  
      const agrupado = {};
  
      for (const inscripcion of result.data) {
        const clave = inscripcion.asignatura.clave;
        const semestre = inscripcion.semestre;
  
        if (!agrupado[clave]) {
          agrupado[clave] = {
            clave,
            semestres: new Set(),
            docentes: []
          };
        }
        agrupado[clave].semestres.add(semestre);
      }
  
      const promises = Object.values(agrupado).map(async asignatura => {
        asignatura.semestres = Array.from(asignatura.semestres).sort();
        asignatura.docentes = await fetchDocentesDeAsignatura(asignatura.clave);
        return asignatura;
      });
  
      docentesPorAsignatura.value = await Promise.all(promises);
  
      if (docentesPorAsignatura.value.length === 0) {
        noDataMessage.value = 'No hay datos disponibles';
      }
    } catch (error) {
      console.error(error);
      noDataMessage.value = 'Error al cargar datos';
    } finally {
      loading.value = false;
    }
  }
  
  watch(() => props.matricula, (newVal) => {
    if (newVal) fetchInscripciones(newVal);
  }, { immediate: true });
  
  </script>
  
  <style scoped>
  .docentes-table {
    border: thin solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
  }
  
  .docentes-table :deep(td) {
    white-space: normal;
    word-break: normal;
  }
  </style>
  