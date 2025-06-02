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

    <!-- POST -->
    <div class="text-right">
      <v-btn color="primary" class="mb-4" @click="openCreateDialog">
        <v-icon left>mdi-plus</v-icon>
        Nueva Asignatura
      </v-btn>
    </div>

    <template v-if="!loading && asignaturas.length > 0">
      <v-data-table-virtual :headers="headers" :items="asignaturas" :item-height="50" height="300px" fixed-header
        class="compact-table">
        <template v-slot:item.clave="{ item }">
          <span>{{ item.clave }}</span>
        </template>

        <template v-slot:item.nombre="{ item }">
          <span>{{ item.nombre }}</span>
        </template>

        <template v-slot:item.creditos="{ item }">
          <span class="text-center">{{ item.creditos }}</span>
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

        <template v-slot:bottom>
          <div class="text-caption text-right pa-2">
            Mostrando {{ asignaturas.length }} registros
          </div>
        </template>
      </v-data-table-virtual>
    </template>

    <v-alert v-else-if="!loading && asignaturas.length === 0" type="info" class="mt-4">
      No hay asignaturas disponibles
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

    <!-- POST -->
    <v-dialog v-model="createDialog" persistent max-width="600">
      <v-card>
        <v-card-title class="text-h5">Crear Asignatura</v-card-title>
        <v-card-text>
          <v-form ref="createForm" @submit.prevent="crearAsignatura">
            <v-text-field v-model="nuevaAsignatura.clave" label="Clave" type="number"
              :rules="[v => !!v || 'La clave es requerida']" required></v-text-field>

            <v-text-field v-model="nuevaAsignatura.nombre" label="Nombre"
              :rules="[v => !!v || 'El nombre es requerido']" required></v-text-field>

            <v-text-field v-model="nuevaAsignatura.creditos" label="Créditos" type="number"
              :rules="[v => !!v || 'Los créditos son requeridos']" required></v-text-field>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="closeCreateDialog" :disabled="creating">
            Cancelar
          </v-btn>
          <v-btn color="green-darken-1" variant="text" @click="crearAsignatura" :loading="creating"
            :disabled="creating">
            Crear
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PUT -->
    <v-dialog v-model="editDialog" persistent max-width="600">
      <v-card>
        <v-card-title class="text-h5">Editar Asignatura</v-card-title>
        <v-card-text>
          <v-form ref="editForm" @submit.prevent="editarAsignatura">
            <v-text-field v-model="asignaturaAEditar.nombre" label="Nombre"
              :rules="[v => !!v || 'El nombre es requerido']" required
              placeholder="Ingrese nuevo nombre"></v-text-field>

            <v-text-field v-model="asignaturaAEditar.creditos" label="Créditos" type="number"
              :rules="[v => !!v || 'Los créditos son requeridos']" required
              placeholder="Ingrese nuevos créditos"></v-text-field>

            <v-text-field v-model="asignaturaAEditar.nuevaClave" label="Nueva Clave" type="number"
              :rules="[v => !!v || 'La clave es requerida']" required placeholder="Ingrese nueva clave"></v-text-field>
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

    <!-- PATCH-->
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
import { ref, onMounted } from 'vue';

const headers = [
  { title: 'Clave', key: 'clave', width: '120px' },
  { title: 'Asignatura', key: 'nombre', width: '200px' },
  { title: 'Créditos', key: 'creditos', align: 'center', width: '100px' },
  { title: 'Acciones', key: 'acciones', align: 'center', width: '150px' },
];

const asignaturas = ref([]);
const loading = ref(false);
const error = ref(null);

//DELETE
const deleteDialog = ref(false);
const asignaturaAEliminar = ref(null);
const deleting = ref(false);

// POST
const createDialog = ref(false);
const nuevaAsignatura = ref({
  clave: null,
  nombre: '',
  creditos: null
});
const creating = ref(false);
const createForm = ref(null);

// PUT
const editDialog = ref(false);
const editing = ref(false);
const asignaturaAEditar = ref({
  claveOriginal: null,
  nombre: '',
  creditos: null,
  nuevaClave: null,
});
const editForm = ref(null);

//PATCH
const patchDialog = ref(false);
const patching = ref(false);
const asignaturaAPatch = ref({
  claveOriginal: null,
  nombre: '',
  creditos: null,
  nuevaClave: null
});
const patchForm = ref(null);

