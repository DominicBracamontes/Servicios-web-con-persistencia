<template>
  <div>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>

    <v-alert v-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>


    <template v-if="!loading && formattedAsignaturaData.length > 0">
      <v-data-table :headers="headers" :items="formattedAsignaturaData" :loading="loading" hide-default-footer
        class="single-row-table">
        <template v-slot:loading>
          <v-progress-linear indeterminate color="primary" />
        </template>

        <template v-slot:no-data>
          <v-alert :type="error ? 'error' : 'info'" class="mt-4">
            {{ noDataMessage }}
          </v-alert>
        </template>

        <template v-slot:item.acciones="{ item }">
          <v-icon color="blue" class="mx-1 cursor-pointer" @click.stop="openEditDialog(item)"
            title="Edición completa (PUT)">
            mdi-pencil
          </v-icon>

          <v-icon color="orange" class="mx-1 cursor-pointer" @click.stop="openPatchDialog(item)"
            title="Modificación parcial (PATCH)">
            mdi-pencil
          </v-icon>

          <v-icon color="red" class="mx-1 cursor-pointer" @click.stop="openDeleteDialog(item)" title="Eliminar">
            mdi-delete
          </v-icon>
        </template>
      </v-data-table>
    </template>

    <v-alert v-else-if="!loading && formattedAsignaturaData.length === 0" type="info" class="mt-4">
      {{ noDataMessage }}
    </v-alert>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mt-4" />

    <!-- DELETE -->
    <v-dialog v-model="deleteDialog" persistent max-width="500">
      <v-card>
        <v-card-title class="text-h5">Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar la asignatura
          <strong>{{ asignaturaAEliminar?.nombre }}</strong> (Clave:
          {{ asignaturaAEliminar?.clave }})?
          <br /><br />
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="deleteDialog = false" :disabled="deleting">
            Cancelar
          </v-btn>
          <v-btn color="red-darken-1" variant="text" @click="confirmarEliminacion" :loading="deleting"
            :disabled="deleting">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PUT -->
    <v-dialog v-model="editDialog" persistent max-width="600">
      <v-card>
        <v-card-title class="text-h5">Editar Asignatura (PUT)</v-card-title>
        <v-card-text>
          <v-form ref="editForm" @submit.prevent="editarAsignatura">
            <v-text-field v-model="asignaturaAEditar.nombre" label="Nombre"
              :rules="[v => !!v || 'El nombre es requerido']" required></v-text-field>

            <v-text-field v-model="asignaturaAEditar.creditos" label="Créditos" type="number"
              :rules="[v => !!v || 'Los créditos son requeridos']" required></v-text-field>

            <v-text-field v-model="asignaturaAEditar.nuevaClave" label="Nueva Clave" type="number"
              :rules="[v => !!v || 'La clave es requerida']" required></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="editDialog = false" :disabled="editing">
            Cancelar
          </v-btn>
          <v-btn color="green-darken-1" variant="text" @click="editarAsignatura" :loading="editing" :disabled="editing">
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PATCH -->
    <v-dialog v-model="patchDialog" persistent max-width="600">
      <v-card>
        <v-card-title class="text-h5">Modificar Asignatura (PATCH)</v-card-title>
        <v-card-text>
          <v-form ref="patchForm" @submit.prevent="aplicarPatch">
            <v-text-field v-model="asignaturaAPatch.nombre" label="Nombre"
              :rules="[v => !!v || 'El nombre es requerido']" required></v-text-field>

            <v-text-field v-model="asignaturaAPatch.creditos" label="Créditos" type="number"
              :rules="[v => !!v || 'Los créditos son requeridos']" required></v-text-field>

            <v-text-field v-model="asignaturaAPatch.nuevaClave" label="Nueva Clave" type="number"
              :rules="[v => !!v || 'La clave es requerida']" required></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="patchDialog = false" :disabled="patching">
            Cancelar
          </v-btn>
          <v-btn color="orange-darken-1" variant="text" @click="aplicarPatch" :loading="patching" :disabled="patching">
            Aplicar Cambios
          </v-btn>
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

const headers = [
  { title: 'Clave', key: 'clave', width: '120px' },
  { title: 'Asignatura', key: 'nombre', width: '250px' },
  { title: 'Créditos', key: 'creditos', align: 'center', width: '100px' },
  { title: 'Acciones', key: 'acciones', align: 'center', width: '200px' }
];

const asignaturaData = ref(null);
const loading = ref(false);
const error = ref(null);
const noDataMessage = ref('Ingrese una clave para buscar');

// DELETE
const deleteDialog = ref(false);
const asignaturaAEliminar = ref(null);
const deleting = ref(false);

// PUT
const editDialog = ref(false);
const editing = ref(false);
const asignaturaAEditar = ref({
  claveOriginal: null,
  nombre: '',
  creditos: null,
  nuevaClave: null
});
const editForm = ref(null);

