<script setup>
import { ref } from 'vue';

const emit = defineEmits(['search', 'clear']);
const query = ref('');

function emitSearch() {
  emit('search', query.value);
}

function emitClear() {
  emit('clear');
}
</script>

<template>
  <v-text-field
    v-model="query"
    @keydown.enter="emitSearch"
    @blur="emitSearch"
    label="Buscar"
    clearable
    @click:clear="emitClear"
  />
</template>
