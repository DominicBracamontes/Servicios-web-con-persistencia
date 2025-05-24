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

        
        <v-row v-if="!mostrarDetalles">
          <v-col cols="12">
            <TablaPrincipal 
              :items="filteredStudents"
              class="mb-4"
              @row-click="showStudentDetails"
            />
          </v-col>
        </v-row>

        <template v-if="mostrarDetalles">
          <v-btn
            color="primary"
            class="mb-4"
            @click="returnToList"
          >
            <v-icon left>mdi-arrow-left</v-icon>
            Volver a la lista
          </v-btn>

          <v-row>
            <v-col cols="12" md="7">
              <tablaDeUnRegistroEstCom 
                :matricula="currentMatricula"
                class="mb-4"
                @student-deleted="handleStudentDeleted"
                @return-to-list="returnToList"
              />

              <TablaSecundariaEst 
                :matricula="currentMatricula"
                class="mb-4"
              />
            </v-col>

            <v-col cols="12" md="5">
              <TablaTerciariaEst 
                :matricula="currentMatricula"
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
import DropdownButton from '@/components/paginaCompleta/dropDownButtonCom.vue';
import TablaPrincipal from '@/components/paginaCompleta/tablaPrincipalEstCom.vue';
import TablaSecundariaEst from '@/components/paginaCompleta/TablaSecundariEstCom.vue';
import TablaTerciariaEst from '@/components/paginaCompleta/tablaTerciariaEstCom.vue';
import BotonBuscar from '@/components/paginaBuscar/botonBuscarEst.vue';
import tablaDeUnRegistroEstCom from '@/components/paginaCompleta/tablaDeUnRegistroEstCom.vue';

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
  resetSearch,
  loadStudents
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
};

const showStudentDetails = (student) => {
  currentMatricula.value = student.matricula;
  mostrarDetalles.value = true;
};

const returnToList = () => {
  mostrarDetalles.value = false;
  currentMatricula.value = '';
  loadStudents();
};

const handleStudentDeleted = (matricula) => {
  console.log(`Estudiante ${matricula} eliminado`);
};

onMounted(() => {
  handleEstudiantesSelection();
});
</script>

<style scoped>
.v-btn {
  margin-bottom: 20px;
}
</style>