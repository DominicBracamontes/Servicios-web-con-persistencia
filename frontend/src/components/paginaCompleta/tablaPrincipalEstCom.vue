<template>
  <div>
    <!-- BOTON POST-->
    <div class="d-flex justify-end mb-4">
      <v-btn color="primary" @click="createDialog = true">
        <v-icon left>mdi-plus</v-icon>
        Nuevo Estudiante
      </v-btn>
    </div>

    <!-- TABLA-->
    <v-data-table
      :headers="headers"
      :items="formattedStudents"
      :loading="loading"
      hide-default-footer
      class="students-table"
    >

    
      <!-- BOTONES -->
      <template v-slot:loading>
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </template>
      <template v-slot:no-data>
        <v-alert :type="error ? 'error' : 'info'" class="mt-4">
          {{ noDataMessage }}
        </v-alert>
      </template>
      <template v-slot:item.actions="{ item }">
        <div class="d-flex">
          <v-icon
            color="primary"
            class="mr-2"
            @click.stop="openEditDialog(item)"
          >
            mdi-pencil
          </v-icon>
          <v-icon
            color="orange"
            class="mr-2"
            @click.stop="openPatchDialog(item)"
          >
            mdi-pencil-plus
          </v-icon>
          <v-icon
            color="error"
            @click.stop="openDeleteDialog(item)"
          >
            mdi-delete
          </v-icon>
        </div>
      </template>
    </v-data-table>

    <!-- DELETE-->
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

    <!--PUT-->
    <v-dialog v-model="editDialog" persistent max-width="600">
      <v-card>
        <v-card-title class="text-h5">Editar Estudiante</v-card-title>
        <v-card-text>
          <v-form ref="editForm" @submit.prevent="confirmEdit">
            <v-text-field
              v-model="editStudent.matricula"
              label="Matrícula"
              required
              :rules="[v => !!v || 'La matrícula es requerida']"
              class="mb-4"
            ></v-text-field>
            <v-text-field
              v-model="editStudent.nombre"
              label="Nombre"
              required
              :rules="[v => !!v || 'El nombre es requerido']"
              class="mb-4"
            ></v-text-field>
            <v-text-field
              v-model="editStudent.email"
              label="Email"
              required
              :rules="[
                v => !!v || 'El email es requerido',
                v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
              ]"
            ></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="editDialog = false"
            :disabled="editing"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="green-darken-1"
            variant="text"
            @click="confirmEdit"
            :loading="editing"
            :disabled="editing"
          >
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PATCH -->
    <v-dialog v-model="patchDialog" max-width="500">
      <v-card>
        <v-card-title>Editar Estudiante (PATCH)</v-card-title>
        <v-card-text>
          <v-form ref="patchForm">
            <v-text-field
              v-model="patchStudent.matricula"
              label="Matrícula"
              :placeholder="patchStudent.matricula ? '' : 'matricula'"
            ></v-text-field>
            
            <v-text-field
              v-model="patchStudent.nombre"
              label="Nombre"
              :placeholder="patchStudent.nombre ? '' : 'nombre'"
            ></v-text-field>
            
            <v-text-field
              v-model="patchStudent.email"
              label="Email"
              type="email"
              :placeholder="patchStudent.email ? '' : 'email'"
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

    <!-- POST -->
    <v-dialog v-model="createDialog" persistent max-width="600">
          <v-card>
            <v-card-title class="text-h5">Nuevo Estudiante</v-card-title>
            <v-card-text>
              <v-form ref="createForm" @submit.prevent="confirmCreate">
                <v-text-field
                  v-model="newStudent.matricula"
                  label="Matrícula"
                  required
                  :rules="[v => !!v || 'La matrícula es requerida']"
                  class="mb-4"
                ></v-text-field>
                
                <v-text-field
                  v-model="newStudent.nombre"
                  label="Nombre"
                  required
                  :rules="[v => !!v || 'El nombre es requerido']"
                  class="mb-4"
                ></v-text-field>
                
                <v-text-field
                  v-model="newStudent.email"
                  label="Email"
                  required
                  :rules="[
                    v => !!v || 'El email es requerido',
                    v => /.+@.+\..+/.test(v) || 'El email debe ser válido'
                  ]"
                ></v-text-field>
              </v-form>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                color="blue-darken-1"
                variant="text"
                @click="createDialog = false"
                :disabled="creating"
              >
                Cancelar
              </v-btn>
              <v-btn
                color="green-darken-1"
                variant="text"
                @click="confirmCreate"
                :loading="creating"
                :disabled="creating"
              >
                Crear Estudiante
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

        <!-- Snackbar -->
        <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
          {{ snackbar.message }}
        </v-snackbar>
      </div>
</template>


<script setup>
import { ref, computed } from 'vue';

const headers = [
  { title: 'Matrícula', key: 'matricula', width: '120px' },
  { title: 'Nombre', key: 'nombre', width: '200px' },
  { title: 'Email', key: 'email' },
  { title: 'Acciones', key: 'actions', width: '150px', sortable: false }
];
const originalStudentData = ref(null);
const students = ref([]);
const loading = ref(false);
const error = ref(null);
const noDataMessage = ref('No hay estudiantes disponibles');
const deleteDialog = ref(false);
const editDialog = ref(false);
const studentToDelete = ref(null);
const editStudent = ref({
  matricula: '',
  nombre: '',
  email: ''
});
const deleting = ref(false);
const editing = ref(false);
const editForm = ref(null);
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});
const patchDialog = ref(false)
const patching = ref(false)
const patchStudent = ref({
  matricula: '',
  nombre: '',
  email: '',
});
const patchForm = ref(null)

