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
import { ref, computed } from 'vue';
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

const forceReloadCurrentRoute = () => {
  const { fullPath } = route;
  router.replace('/empty').then(() => {
    setTimeout(() => router.replace(fullPath), 100);
  });
};

const handleItemClick = (action) => {
  emit('update-placeholder', action);
  
  const currentRoute = route.path;
  const targetRoute = getRouteForAction(action);
  const isCurrentRoute = currentRoute === targetRoute;

  if (isCurrentRoute) {
    forceReloadCurrentRoute();
  } else {
    if (action === 'estudiantes') {
      router.push('/paginaBorrarEst');
    } else if (action === 'docentes') {
      router.push('/paginaBorrarDoc');
    } else if (action === 'asignaturas') {
      router.push('/paginaBorrarAsig');
    } else {
      emit(`${action}-action`);
    }
  }
};

const getRouteForAction = (action) => {
  switch(action) {
    case 'estudiantes': return '/paginaBorrarEst';
    case 'docentes': return '/paginaBorrarDoc';
    case 'asignaturas': return '/paginaBorrarAsig';
    default: return '';
  }
};
</script>