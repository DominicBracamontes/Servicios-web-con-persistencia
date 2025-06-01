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
    color="primary"
    @click.stop="openEditDialog(item)"
    class="mr-2"
    title="Edición completa (PUT)"
  >
    mdi-pencil
  </v-icon>
  <v-icon
    color="orange"
    @click.stop="openPatchDialog(item)"
    class="mr-2"
    title="Actualización parcial (PATCH)"
  >
    mdi-pencil-outline
  </v-icon>
  <v-icon
    color="error"
    @click.stop="openDeleteDialog(item)"
    title="Eliminar"
  >
    mdi-delete
  </v-icon>
</template>
    </v-data-table>

    <!-- Diálogo de Edición (PUT) -->
    <v-dialog v-model="editDialog" max-width="500">
      <v-card>
        <v-card-title>Editar Estudiante</v-card-title>
        <v-card-text>
          <v-form ref="editForm">
            <v-text-field
              v-model="editStudent.matricula"
              label="Matrícula"
              :rules="[rules.required]"
            ></v-text-field>
            
            <v-text-field
              v-model="editStudent.nombre"
              label="Nombre"
              :rules="[rules.required]"
            ></v-text-field>
            
            <v-text-field
              v-model="editStudent.email"
              label="Email"
              type="email"
              :rules="[rules.required, rules.email]"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="editDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmEdit" :loading="editing">
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PATCH -->
    <v-dialog v-model="patchDialog" max-width="500">
      <v-card>
        <v-card-title>Actualizar Estudiante (PATCH)</v-card-title>
        <v-card-text>
          <v-form ref="patchForm">
            <v-text-field
              v-model="patchStudent.matricula"
              label="Matrícula"
              placeholder="matricula"
            ></v-text-field>
            
            <v-text-field
              v-model="patchStudent.nombre"
              label="Nombre"
              placeholder="nombre"
            ></v-text-field>
            
            <v-text-field
              v-model="patchStudent.email"
              label="Email"
              type="email"
              placeholder="email"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="patchDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="confirmPatch" :loading="patching">
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DELETE -->
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

const emit = defineEmits(['student-deleted', 'return-to-list', 'student-updated']);

const headers = [
  { title: 'Matrícula', key: 'matricula', width: '120px' },
  { title: 'Nombre', key: 'nombre', width: '200px' },
  { title: 'Email', key: 'email' },
  { title: 'Acciones', key: 'actions', width: '120px', sortable: false }
];

const studentData = ref(null);
const loading = ref(false);
const error = ref(null);
const noDataMessage = ref('Ingrese una matrícula para buscar');
const deleteDialog = ref(false);
const studentToDelete = ref(null);
const deleting = ref(false);
const editDialog = ref(false);
const editing = ref(false);
const patchDialog = ref(false);
const patching = ref(false);
const originalStudentData = ref(null);
const editForm = ref(null);
const patchForm = ref(null);

const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});

const editStudent = ref({
  matricula: '',
  nombre: '',
  email: ''
});

const patchStudent = ref({
  matricula: '',
  nombre: '',
  email: ''
});

const rules = {
  required: value => !!value || 'Campo requerido',
  email: value => {
    const pattern = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return pattern.test(value) || 'Email inválido';
  }
};

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
    
    const response = await fetch(`https://localhost:9000/estudiantes/${matricula}`);
    
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

//put
const openEditDialog = async (student) => {
  try {
    loading.value = true;
    
    editStudent.value = {
      matricula: '',  
      nombre: '',     
      email: ''       
    };

    originalStudentData.value = { 
      matricula: student.matricula 
    };

    editDialog.value = true;

  } catch (error) {
    console.error('Error al abrir diálogo de edición:', error);
    showSnackbar(`Error: ${error.message}`, 'error');
  } finally {
    loading.value = false;
  }
};

const confirmEdit = async () => {
  console.log('[DEBUG] Iniciando edición PUT...');

  if (!editForm.value) {
    showSnackbar('Error interno del sistema', 'error');
    return;
  }

  const { valid } = await editForm.value.validate();
  if (!valid) {
    showSnackbar('Complete todos los campos requeridos', 'error');
    return;
  }

  editing.value = true;

  try {
    const payload = {
      matricula: editStudent.value.matricula, 
      nombre: editStudent.value.nombre,
      email: editStudent.value.email
    };

    const response = await fetch(
      `https://localhost:9000/estudiantes/por-matricula/${originalStudentData.value.matricula}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al reemplazar el estudiante');
    }

    const updatedData = await response.json();
    showSnackbar('Estudiante reemplazado completamente', 'success');
    
    editDialog.value = false;
    emit('student-updated', updatedData);
    await fetchStudent(updatedData.matricula);

  } catch (error) {
    console.error('Error en PUT:', error);
    showSnackbar(`Error: ${error.message}`, 'error');
  } finally {
    editing.value = false;
  }
};

//patch
const openPatchDialog = (student) => {
  patchStudent.value = {
    matricula: student.matricula,
    nombre: student.nombre,
    email: student.email
  };
  originalStudentData.value = { ...student };
  patchDialog.value = true;
};

const confirmPatch = async () => {
  console.log('[DEBUG] Iniciando actualización parcial (PATCH)...');

  const payload = {};

  if (patchStudent.value.nombre !== undefined && patchStudent.value.nombre !== originalStudentData.value.nombre) {
    payload.nombre = patchStudent.value.nombre;
  }

  if (patchStudent.value.email !== undefined && patchStudent.value.email !== originalStudentData.value.email) {
    payload.email = patchStudent.value.email;
  }

  if (patchStudent.value.matricula !== undefined && patchStudent.value.matricula !== originalStudentData.value.matricula) {
    payload.nuevaMatricula = patchStudent.value.matricula;
  }

  if (Object.keys(payload).length === 0) {
    showSnackbar('No hay cambios para actualizar', 'warning');
    return;
  }

  patching.value = true;

  try {
    console.log('[DEBUG] Payload a enviar:', payload);

    const response = await fetch(
      `https://localhost:9000/estudiantes/por-matricula/${originalStudentData.value.matricula}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(payload)
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.message || 'Error al actualizar parcialmente';
      console.error('[ERROR] Respuesta de error del servidor:', errorMessage);
      throw new Error(errorMessage);
    }

    const updatedData = await response.json();
    console.log('[DEBUG] Respuesta del servidor:', updatedData);

    if (updatedData.estudiante) {
      showSnackbar('Estudiante actualizado correctamente', 'success');
      emit('student-updated', updatedData.estudiante);
      await fetchStudent(updatedData.estudiante.matricula);
      patchDialog.value = false;
    } else {
      console.error('[ERROR] No se recibieron los datos actualizados:', updatedData);
      showSnackbar('Error al obtener los datos actualizados', 'error');
    }

  } catch (error) {
    console.error('[ERROR PATCH]', error);
    showSnackbar(`Error: ${error.message}`, 'error');
  } finally {
    patching.value = false;
  }
};

//delete
const openDeleteDialog = (student) => {
  studentToDelete.value = student;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  try {
    deleting.value = true;
    const response = await fetch(`https://localhost:9000/estudiantes/por-matricula/${studentToDelete.value.matricula}`, {
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

const showSnackbar = (message, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  };
};

//cosas
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
}

.single-row-table :deep(.mdi-pencil:hover) {
  color: #2196F3 !important;
}

.single-row-table :deep(.mdi-delete:hover) {
  color: #ff5252 !important;
}

.v-card-actions {
  padding: 16px;
}
</style>