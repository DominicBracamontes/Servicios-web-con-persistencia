<template>
  <div>
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="3000">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false"></v-btn>
      </template>
    </v-snackbar>

    <v-data-table :headers="headers" :items="formattedDocenteData" :loading="loading" hide-default-footer
      class="single-row-table">
      <template v-slot:loading>
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </template>

      <template v-slot:no-data>
        <v-alert :type="error ? 'error' : 'info'" class="mt-4">
          {{ noDataMessage }}
        </v-alert>
      </template>

      <template v-slot:item.actions="{ item }">
        <v-icon size="16" color="blue" class="mr-2" @click="abrirDialogoEdicion(item)" title="Editar docente">
          mdi-pencil
        </v-icon>

        <v-icon size="16" color="orange" class="mr-2" @click="abrirDialogoPatch(item)" title="Editar docente (PATCH)">
          mdi-pencil
        </v-icon>

        <v-icon size="16" color="red" @click="openDeleteDialog(item)" title="Eliminar docente">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>

    <!-- DELETE -->
    <v-dialog v-model="deleteDialog" persistent max-width="500">
      <v-card>
        <v-card-title class="text-h5">
          Confirmar Eliminación
        </v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar al docente <strong>{{ docenteToDelete?.nombre }}</strong> (Núm. Empleado: {{
            docenteToDelete?.numEmpleado }})?
          <br><br>
          Esta acción no se puede deshacer.
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue-darken-1" variant="text" @click="deleteDialog = false" :disabled="deleting">
            Cancelar
          </v-btn>
          <v-btn color="red-darken-1" variant="text" @click="confirmDelete" :loading="deleting" :disabled="deleting">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PUT -->
    <v-dialog v-model="editDialog" persistent max-width="500px">
      <v-card>
        <v-card-title class="text-h5">Editar Docente</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="docenteAEditar.nuevoNumEmpleado" label="Nuevo Núm. Empleado" type="number"
              required />
            <v-text-field v-model="docenteAEditar.categoriaId" label="ID de Categoría" type="number" required />
            <v-text-field v-model="docenteAEditar.persona.nombre" label="Nombre" required />
            <v-text-field v-model="docenteAEditar.persona.email" label="Email" type="email" required />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="editDialog = false">Cancelar</v-btn>
          <v-btn color="primary" @click="guardarEdicion">Guardar</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- PATCH -->
    <v-dialog v-model="patchDialog" persistent max-width="600">
      <v-card>
        <v-card-title class="text-h6">
          <v-icon left>mdi-pencil</v-icon>
          Editar Docente (PATCH)
        </v-card-title>

        <v-card-text>
          <v-form ref="formPatchRef">
            <v-text-field v-model="docenteAPatch.nuevoNumEmpleado" label="Nuevo Número de Empleado" type="number"
              :placeholder="`Actual: ${docenteOriginal?.numEmpleado || ''}`" clearable class="mb-3">
              <template v-slot:append>
                <v-tooltip bottom>
                  <template v-slot:activator="{ on }">
                    <v-icon color="grey" v-on="on">mdi-information</v-icon>
                  </template>
                  <span>Dejar vacío para mantener el actual</span>
                </v-tooltip>
              </template>
            </v-text-field>

            <v-autocomplete v-model="docenteAPatch.categoriaId" :items="categorias" item-title="nombre"
              item-value="clave" label="Categoría"
              :placeholder="`Actual: ${getCategoriaName(docenteOriginal?.categoriaId) || 'Sin categoría'}`" clearable
              class="mb-3" :loading="loadingCategorias">
              <template v-slot:selection="{ item }">
                {{ item.raw.nombre }}
              </template>
            </v-autocomplete>

            <v-text-field v-model="docenteAPatch.persona.nombre" label="Nombre"
              :placeholder="`Actual: ${docenteOriginal?.nombre || ''}`" clearable class="mb-3" />

            <v-text-field v-model="docenteAPatch.persona.email" label="Email"
              :placeholder="`Actual: ${docenteOriginal?.email || ''}`"
              :rules="[v => !v || /.+@.+\..+/.test(v) || 'Email debe ser válido']" clearable />
          </v-form>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="patchDialog = false">
            Cancelar
          </v-btn>
          <v-btn color="primary" variant="flat" @click="guardarPatch" :loading="patchLoading" :disabled="patchLoading">
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';

