<template>
    <div>
      <div class="d-flex align-center mb-4">
        <v-select
          v-model="selectedSemester"
          :items="availableSemesters"
          label="Seleccionar semestre"
          outlined
          dense
          hide-details
          class="mr-4"
          style="max-width: 200px;"
          @update:modelValue="filterDocentes"
        ></v-select>
      </div>
  
      <v-data-table
        :headers="headers"
        :items="filteredDocentesPorAsignatura"
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
  
        <template v-slot:item.docentes="{ item }">
          <div v-if="item.docentes.length > 0">
            <v-chip
              v-for="(docente, index) in item.docentes"
              :key="index"
              small
              class="ma-1"
            >
              {{ docente }}
            </v-chip>
          </div>
          <span v-else class="text-grey">Sin docentes asignados</span>
        </template>
  
        <template v-slot:item.semestre="{ item }">
          {{ formatSemester(item.semestre) }}
        </template>
      </v-data-table>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  
  const props = defineProps({
    matricula: {
      type: String,
      required: true
    }
  });
  
  const headers = [
    { title: 'Clave', key: 'clave', width: '100px' },
    { title: 'Asignatura', key: 'asignatura' },
    { title: 'Semestre', key: 'semestre', width: '120px' },
    { title: 'Docentes', key: 'docentes' }
  ];
  
  const docentesPorAsignatura = ref([]);
  const filteredDocentesPorAsignatura = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const noDataMessage = ref('No hay datos disponibles');
  const selectedSemester = ref(null);
  const availableSemesters = ref([]);
  
  const formatSemester = (semester) => {
    return semester.toString().replace(/(\d{4})(\d{1})/, '$1-$2');
  };
  
  const fetchContratos = async (claveAsignatura) => {
    try {
      const response = await fetch(`https://localhost:3000/contratos?asignaturaId=${claveAsignatura}`);
      
      if (!response.ok) return [];
      
      const result = await response.json();
      if (result.status !== 'success') return [];
      
      return result.data.map(contrato => 
        contrato.docente?.persona?.nombre || 'Sin nombre'
      ).filter(Boolean);
      
    } catch (err) {
      console.error('Error fetching contratos:', err);
      return [];
    }
  };
  
  const fetchInscripciones = async (matricula) => {
    if (!matricula) return;
  
    try {
      loading.value = true;
      docentesPorAsignatura.value = [];
      
      const response = await fetch(`https://localhost:3000/inscripciones/estudiante/${matricula}`);
      if (!response.ok) throw new Error();
      
      const result = await response.json();
      if (result.status !== 'success') throw new Error();
  
      const processedData = await Promise.all(
        result.data.map(async inscripcion => ({
          clave: inscripcion.asignatura.clave,
          asignatura: inscripcion.asignatura.nombre,
          semestre: inscripcion.semestre,
          docentes: await fetchContratos(inscripcion.asignatura.clave)
        }))
      );
      
      docentesPorAsignatura.value = processedData;
      filteredDocentesPorAsignatura.value = processedData;
      
      availableSemesters.value = [...new Set(
        processedData.map(item => item.semestre)
      )].sort().reverse().map(formatSemester);
      
    } catch {
      noDataMessage.value = 'Error al cargar datos';
    } finally {
      loading.value = false;
    }
  };
  
  const filterDocentes = () => {
    if (!selectedSemester.value) {
      filteredDocentesPorAsignatura.value = docentesPorAsignatura.value;
      return;
    }
  
    const semesterNum = selectedSemester.value.replace('-', '');
    filteredDocentesPorAsignatura.value = docentesPorAsignatura.value.filter(
      item => item.semestre.toString() === semesterNum
    );
  };
  
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
  
  .semester-select {
    max-width: 200px;
  }
  </style>