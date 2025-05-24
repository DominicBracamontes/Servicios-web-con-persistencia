<template>
  <v-menu>
    <template v-slot:activator="{ props }">
      <v-btn v-bind="props" color="primary">
        {{ currentPlaceholder }}
      </v-btn>
    </template>
    <v-list>
      <v-list-item 
        v-for="(item, index) in items" 
        :key="index"
        @click="handleItemClick(item.action)"
      >
        <v-list-item-title>{{ item.title }}</v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const emit = defineEmits(['edit-action', 'delete-action', 'share-action', 'update-placeholder']);

const items = [
  { title: 'Estudiantes', action: 'estudiantes' },
  { title: 'Docentes', action: 'docentes' },
  { title: 'Asignaturas', action: 'asignaturas' },
];

const currentPlaceholder = ref('Registros');

const forcePageReload = (path) => {
  router.replace('/refresh').then(() => {
    setTimeout(() => router.replace(path), 50);
  });
};

const handleItemClick = (action) => {
  emit('update-placeholder', action);
  
  const targetPath = getTargetPath(action);
  const isCurrentPage = route.path === targetPath;

  if (isCurrentPage) {
    forcePageReload(targetPath);
  } else {
    router.push(targetPath);
  }
};

const getTargetPath = (action) => {
  switch(action) {
    case 'estudiantes': return '/paginaBuscarEstudiante';
    case 'docentes': return '/paginaBuscarDoce';
    case 'asignaturas': return '/paginaBuscarAsig';
    default: return '/';
  }
};
</script>