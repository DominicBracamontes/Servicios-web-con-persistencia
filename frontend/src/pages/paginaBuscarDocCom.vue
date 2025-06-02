<template>
  <v-app>
    <AppBar @toggle-drawer="drawer = !drawer" />
    <AppDrawer v-model="drawer" />

    <v-main :style="{ 'margin-left': drawer ? '0px' : '64px', 'transition': 'margin-left 0.3s ease' }"> <v-container fluid
        class="pa-4">
        <v-row class="align-center">
          <!-- <v-col class="flex-grow-0 pr-2">
            <DropdownButton
              @edit-action="handleDocentesSelection"
              @delete-action="resetView"
              @share-action="resetView"
              @update-placeholder="searchPlaceholder = $event"
              initial-selection="docentes"
            />
          </v-col> -->

          <v-col md="3" class="d-flex justify-end">
            <BotonBuscar :num-empleado="searchQuery" @search="redirectToDocenteSection" />
          </v-col>
        </v-row>

        <v-alert v-if="searchError" type="error" dismissible @input="searchError = null" class="mb-4">
          {{ searchError }}
        </v-alert>

        <v-row v-if="!mostrarDetalles">
          <v-col cols="12">
            <TablaPrincipal :items="filteredDocentes" class="mb-4" @row-click="showDocenteDetails" />
          </v-col>
        </v-row>

        <template v-if="mostrarDetalles">
          <v-btn color="primary" class="mb-4" @click="returnToList">
            <v-icon left>mdi-arrow-left</v-icon>
            Volver a la lista
          </v-btn>

          <v-row>
            <v-col cols="12" md="8">
              <TablaDeUnRegistroDocCom :num-empleado="currentNumEmp" class="mb-4" @return-to-list="returnToList" />
            </v-col>

            <v-col cols="12" md="4">
              <TablaTerciariaDoc :num-empleado="currentNumEmp" />
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
const drawer = ref(true);

import AppBar from '@/components/AppBar.vue';
import AppDrawer from '@/components/drawer.vue';

import DropdownButton from '@/components/paginaCompleta/dropDownButtonCom.vue';

import TablaPrincipal from '@/components/paginaCompleta/tablaPrincipalDocCom.vue';
import TablaTerciariaDoc from '@/components/paginaCompleta/tablaTerciariaDocCom.vue';
import TablaDeUnRegistroDocCom from '@/components/paginaCompleta/tablaDeUnRegistroDocCom.vue';

import BotonBuscar from '@/components/paginaBuscar/botonBuscarEst.vue';

import { useDocenteData } from '@/composables/docenteData';

const router = useRouter();
const searchError = ref(null);
const searchQuery = ref('');
const mostrarDetalles = ref(false);
const currentNumEmp = ref('');

const {
  searchPlaceholder,
  filteredDocentes,
  handleDocentesSelection,
  resetView,
  resetSearch,
  loadDocentes
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

const showDocenteDetails = (docente) => {
  currentNumEmp.value = docente.numEmpleado;
  mostrarDetalles.value = true;
};

const returnToList = () => {
  mostrarDetalles.value = false;
  currentNumEmp.value = '';
  loadDocentes();
};

const handleDocenteDeleted = (numEmpleado) => {
  console.log(`Docente ${numEmpleado} eliminado`);
  returnToList();
};

onMounted(() => {
  handleDocentesSelection();
});
</script>

<style scoped>
.v-navigation-drawer {
  z-index: 1000;
}

.v-main {
  margin-left: 0;
  transition: margin-left 0.3s ease;
}

.v-main--has-drawer {
  margin-left: 256px;
}
</style>