<template>
    <div>
      <v-data-table
        :headers="headers"
        :items="formattedDocenteData"
        :loading="loading"
        hide-default-footer
        class="single-row-table"
      >
        <template v-slot:loading>
          <v-progress-linear indeterminate color="primary"></v-progress-linear>
        </template>
  
        <template v-slot:no-data>
          <v-alert :type="error ? 'error' : 'info'" class="mt-4">
            {{ noDataMessage }}
          </v-alert>
        </template>
  
        <template v-slot:item.actions="{ item }">
          <v-icon
            color="error"
            @click.stop="openDeleteDialog(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
  
      <v-dialog v-model="deleteDialog" persistent max-width="500">
        <v-card>
          <v-card-title class="text-h5">
            Confirmar Eliminación
          </v-card-title>
          <v-card-text>
            ¿Estás seguro que deseas eliminar al docente <strong>{{ docenteToDelete?.nombre }}</strong> (Núm. Empleado: {{ docenteToDelete?.numEmpleado }})?
            <br><br>
            Esta acción no se puede deshacer.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue-darken-1"
              variant="text"
              @click="deleteDialog = false"
              :disabled="deleting"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="red-darken-1"
              variant="text"
              @click="confirmDelete"
              :loading="deleting"
              :disabled="deleting"
            >
              Confirmar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
  
      <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
        {{ snackbar.message }}
      </v-snackbar>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch } from 'vue';
  
  const props = defineProps({
    numEmpleado: {
      type: String,
      default: null
    }
  });
  
  const emit = defineEmits(['docente-deleted']);
  
  const headers = [
    { title: 'Núm. Empleado', key: 'numEmpleado', width: '120px' },
    { title: 'Nombre', key: 'nombre', width: '200px' },
    { title: 'Categoría', key: 'categoria' },
    { title: 'Email', key: 'email' },
    { title: 'Acciones', key: 'actions', width: '100px', sortable: false }
  ];
  
  const docenteData = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const noDataMessage = ref('Ingrese un número de empleado para buscar');
  const deleteDialog = ref(false);
  const docenteToDelete = ref(null);
  const deleting = ref(false);
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success'
  });
  
  const formattedDocenteData = computed(() => {
    if (!docenteData.value) return [];
    
    return [{
      numEmpleado: docenteData.value.numEmpleado,
      nombre: docenteData.value.persona?.nombre || 'No disponible',
      categoria: docenteData.value.categoriaId?.toString() || 'Sin categoría',
      email: docenteData.value.persona?.email || 'No disponible'
    }];
  });
  
  const fetchDocente = async (numEmpleado) => {
    if (!numEmpleado) {
      docenteData.value = null;
      noDataMessage.value = 'Ingrese un número de empleado para buscar';
      return;
    }
  
    try {
      loading.value = true;
      error.value = null;
      noDataMessage.value = 'Cargando datos del docente...';
      
      const response = await fetch(`https://localhost:3000/docentes/${numEmpleado}`);
      
      if (!response.ok) {
        throw new Error(response.status === 404 
          ? `No se encontró el docente con número ${numEmpleado}` 
          : 'Error al cargar datos del docente');
      }
      
      const data = await response.json();
      docenteData.value = data;
      noDataMessage.value = 'No se encontraron datos para este docente';
      
    } catch (err) {
      error.value = err.message;
      noDataMessage.value = err.message;
      docenteData.value = null;
    } finally {
      loading.value = false;
    }
  };
  
  const openDeleteDialog = (docente) => {
    docenteToDelete.value = docente;
    deleteDialog.value = true;
  };
  
  const confirmDelete = async () => {
    try {
      deleting.value = true;
      const response = await fetch(`https://localhost:3000/docentes/${docenteToDelete.value.numEmpleado}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
  
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || 
          `Error ${response.status}: ${response.statusText}`
        );
      }
  
      showSnackbar('Docente eliminado correctamente', 'success');
      docenteData.value = null;
      emit('docente-deleted', docenteToDelete.value.numEmpleado);
      
    } catch (err) {
      console.error('Error al eliminar:', err);
      showSnackbar(`Error al eliminar: ${err.message}`, 'error');
    } finally {
      deleting.value = false;
      deleteDialog.value = false;
    }
  };
  
  const showSnackbar = (message, color) => {
    snackbar.value = {
      show: true,
      message,
      color
    };
  };
  
  watch(() => props.numEmpleado, (newVal) => {
    fetchDocente(newVal);
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
  
  .single-row-table :deep(.v-icon) {
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .single-row-table :deep(.v-icon:hover) {
    transform: scale(1.1);
    color: #ff5252 !important;
  }
  
  .v-card-actions {
    padding: 16px;
  }
  </style>