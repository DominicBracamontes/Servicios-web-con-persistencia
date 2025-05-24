<template>
  <v-app>
    <AppBar @toggle-drawer="drawer = !drawer" />
    <AppDrawer v-model="drawer" />
    <v-main>
      <v-container fluid class="pa-4">
        <v-row class="align-center">
          <v-col class="flex-grow-0 pr-2">
            <DropdownButton
              @edit-action="handleDocentesSelection"
              @delete-action="resetView"
              @share-action="resetView"
              @update-placeholder="searchPlaceholder = $event"
              initial-selection="docentes"
            />
          </v-col>

          <v-col md="3" class="d-flex justify-end">
            <BotonBuscarDoc
              :num-empleado="searchQuery"
              @search="redirectToDocenteSection"
            />
          </v-col>
        </v-row>

        <v-alert v-if="searchError" type="error" class="mb-4">
          {{ searchError }}
        </v-alert>

        <v-row v-if="!mostrarDetalles">
          <v-col cols="12">
            <TablaPrincipalDoc 
              :items="filteredDocentes"
              class="mb-4"
            />
          </v-col>
        </v-row>

        <template v-if="mostrarDetalles">
          <v-row>
            <v-col>
              <tablaDeUnRegistroBorrarDoc 
                :num-empleado="currentNumEmp"
                class="mb-4"
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
import DropdownButton from '@/components/paginaBuscar/dropDownButton.vue';
import TablaPrincipalDoc from '@/components/paginaBuscarDocente/tablaPrincipalDoc.vue';
import TablaSecundariaDoc from '@/components/paginaBuscarDocente/tablaSecundariaDoc.vue';
import TablaTerciariaDoc from '@/components/paginaBuscarDocente/tablaTerciariaDoc.vue';
import BotonBuscarDoc from '@/components/paginaBuscar/botonBuscarEst.vue';
import tablaDeUnRegistroDoc from '@/components/paginaBorrar/tablaDeUnRegistroBorrarDoc.vue';
import { useDocenteData } from '@/composables/docenteData';

const router = useRouter();
const searchError = ref(null);
const searchQuery = ref('');
const mostrarDetalles = ref(false);
const currentNumEmp = ref('');

const {
  drawer,
  searchPlaceholder,
  filteredDocentes,
  handleDocentesSelection,
  resetView,
  resetSearch
} = useDocenteData();

const handleSearch = (numEmpleado) => {
  searchQuery.value = numEmpleado;
};

const redirectToDocenteSection = (numEmpleado) => {
  if (!numEmpleado || numEmpleado.trim() === '') {
    searchError.value = 'Por favor ingresa un número de empleado válido';
    return;
  }
  currentNumEmp.value = numEmpleado.trim();
  mostrarDetalles.value = true;
  searchError.value = null;
};

onMounted(() => {
  handleDocentesSelection();
});
</script>

<style scoped>
.v-alert {
  margin-bottom: 16px;
}
</style>