// PATCH
const patchDialog = ref(false);
const patching = ref(false);
const asignaturaAPatch = ref({
  claveOriginal: null,
  nombre: '',
  creditos: null,
  nuevaClave: null
});
const patchForm = ref(null);



// DELETE
const openDeleteDialog = (item) => {
  asignaturaAEliminar.value = item;
  deleteDialog.value = true;
};

const confirmarEliminacion = async () => {
  if (!asignaturaAEliminar.value) return;

  deleting.value = true;

  try {
    const response = await fetch(`https://localhost:9000/asignaturas/${asignaturaAEliminar.value.clave}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Error al eliminar la asignatura');
    }

    asignaturaData.value = null;
    deleteDialog.value = false;

    // Redirigir a la página principal de asignaturas
    window.location.href = '/paginaBuscarAsigCom'; // Ajusta la URL según tu estructura

  } catch (err) {
    error.value = err.message;
  } finally {
    deleting.value = false;
  }
};

//PUT
const openEditDialog = (item) => {
  asignaturaAEditar.value = {
    claveOriginal: item.clave, // Solo mantenemos la clave original para la URL
    nombre: '', // Vacío en lugar de item.nombre
    creditos: null, // Null en lugar de item.creditos
    nuevaClave: null // Null en lugar de item.clave
  };
  editDialog.value = true;
};

const editarAsignatura = async () => {
  if (!editForm.value) return;

  const { valid } = await editForm.value.validate();
  if (!valid) return;

  editing.value = true;

  try {
    const response = await fetch(`https://localhost:9000/asignaturas/${asignaturaAEditar.value.claveOriginal}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nombre: asignaturaAEditar.value.nombre,
        creditos: Number(asignaturaAEditar.value.creditos),
        nuevaClave: Number(asignaturaAEditar.value.nuevaClave)
      })
    });

    if (!response.ok) {
      throw new Error('Error al actualizar la asignatura');
    }

    asignaturaData.value = {
      clave: asignaturaAEditar.value.nuevaClave,
      nombre: asignaturaAEditar.value.nombre,
      creditos: asignaturaAEditar.value.creditos
    };

    editDialog.value = false;

  } catch (err) {
    error.value = err.message;
  } finally {
    editing.value = false;
  }
};

// PATCH
const openPatchDialog = (item) => {
  asignaturaAPatch.value = {
    claveOriginal: item.clave,
    nombre: item.nombre,
    creditos: item.creditos,
    nuevaClave: item.clave
  };
  patchDialog.value = true;
};

const aplicarPatch = async () => {
  if (!patchForm.value) return;

  const { valid } = await patchForm.value.validate();
  if (!valid) return;

  const cambios = {
    nombre: asignaturaAPatch.value.nombre !== asignaturaData.value.nombre,
    creditos: asignaturaAPatch.value.creditos !== asignaturaData.value.creditos,
    clave: asignaturaAPatch.value.nuevaClave !== asignaturaData.value.clave
  };

  if (!cambios.nombre && !cambios.creditos && !cambios.clave) {
    showSnackbar('No hay cambios para actualizar', 'warning');
    return;
  }

  patching.value = true;

  try {
    const payload = {};

    if (cambios.nombre) {
      payload.nombre = asignaturaAPatch.value.nombre;
    }

    if (cambios.creditos) {
      payload.creditos = Number(asignaturaAPatch.value.creditos);
    }

    if (cambios.clave) {
      payload.nuevaClave = Number(asignaturaAPatch.value.nuevaClave);
    }

    const response = await fetch(`https://localhost:9000/asignaturas/${asignaturaAPatch.value.claveOriginal}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al modificar la asignatura');
    }

    asignaturaData.value = {
      clave: asignaturaAPatch.value.nuevaClave || asignaturaData.value.clave,
      nombre: asignaturaAPatch.value.nombre || asignaturaData.value.nombre,
      creditos: asignaturaAPatch.value.creditos || asignaturaData.value.creditos
    };

    showSnackbar('Asignatura actualizada correctamente', 'success');
    patchDialog.value = false;

  } catch (err) {
    error.value = err.message;
    showSnackbar(`Error: ${err.message}`, 'error');
  } finally {
    patching.value = false;
  }
};

//extra
const snackbar = ref({
  show: false,
  message: '',
  color: 'info'
});

const showSnackbar = (message, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  };
};

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

    const response = await fetch(`https://localhost:9000/asignaturas/${clave}`);

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

watch(() => props.clave, (newVal) => {
  fetchAsignatura(newVal);
}, { immediate: true });
</script>

<style scoped>
.single-row-table {
  border: thin solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.single-row-table :deep(.v-data-table__wrapper) {
  overflow-y: auto;
}

.single-row-table :deep(th),
.single-row-table :deep(td) {
  padding: 0 12px;
}

.single-row-table :deep(th:nth-child(3)),
.single-row-table :deep(td:nth-child(3)) {
  text-align: center;
}

.cursor-pointer {
  cursor: pointer;
}

.mx-1 {
  margin: 0 4px;
}
</style>