//PATCH
const asignaturaOriginal = ref({
  clave: null,
  nombre: '',
  creditos: null
});
const openPatchDialog = (item) => {
  asignaturaOriginal.value = {
    clave: Number(item.clave),
    nombre: item.nombre,
    creditos: Number(item.creditos)
  };

  asignaturaAPatch.value = {
    claveOriginal: Number(item.clave),
    nombre: item.nombre,
    creditos: Number(item.creditos),
    nuevaClave: Number(item.clave)
  };

  patchDialog.value = true;
};
const aplicarPatch = async () => {
  if (!patchForm.value) return;

  const { valid } = await patchForm.value.validate();
  if (!valid) return;

  // Verificar si hay cambios
  const cambios = {
    nombre: asignaturaAPatch.value.nombre !== asignaturaOriginal.value.nombre,
    creditos: asignaturaAPatch.value.creditos !== asignaturaOriginal.value.creditos,
    clave: asignaturaAPatch.value.nuevaClave !== asignaturaOriginal.value.clave
  };

  // Si no hay ningún cambio, mostrar snackbar y salir
  if (!cambios.nombre && !cambios.creditos && !cambios.clave) {
    showSnackbar('No hay cambios para actualizar', 'warning');
    return;
  }

  patching.value = true;

  try {
    // Crear payload solo con los campos modificados
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
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al modificar asignatura');
    }

    showSnackbar('Asignatura actualizada correctamente', 'success');
    await fetchAsignaturas();
    patchDialog.value = false;
  } catch (err) {
    error.value = err.message;
    showSnackbar(`Error: ${err.message}`, 'error');
  } finally {
    patching.value = false;
  }
};


const showSnackbar = (message, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  };
};

//PUT
const openEditDialog = (item) => {
  asignaturaAEditar.value = {
    claveOriginal: Number(item.clave),
    nombre: '',
    creditos: null,
    nuevaClave: null
  };
  editDialog.value = true;
};

const editarAsignatura = async () => {
  if (!editForm.value) return;

  const { valid } = await editForm.value.validate();
  if (!valid) return;

  editing.value = true;

  try {
    const claveOriginal = asignaturaAEditar.value.claveOriginal;

    const response = await fetch(`https://localhost:9000/asignaturas/${claveOriginal}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nombre: asignaturaAEditar.value.nombre,
        creditos: Number(asignaturaAEditar.value.creditos),
        nuevaClave: Number(asignaturaAEditar.value.nuevaClave),
      }),
    });

    if (!response.ok) throw new Error('Error al editar asignatura');

    const data = await response.json();

    await fetchAsignaturas();

    asignaturaAEditar.value = {
      claveOriginal: null,
      nombre: '',
      creditos: null,
      nuevaClave: null,
    };
    editDialog.value = false;

  } catch (err) {
    error.value = err.message;
  } finally {
    editing.value = false;
  }
};

//POST
const openCreateDialog = () => {
  nuevaAsignatura.value = { clave: null, nombre: '', creditos: null };
  createDialog.value = true;
};

const closeCreateDialog = () => {
  createDialog.value = false;
};

const crearAsignatura = async () => {
  if (!createForm.value) return;

  const { valid } = await createForm.value.validate();
  if (!valid) return;

  creating.value = true;

  try {
    const response = await fetch('https://localhost:9000/asignaturas', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        clave: Number(nuevaAsignatura.value.clave),
        nombre: nuevaAsignatura.value.nombre,
        creditos: Number(nuevaAsignatura.value.creditos)
      })
    });

    if (!response.ok) throw new Error('Error al crear asignatura');

    const data = await response.json();

    await fetchAsignaturas();

    closeCreateDialog();
  } catch (err) {
    error.value = err.message;
  } finally {
    creating.value = false;
  }
};

//DELETE
const openDeleteDialog = (item) => {
  asignaturaAEliminar.value = item;
  deleteDialog.value = true;
};

const confirmarEliminacion = async () => {
  if (!asignaturaAEliminar.value) return;

  deleting.value = true;

  try {
    const claveNumerica = Number(asignaturaAEliminar.value.clave);

    const response = await fetch(`https://localhost:9000/asignaturas/${claveNumerica}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Error al eliminar asignatura');

    asignaturas.value = asignaturas.value.filter(
      (a) => Number(a.clave) !== claveNumerica
    );

    deleteDialog.value = false;
    asignaturaAEliminar.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    deleting.value = false;
  }
};

//EXTRAS
const fetchAsignaturas = async () => {
  try {
    loading.value = true;
    error.value = null;
    asignaturas.value = [];

    const response = await fetch('https://localhost:9000/asignaturas');
    if (!response.ok) throw new Error('Error al cargar datos');

    const data = await response.json();
    asignaturas.value = data.map(item => ({
      clave: item.clave,
      nombre: item.nombre,
      creditos: item.creditos
    }));
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const snackbar = ref({
  show: false,
  message: '',
  color: 'info'
});

onMounted(fetchAsignaturas);
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

.compact-table :deep(th:nth-child(3)),
.compact-table :deep(td:nth-child(3)) {
  text-align: center;
}

.cursor-pointer {
  cursor: pointer;
}
</style>
