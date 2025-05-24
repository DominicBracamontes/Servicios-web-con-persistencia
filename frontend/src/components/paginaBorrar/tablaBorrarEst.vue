<template>
    <div>
      <v-alert v-if="error" type="error" class="mb-4">
        {{ error }}
      </v-alert>
  
      <template v-if="!loading && students.length > 0">
        <v-data-table-virtual
          :headers="headers"
          :items="students"
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
              Mostrando {{ students.length }} registros
            </div>
          </template>
        </v-data-table-virtual>
      </template>
  
      <v-alert
        v-else-if="!loading && students.length === 0"
        type="info"
        class="mt-4"
      >
        No hay estudiantes disponibles
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
            ¿Estás seguro que deseas eliminar al estudiante <strong>{{ studentToDelete?.nombre }}</strong> (Matrícula: {{ studentToDelete?.matricula }})?
            <br><br>
            Esta acción no se puede deshacer.
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="blue-darken-1"
              variant="text"
              @click="deleteDialog = false"
            >
              Cancelar
            </v-btn>
            <v-btn
              color="red-darken-1"
              variant="text"
              @click="confirmDelete"
              :loading="deleting"
            >
              Confirmar Eliminación
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
    { title: 'Matrícula', key: 'matricula', width: '120px' },
    { title: 'Nombre', key: 'nombre', width: '200px' },
    { title: 'Email', key: 'email' },
    { title: 'Acciones', key: 'actions', width: '100px', sortable: false }
  ];
  
  const students = ref([]);
  const loading = ref(false);
  const error = ref(null);
  const deleteDialog = ref(false);
  const studentToDelete = ref(null);
  const deleting = ref(false);
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success'
  });
  
  const fetchStudents = async () => {
    try {
      loading.value = true;
      error.value = null;
      students.value = [];
      
      const response = await fetch('https://localhost:3000/estudiantes');
      
      if (!response.ok) throw new Error('Error al cargar datos');
      
      const data = await response.json();
      students.value = data.map(item => ({
        matricula: item.matricula,
        nombre: item.persona.nombre,
        email: item.persona.email,
        rawData: item 
      }));
      
    } catch (err) {
      error.value = err.message;
      showSnackbar('Error al cargar estudiantes', 'error');
    } finally {
      loading.value = false;
    }
  };
  
  const openDeleteDialog = (student) => {
    studentToDelete.value = student;
    deleteDialog.value = true;
  };
  
  const confirmDelete = async () => {
    try {
      deleting.value = true;
      const response = await fetch(`https://localhost:3000/estudiantes/por-matricula/${studentToDelete.value.matricula}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al eliminar estudiante');
      }
      
      showSnackbar('Estudiante eliminado correctamente', 'success');
      await fetchStudents();
      
    } catch (err) {
      showSnackbar(err.message, 'error');
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
    fetchStudents();
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