const createDialog = ref(false);
const creating = ref(false);
const newStudent = ref({
  matricula: '',
  nombre: '',
  email: ''
});
const createForm = ref(null);

const formattedStudents = computed(() => {
  return students.value.map(item => ({
    matricula: item.matricula,
    nombre: item.nombre,
    email: item.email
  }));
});

const fetchStudents = async () => {
  try {
    loading.value = true;
    error.value = null;
    noDataMessage.value = 'Cargando estudiantes...';
    students.value = [];
    
    const response = await fetch('https://localhost:3000/estudiantes');
    
    if (!response.ok) {
      throw new Error(response.status === 404 
        ? 'No se encontraron estudiantes' 
        : 'Error al cargar datos de estudiantes');
    }
    
    const data = await response.json();
    students.value = data.map(item => ({
      matricula: item.matricula,
      nombre: item.persona.nombre,
      email: item.persona.email
    }));
    
    noDataMessage.value = 'No hay estudiantes disponibles';
    
  } catch (err) {
    error.value = err.message;
    noDataMessage.value = err.message;
    students.value = [];
  } finally {
    loading.value = false;
  }
};

//DELETE
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
    await fetchStudents();
    
  } catch (err) {
    console.error('Error al eliminar:', err);
    showSnackbar(`Error al eliminar: ${err.message}`, 'error');
  } finally {
    deleting.value = false;
    deleteDialog.value = false;
  }
};

// PUT
const showSnackbar = (message, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  };
};
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
  console.log('[DEBUG] Iniciando edición...');

  if (!editForm.value) {
    showSnackbar('Error interno del sistema', 'error');
    return;
  }

  const { valid } = await editForm.value.validate();
  if (!valid) {
    showSnackbar('Complete todos los campos correctamente', 'error');
    return;
  }

  editing.value = true;

  try {
    const payload = {
      nombre: editStudent.value.nombre,
      email: editStudent.value.email
    };

    if (editStudent.value.matricula !== originalStudentData.value.matricula) {
      payload.matricula = editStudent.value.matricula;
    }

    const response = await fetch(
      `https://localhost:3000/estudiantes/por-matricula/${originalStudentData.value.matricula}`,
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
      throw new Error(errorData.error || 'Error al actualizar el estudiante');
    }

    const updatedData = await response.json();
    console.log('Datos actualizados:', updatedData);

    showSnackbar('Estudiante actualizado correctamente', 'success');
    await fetchStudents(); 
    editDialog.value = false;
  } catch (error) {
    console.error('Error completo:', error);
    showSnackbar(`Error: ${error.message}`, 'error');
  } finally {
    editing.value = false;
  }
};

// PATCH
function openPatchDialog(student) {
  patchStudent.value = {
    matricula: student.matricula,
    nombre: student.nombre,
    email: student.email
  };
  originalStudentData.value = { ...student }; 
  patchDialog.value = true;
}
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

  if (Object.keys(payload).length === 0) {
    showSnackbar('No hay cambios para actualizar', 'warning');
    return;
  }

  patching.value = true;

  try {
    console.log('[DEBUG] Payload a enviar:', payload);

    const response = await fetch(
      `https://localhost:3000/estudiantes/por-matricula/${originalStudentData.value.matricula}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
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
      await fetchStudents(); 
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

//POST
const openCreateDialog = () => {
  newStudent.value = { matricula: '', persona: { nombre: '', email: '' } };
  createDialog.value = true;
};
const confirmCreate = async () => {
  if (!createForm.value) {
    showSnackbar('Error interno del sistema', 'error');
    return;
  }

  const { valid } = await createForm.value.validate();
  if (!valid) {
    showSnackbar('Complete todos los campos correctamente', 'error');
    return;
  }

  creating.value = true;

  try {
    const response = await fetch('https://localhost:3000/estudiantes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify({
        matricula: newStudent.value.matricula,
        persona: {
          nombre: newStudent.value.nombre,
          email: newStudent.value.email
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Error al crear el estudiante');
    }

    const createdData = await response.json();
    console.log('Estudiante creado:', createdData);

    showSnackbar('Estudiante creado correctamente', 'success');
    await fetchStudents();
    createDialog.value = false;
  } catch (error) {
    console.error('Error al crear estudiante:', error);
    showSnackbar(`Error: ${error.message}`, 'error');
  } finally {
    creating.value = false;
  }
};

fetchStudents();
</script>

<style scoped>
.students-table {
  border: thin solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.students-table :deep(.v-data-table__wrapper) {
  overflow-y: auto;
  max-height: 70vh;
}

.students-table :deep(.v-icon) {
  cursor: pointer;
  transition: all 0.2s;
}

.students-table :deep(.v-icon:hover) {
  transform: scale(1.1);
}

.students-table :deep(.v-icon.mdi-pencil:hover) {
  color: #2196F3 !important;
}

.students-table :deep(.v-icon.mdi-delete:hover) {
  color: #ff5252 !important;
}

.v-card-actions {
  padding: 16px;
}
</style>