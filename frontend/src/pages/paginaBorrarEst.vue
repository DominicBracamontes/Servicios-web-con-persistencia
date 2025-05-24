<template>
  <v-app>
    <AppBar @toggle-drawer="drawer = !drawer" />
    <AppDrawer v-model="drawer" />
    <v-main>
      <v-container fluid class="pa-4">
        <v-row class="align-center">
          <v-col class="flex-grow-0 pr-2">
            <DropdownButton
              @edit-action="handleEstudiantesSelection"
              @delete-action="resetView"
              @share-action="resetView"
              @update-placeholder="searchPlaceholder = $event"
              initial-selection="estudiantes"
            />
          </v-col>

          <v-col md="3" class="d-flex justify-end">
            <BotonBuscar
              :matricula="searchQuery"
              @search="redirectToStudentSection"
            />
          </v-col>
        </v-row>

        <v-alert v-if="searchError" type="error" class="mb-4">
          {{ searchError }}
        </v-alert>

        <v-row v-if="!mostrarDetalles">
          <v-col cols="12">
            <TablaPrincipal 
              :items="filteredStudents"
              class="mb-4"
              @refresh-data="handleEstudiantesSelection"
            />
          </v-col>
        </v-row>

        <template v-if="mostrarDetalles">
          <v-row>
            <v-col cols="12">
              <tablaDeUnRegistroBorrarEst 
                :matricula="currentMatricula"
                class="mb-4"
                @student-deleted="handleStudentDeleted"
                @return-to-list="mostrarDetalles = false"
              />
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
import DropdownButton from '@/components/paginaBorrar/dropDownButtonBorrar.vue';
import TablaPrincipal from '@/components/paginaBorrar/tablaBorrarEst.vue';
import BotonBuscar from '@/components/paginaBuscar/botonBuscarEst.vue';
import { useStudentData } from '@/composables/studentData';

const router = useRouter();
const searchError = ref(null);
const searchQuery = ref('');
const mostrarDetalles = ref(false);
const currentMatricula = ref('');

const {
  drawer,
  searchPlaceholder,
  filteredStudents,
  handleEstudiantesSelection,
  resetView,
  resetSearch
} = useStudentData();

const handleSearch = (matriculaIngresada) => {
  searchQuery.value = matriculaIngresada;
};

const redirectToStudentSection = (matricula) => {
  if (!matricula || matricula.trim() === '') {
    searchError.value = 'Por favor ingresa una matrícula válida';
    return;
  }
  currentMatricula.value = matricula.trim();
  mostrarDetalles.value = true;
  searchError.value = null;
};

const handleStudentDeleted = (matricula) => {
  handleEstudiantesSelection();
};

onMounted(() => {
  handleEstudiantesSelection();
});
</script>

<style scoped>
</style>