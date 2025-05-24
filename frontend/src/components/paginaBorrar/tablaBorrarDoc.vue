<template>
    <div>
      <v-alert v-if="error" type="error" class="mb-4">
        {{ error }}
      </v-alert>
  
      <template v-if="!loading && docentes.length > 0">
        <v-data-table-virtual
          :headers="headers"
          :items="docentes"
          :item-height="50"
          height="auto"
          fixed-header
          class="compact-table"
        >
          <template v-slot:item.actions="{ item }">
            <v-icon
              color="error"
              @click.stop="openDeleteDialog(item)"
            >
              mdi-delete
            </v-icon>
          </template>
  
          <template v-slot:bottom>
            <div class="text-caption text-right pa-2">
              Mostrando {{ docentes.length }} registros
            </div>
          </template>
        </v-data-table-virtual>
      </template>
  
      <v-alert
        v-else-if="!loading && docentes.length === 0"
        type="info"
        class="mt-4"
      >
        No hay docentes disponibles
      </v-alert>
  
      <v-progress-linear
        v-if="loading"
        indeterminate
        color="primary"
        class="mt-4"
      />
  
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
  import { ref, onMounted } from 'vue';
  
  const headers = [
    { title: 'Núm. Empleado', key: 'numEmpleado', width: '120px' },
    { title: 'Nombre', key: 'nombre', width: '200px' },
    { title: 'Categoría', key: 'categoriaEmpleado' },
    { title: 'Email', key: 'email' },
    { title: 'Acciones', key: 'actions', width: '100px', sortable: false }
  ];
  
  const docentes = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const deleteDialog = ref(false);
  const docenteToDelete = ref(null);
  const deleting = ref(false);
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success'
  });
  
  const fetchDocentes = async () => {
    try {
      loading.value = true;
      error.value = null;
      docentes.value = [];
      
      const response = await fetch('https://localhost:3000/docentes');
      
      if (!response.ok) throw new Error('Error al cargar docentes');
      
      const data = await response.json();
      
      docentes.value = data.map(item => ({
        numEmpleado: item.numEmpleado,
        nombre: item.persona?.nombre || 'No disponible',
        categoriaEmpleado: item.categoriaId?.toString() || 'Sin categoría',
        email: item.persona?.email || 'No disponible',
        rawData: item 
      }));
      
    } catch (err) {
      error.value = err.message;
      showSnackbar('Error al cargar docentes', 'error');
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
      docentes.value = docentes.value.filter(
        d => d.numEmpleado !== docenteToDelete.value.numEmpleado
      );
      
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
  
  onMounted(() => {
    fetchDocentes();
  });
  </script>
  
  <style scoped>
  .compact-table {
    max-height: 70vh;
    border: thin solid rgba(0, 0, 0, 0.12);
    border-radius: 4px;
  }
  
  .compact-table :deep(.v-table__wrapper) {
    overflow-y: auto;
    max-height: calc(70vh - 48px);
  }
  
  .compact-table :deep(.v-icon) {
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .compact-table :deep(.v-icon:hover) {
    transform: scale(1.1);
    color: #ff5252 !important;
  }
  
  .v-card-actions {
    padding: 16px;
  }
  </style>