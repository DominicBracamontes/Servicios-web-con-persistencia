<template>
  <v-text-field
    v-model="numEmpleado"
    :placeholder="placeholder"
    outlined
    dense
    hide-details
    single-line
    class="search-field"
    @keyup.enter="handleSearch"
  >
    <template v-slot:append>
      <v-btn
        color="primary"
        @click="handleSearch"
        :disabled="!numEmpleado"
      >
        Buscar
      </v-btn>
    </template>
  </v-text-field>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Buscar por número de empleado'
  },
  numEmpleado: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['search']);

const numEmpleado = ref('');

const handleSearch = () => {
  if (numEmpleado.value.trim()) {
    emit('search', numEmpleado.value.trim());
  }
};

watch(() => props.numEmpleado, (newVal) => {
  numEmpleado.value = newVal;
}, { immediate: true });
</script>

<style scoped>
.search-field {
  max-width: 300px;
  margin-left: auto;
}

.search-field :deep(.v-input__control) {
  min-height: 40px !important;
}

.search-field :deep(.v-input__slot) {
  margin-bottom: 0 !important;
}
</style>