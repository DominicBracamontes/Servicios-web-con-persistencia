<template>
    <div>
      <v-data-table
        :headers="headers"
        :items="formattedAsignaturaData"
        :loading="loading"
        hide-default-footer
        class="single-row-table"
      >
        <template v-slot:loading>
          <v-progress-linear indeterminate color="primary" />
        </template>
  
        <template v-slot:no-data>
          <v-alert :type="error ? 'error' : 'info'" class="mt-4">
            {{ noDataMessage }}
          </v-alert>
        </template>
  
        <template v-slot:item="{ item }">
          <tr>
            <td>{{ item.clave }}</td>
            <td>{{ item.nombre }}</td>
            <td class="text-center">{{ item.creditos }}</td>
            <td class="text-center">
              <v-btn
                icon
                color="error"
                @click="confirmDelete(item.clave)"
                :loading="deleting"
                :disabled="deleting"
              >
                <v-icon>mdi-delete</v-icon>
              </v-btn>
            </td>
          </tr>
        </template>
      </v-data-table>
  
      <v-dialog v-model="deleteDialog" max-width="400">
        <v-card>
          <v-card-title class="text-h5">Confirmar eliminación</v-card-title>
          <v-card-text>
            ¿Estás seguro de que deseas eliminar la asignatura {{ asignaturaToDelete?.nombre }} ({{ asignaturaToDelete?.clave }})?
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" text @click="deleteDialog = false">Cancelar</v-btn>
            <v-btn color="error" text @click="deleteAsignatura" :loading="deleting">Eliminar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  
  const props = defineProps({
    clave: {
      type: String,
      default: null
    }
  });
  
  const emit = defineEmits(['asignatura-eliminada']);
  
  const headers = [
    { title: 'Clave', key: 'clave', width: '120px' },
    { title: 'Asignatura', key: 'nombre', width: '250px' },
    { title: 'Créditos', key: 'creditos', align: 'center', width: '100px' },
    { title: 'Acciones', key: 'actions', align: 'center', width: '100px', sortable: false }
  ];
  
  const asignaturaData = ref(null);
  const loading = ref(false);
  const deleting = ref(false);
  const error = ref(null);
  const noDataMessage = ref('Ingrese una clave para buscar');
  const deleteDialog = ref(false);
  const asignaturaToDelete = ref(null);
  
  const formattedAsignaturaData = computed(() => {
    if (!asignaturaData.value) return [];
    const { clave, nombre, creditos } = asignaturaData.value;
    return [{ clave, nombre, creditos }];
  });
  
  const fetchAsignatura = async (clave) => {
    if (!clave) {
      asignaturaData.value = null;
      noDataMessage.value = 'Ingrese una clave para buscar';
      return;
    }
  
    try {
      loading.value = true;
      error.value = null;
      noDataMessage.value = 'Cargando datos de la asignatura...';
  
      const response = await fetch(`/asignaturas/${clave}`);
  
      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? `No se encontró la asignatura con clave ${clave}`
            : 'Error al cargar datos de la asignatura'
        );
      }
  
      const data = await response.json();
      asignaturaData.value = data;
      noDataMessage.value = 'No se encontraron datos para esta asignatura';
  
    } catch (err) {
      error.value = err.message;
      noDataMessage.value = err.message;
      asignaturaData.value = null;
    } finally {
      loading.value = false;
    }
  };
  
  const confirmDelete = (clave) => {
    asignaturaToDelete.value = asignaturaData.value;
    deleteDialog.value = true;
  };
  
  const deleteAsignatura = async () => {
    try {
      deleting.value = true;
      const response = await fetch(`/asignaturas/${asignaturaToDelete.value.clave}`, {
        method: 'DELETE'
      });
  
      if (!response.ok) {
        throw new Error('Error al eliminar la asignatura');
      }
  
      emit('asignatura-eliminada', asignaturaToDelete.value.clave);
      asignaturaData.value = null;
      noDataMessage.value = 'Asignatura eliminada correctamente';
      deleteDialog.value = false;
    } catch (err) {
      error.value = err.message;
      noDataMessage.value = err.message;
    } finally {
      deleting.value = false;
    }
  };
  
  watch(() => props.clave, (newVal) => {
    fetchAsignatura(newVal);
  }, { immediate: true });
  </script>
  
  <style scoped>
  .single-row-table {
    border: thin solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
  }
  
  .single-row-table :deep(.v-data-table__wrapper) {
    overflow-y: auto;
  }
  
  .single-row-table :deep(th:nth-child(3)),
  .single-row-table :deep(td:nth-child(3)),
  .single-row-table :deep(th:nth-child(4)),
  .single-row-table :deep(td:nth-child(4)) {
    text-align: center;
  }
  </style>