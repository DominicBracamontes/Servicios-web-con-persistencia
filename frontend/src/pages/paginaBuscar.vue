<template>
  <v-app>
    <AppBar @toggle-drawer="drawer = !drawer" />
    <AppDrawer v-model="drawer" />
    <v-main>
      <v-container fluid class="pa-4">
        <v-row class="align-center" no-gutters>
          <v-col class="flex-grow-0 pr-2">
            <dropDownButton
              @edit-action="handleEstudiantesSelection"
              @delete-action="resetView"
              @share-action="resetView"
              @update-placeholder="searchPlaceholder = $event"
            />
          </v-col>

          
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref } from 'vue';
import AppBar from '@/components/AppBar.vue';
import AppDrawer from '@/components/drawer.vue';
import DropdownButton from '@/components/paginaBuscar/dropDownButton.vue';
import SearchBar from '@/components/paginaBuscar/SearchBar.vue';
import { useStudentData } from '@/composables/studentData';

const {
  drawer,
  searchPlaceholder,
  handleEstudiantesSelection,
  resetView,
  handleSearch,
  resetSearch
} = useStudentData();
</script>