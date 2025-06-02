<template>
  <v-app>
    <AppBar @toggle-drawer="drawer = !drawer" />
    <AppDrawer v-model="drawer" />
    <v-main :style="{ 'margin-left': drawer ? '0px' : '64px', 'transition': 'margin-left 0.3s ease' }">
      <v-container fluid class="pa-4">
        <v-row class="align-center">
          <!-- <v-col class="flex-grow-0 pr-2">
            <DropdownButton
              @edit-action="handleAsignaturasSelection"
              @delete-action="resetView"
              @share-action="resetView"
              @update-placeholder="searchPlaceholder = $event"
              initial-selection="asignaturas"
            />
          </v-col> -->

          <v-col md="3" class="d-flex justify-end">
            <BotonBuscarAsignatura :clave="searchQuery" @search="redirectToAsignaturaSection" />
          </v-col>
        </v-row>

        <v-alert v-if="searchError" type="error" class="mb-4">
          {{ searchError }}
        </v-alert>

        <v-row v-if="!mostrarDetalles">
          <v-col cols="12">
            <TablaPrincipalAsignaturas :items="filteredAsignaturas" class="mb-4" />
          </v-col>
        </v-row>

        <template v-if="mostrarDetalles">
          <v-btn color="primary" class="mb-4" @click="returnToList">
            <v-icon left>mdi-arrow-left</v-icon>
            Volver a la lista
          </v-btn>
          <v-row>
            <v-col cols="12" md="6">
              <TablaDetalleAsignatura :clave="currentClaveAsignatura" class="mb-4" />
              <TablaEstudiantesAsignatura :clave="currentClaveAsignatura" class="mt-4" />
            </v-col>

            <v-col cols="12" md="6">
              <TablaDocentesAsignatura :clave="currentClaveAsignatura" class="mb-4" />
            </v-col>
          </v-row>
        </template>

      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';


import AppBar from '@/components/AppBar.vue';
import AppDrawer from '@/components/drawer.vue';

import DropdownButton from '@/components/paginaCompleta/dropDownButtonCom.vue';

import TablaPrincipalAsignaturas from '@/components/paginaCompleta/tablaPrincipalAsigCom.vue';
import TablaDocentesAsignatura from '@/components/paginaCompleta/tablaSecundariaAsigCom.vue';
import TablaEstudiantesAsignatura from '@/components/paginaCompleta/tablaTerciariaAsigCom.vue';
import TablaDetalleAsignatura from '@/components/paginaCompleta/tablaDeUnRegistroAsigCom.vue';

import BotonBuscarAsignatura from '@/components/paginaBuscar/botonBuscarEst.vue';
import { useAsignaturaData } from '@/composables/asignaturaData';

const drawer = ref(true);
const router = useRouter();
const searchError = ref(null);
const searchQuery = ref('');
const mostrarDetalles = ref(false);
const currentClaveAsignatura = ref('');

const {
  searchPlaceholder,
  filteredAsignaturas,
  handleAsignaturasSelection,
  resetView,
  resetSearch
} = useAsignaturaData();

const handleSearch = (clave) => {
  searchQuery.value = clave;
};

const redirectToAsignaturaSection = (clave) => {
  if (!clave || clave.trim() === '') {
    searchError.value = 'Por favor ingresa una clave de asignatura válida';
    return;
  }

  searchQuery.value = clave.trim();
  currentClaveAsignatura.value = clave.trim();
  mostrarDetalles.value = true;
};

const returnToList = () => {
  mostrarDetalles.value = false;
  currentClaveAsignatura.value = '';
  handleAsignaturasSelection();
};

onMounted(() => {
  handleAsignaturasSelection();
});
</script>