const props = defineProps({
  numEmpleado: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['docenteDeleted']);

const headers = [
  { title: 'Núm. Empleado', key: 'numEmpleado', width: '120px' },
  { title: 'Nombre', key: 'nombre', width: '200px' },
  { title: 'Categoría', key: 'categoria' },
  { title: 'Email', key: 'email' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '100px' }
];


const docenteData = ref(null);
const loading = ref(false);
const error = ref(null);
const noDataMessage = ref('Ingrese un número de empleado para buscar');

//DELETE
const deleteDialog = ref(false);
const docenteToDelete = ref(null);
const deleting = ref(false);

//  PUT
const editDialog = ref(false);
const docenteOriginal = ref(null);
const docenteAEditar = ref({
  nuevoNumEmpleado: '',
  categoriaId: '',
  persona: {
    nombre: '',
    email: ''
  }
});

// PATCH
const patchDialog = ref(false);
const patchLoading = ref(false);
const formPatchRef = ref(null);
const docenteAPatch = ref({
  nuevoNumEmpleado: '',
  categoriaId: '',
  persona: {
    nombre: '',
    email: ''
  }
});
const categorias = ref([]);
const loadingCategorias = ref(false);

// PUT
const abrirDialogoEdicion = (docente) => {
  docenteOriginal.value = docente.numEmpleado;
  docenteAEditar.value = {
    nuevoNumEmpleado: docente.numEmpleado,
    categoriaId: docente.categoriaId,
    persona: {
      nombre: docente.nombre,
      email: docente.email
    }
  };
  editDialog.value = true;
};

const guardarEdicion = async () => {
  try {
    const res = await fetch(`https://localhost:9000/docentes/${docenteOriginal.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docenteAEditar.value)
    });

    if (!res.ok) {
      throw new Error('Error al actualizar el docente');
    }

    editDialog.value = false;
    await fetchDocente(docenteAEditar.value.nuevoNumEmpleado);
    emit('docenteDeleted');
  } catch (err) {
    error.value = err.message;
  }
};

// PATCH

const abrirDialogoPatch = async (item) => {
  try {
    if (categorias.value.length === 0) {
      await fetchCategorias();
    }

    docenteOriginal.value = {
      numEmpleado: item.numEmpleado,
      categoriaId: item.categoriaId,
      nombre: item.nombre,
      email: item.email
    };

    docenteAPatch.value = {
      nuevoNumEmpleado: item.numEmpleado,
      categoriaId: item.categoriaId,
      persona: {
        nombre: item.nombre,
        email: item.email
      }
    };

    patchDialog.value = true;
  } catch (err) {
    error.value = err.message;
    console.error('Error al abrir edición PATCH:', err);
  }
};

const guardarPatch = async () => {
  const { valid } = await formPatchRef.value.validate();
  if (!valid) return;

  // Verificar si hay cambios
  const hayCambios = (
    (docenteAPatch.value.nuevoNumEmpleado &&
      docenteAPatch.value.nuevoNumEmpleado !== docenteOriginal.value.numEmpleado) ||
    (docenteAPatch.value.categoriaId !== undefined &&
      docenteAPatch.value.categoriaId !== docenteOriginal.value.categoriaId) ||
    (docenteAPatch.value.persona.nombre &&
      docenteAPatch.value.persona.nombre !== docenteOriginal.value.nombre) ||
    (docenteAPatch.value.persona.email &&
      docenteAPatch.value.persona.email !== docenteOriginal.value.email)
  );

  if (!hayCambios) {
    showSnackbar('No hay cambios para actualizar', 'warning');
    return;
  }

  patchLoading.value = true;
  error.value = null;

  try {
    // Resto de la lógica de guardarPatch...
    // ... (código existente de guardarPatch)

    showSnackbar('Docente actualizado correctamente', 'success');
    patchDialog.value = false;
  } catch (err) {
    showSnackbar(`Error: ${err.message}`, 'error');
  } finally {
    patchLoading.value = false;
  }
};

// DELETE
const openDeleteDialog = (docente) => {
  docenteToDelete.value = docente;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!docenteToDelete.value) return;

  try {
    deleting.value = true;
    const response = await fetch(`https://localhost:9000/docentes/${docenteToDelete.value.numEmpleado}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error('Error al eliminar el docente');
    }

    emit('docenteDeleted');
    docenteData.value = null;
    noDataMessage.value = 'Docente eliminado correctamente';
    deleteDialog.value = false;

  } catch (err) {
    error.value = err.message;
    noDataMessage.value = err.message;
  } finally {
    deleting.value = false;
  }
};

//extras
const snackbar = ref({
  show: false,
  message: '',
  color: ''
});

const showSnackbar = (message, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  };
};

const formattedDocenteData = computed(() => {
  if (!docenteData.value) return [];

  const categoria = categorias.value.find(c => c.clave === docenteData.value.categoriaId);
  const categoriaNombre = categoria ? categoria.nombre : 'Sin categoría';

  return [{
    numEmpleado: docenteData.value.numEmpleado,
    nombre: docenteData.value.persona?.nombre || 'No disponible',
    categoria: categoriaNombre,
    categoriaId: docenteData.value.categoriaId,
    email: docenteData.value.persona?.email || 'No disponible',
    actions: ''
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

    const response = await fetch(`https://localhost:9000/docentes/${numEmpleado}`);

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

const fetchCategorias = async () => {
  try {
    loadingCategorias.value = true;
    const response = await fetch('https://localhost:9000/categoriaEmpleados');
    if (!response.ok) {
      throw new Error('Error al cargar categorías');
    }
    categorias.value = await response.json();
  } catch (err) {
    console.error('Error fetching categorías:', err);
    error.value = err.message;
  } finally {
    loadingCategorias.value = false;
  }
};

const getCategoriaName = (id) => {
  const categoria = categorias.value.find(c => c.clave === id);
  return categoria ? categoria.nombre : '';
};

watch(() => props.numEmpleado, (newVal) => {
  fetchDocente(newVal);
}, { immediate: true });

onMounted(() => {
  fetchCategorias();
});
</script>

<style scoped>
.single-row-table {
  border: thin solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

.single-row-table :deep(.v-data-table__wrapper) {
  overflow-y: auto;
}
</style>