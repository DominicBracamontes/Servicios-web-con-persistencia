<template>
    <div>
      <v-data-table
        :headers="headers"
        :items="formattedStudentData"
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
    matricula: {
      type: String,
      default: null
    }
  });
  
  const emit = defineEmits(['student-deleted', 'return-to-list']);
  
  const headers = [
    { title: 'Matrícula', key: 'matricula', width: '120px' },
    { title: 'Nombre', key: 'nombre', width: '200px' },
    { title: 'Email', key: 'email' },
    { title: 'Acciones', key: 'actions', width: '100px', sortable: false }
  ];
  
  const studentData = ref(null);
  const loading = ref(false);
  const error = ref(null);
  const noDataMessage = ref('Ingrese una matrícula para buscar');
  const deleteDialog = ref(false);
  const studentToDelete = ref(null);
  const deleting = ref(false);
  const snackbar = ref({
    show: false,
    message: '',
    color: 'success'
  });
  
  const formattedStudentData = computed(() => {
    if (!studentData.value) return [];
    
    return [{
      matricula: studentData.value.matricula,
      nombre: studentData.value.persona.nombre,
      email: studentData.value.persona.email
    }];
  });
  
  const fetchStudent = async (matricula) => {
    if (!matricula) {
      studentData.value = null;
      noDataMessage.value = 'Ingrese una matrícula para buscar';
      return;
    }
  
    try {
      loading.value = true;
      error.value = null;
      noDataMessage.value = 'Cargando datos del estudiante...';
      
      const response = await fetch(`/api/estudiantes/${matricula}`);
      
      if (!response.ok) {
        throw new Error(response.status === 404 
          ? `No se encontró el estudiante con matrícula ${matricula}` 
          : 'Error al cargar datos del estudiante');
      }
      
      const data = await response.json();
      studentData.value = data;
      noDataMessage.value = 'No se encontraron datos para este estudiante';
      
    } catch (err) {
      error.value = err.message;
      noDataMessage.value = err.message;
      studentData.value = null;
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
      const response = await fetch(`/api/estudiantes/por-matricula/${studentToDelete.value.matricula}`, {
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
  
      showSnackbar('Estudiante eliminado correctamente', 'success');
      studentData.value = null;
      emit('student-deleted', studentToDelete.value.matricula);
      emit('return-to-list'); 
      
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
  
  watch(() => props.matricula, (newVal) => {
    fetchStudent(newVal);
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