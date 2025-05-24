<template>
    <div>
      <v-alert v-if="error" type="error" class="mb-4">
        {{ error }}
      </v-alert>
  
      <template v-if="!loading && asignaturas.length > 0">
        <v-data-table-virtual
          :headers="headers"
          :items="asignaturas"
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
              Mostrando {{ asignaturas.length }} registros
            </div>
          </template>
        </v-data-table-virtual>
      </template>
  
      <v-alert
        v-else-if="!loading && asignaturas.length === 0"
        type="info"
        class="mt-4"
      >
        No hay asignaturas disponibles
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
            ¿Estás seguro que deseas eliminar la asignatura <strong>{{ asignaturaToDelete?.nombre }}</strong> (Clave: {{ asignaturaToDelete?.clave }})?
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
    { title: 'Clave', key: 'clave', width: '120px' },
    { title: 'Asignatura', key: 'nombre', width: '200px' },
    { title: 'Créditos', key: 'creditos', align: 'center', width: '100px' },
    { title: 'Acciones', key: 'actions', width: '100px', sortable: false }
  ];
  
  const asignaturas = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const deleteDialog = ref(false);
  const asignaturaToDelete = ref(null);
  const deleting = ref(false);
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success'
  });
  
  const fetchAsignaturas = async () => {
    try {
      loading.value = true;
      error.value = null;
      asignaturas.value = [];
      
      const response = await fetch('https://localhost:3000/asignaturas');
      
      if (!response.ok) throw new Error('Error al cargar asignaturas');
      
      const data = await response.json();
      
      asignaturas.value = data.map(item => ({
        clave: item.clave,
        nombre: item.nombre,
        creditos: item.creditos,
        rawData: item 
      }));
      
    } catch (err) {
      error.value = err.message;
      showSnackbar('Error al cargar asignaturas', 'error');
    } finally {
      loading.value = false;
    }
  };
  
  const openDeleteDialog = (asignatura) => {
    asignaturaToDelete.value = asignatura;
    deleteDialog.value = true;
  };
  
  const confirmDelete = async () => {
    try {
      deleting.value = true;
      const response = await fetch(`https://localhost:3000/asignaturas/${asignaturaToDelete.value.clave}`, {
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
  
      showSnackbar('Asignatura eliminada correctamente', 'success');
      asignaturas.value = asignaturas.value.filter(
        a => a.clave !== asignaturaToDelete.value.clave
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
    fetchAsignaturas();
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
  
  .compact-table :deep(th:nth-child(3)),
  .compact-table :deep(td:nth-child(3)) {
    text-align: center;
  }
  
  .v-card-actions {
    padding: 16px;
  }
  </style>