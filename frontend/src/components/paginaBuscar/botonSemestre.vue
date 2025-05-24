<template>
  <div class="d-flex align-center gap-2">
    <v-text-field
      v-model="claveLocal"
      :placeholder="placeholder"
      outlined
      dense
      clearable
      hide-details
      @keyup.enter="handleSearch"
      @click:clear="resetSearch"
      class="flex-grow-1"
    >
      <template v-slot:append>
        <v-btn icon color="primary" @click="handleSearch">
          <v-icon>mdi-magnify</v-icon>
        </v-btn>
      </template>
    </v-text-field>

    <v-select
      v-if="semestres.length > 0"
      :items="semestres"
      v-model="semestreSeleccionado"
      label="Semestre"
      dense
      hide-details
      style="max-width: 150px"
      @update:modelValue="emitirSeleccion"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  claveAsignatura: {
    type: String,
    default: ''
  }
});
const emit = defineEmits(['search', 'reset']);

const claveLocal = ref(props.claveAsignatura);
const placeholder = ref('Buscar por clave de asignatura...');
const semestres = ref([]);
const semestreSeleccionado = ref(null);

const handleSearch = async () => {
  if (!claveLocal.value) return;

  try {
    const response = await fetch(`https://localhost:3000/inscripciones?clave=${claveLocal.value}`);
    if (!response.ok) throw new Error('Error al buscar inscripciones');

    const result = await response.json();
    semestres.value = [...new Set(result.data.map(ins => ins.semestre))];
    semestreSeleccionado.value = null;

    emit('search', {
      clave: claveLocal.value,
      semestres: semestres.value
    });

  } catch (err) {
    console.error(err);
    semestres.value = [];
    emit('search', {
      clave: claveLocal.value,
      semestres: [],
      error: err.message
    });
  }
};

const resetSearch = () => {
  claveLocal.value = '';
  semestres.value = [];
  semestreSeleccionado.value = null;
  emit('reset');
};

const emitirSeleccion = () => {
  emit('search', {
    clave: claveLocal.value,
    semestre: semestreSeleccionado.value
  });
};
</script>

<style scoped>
.d-flex {
  display: flex;
}
.gap-2 {
  gap: 8px;
}
</style>
