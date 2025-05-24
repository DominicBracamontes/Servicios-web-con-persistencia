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
  size="16"
    color="blue"
    class="mr-2"
    @click="abrirDialogoEdicion(item)"
    title="Editar docente"
  >
    mdi-pencil
  </v-icon>

  <v-icon
  size="16"
    color="orange"
    class="mr-2"
    @click="abrirDialogoPatch(item)"
    title="Editar docente (PATCH)"
  >
    mdi-pencil
  </v-icon>

  <v-icon
  size="16"
    color="red"
    @click="openDeleteDialog(item)"
    title="Eliminar docente"
  >
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

    <!-- PUT -->
    <v-dialog v-model="editDialog" persistent max-width="500px">
  <v-card>
    <v-card-title class="text-h5">Editar Docente</v-card-title>
    <v-card-text>
      <v-form>
        <v-text-field
          v-model="docenteAEditar.nuevoNumEmpleado"
          label="Nuevo Núm. Empleado"
          type="number"
          required
        />
        <v-text-field
          v-model="docenteAEditar.categoriaId"
          label="ID de Categoría"
          type="number"
          required
        />
        <v-text-field
          v-model="docenteAEditar.persona.nombre"
          label="Nombre"
          required
        />
        <v-text-field
          v-model="docenteAEditar.persona.email"
          label="Email"
          type="email"
          required
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="editDialog.value = false">Cancelar</v-btn>
      <v-btn color="primary" @click="guardarEdicion">Guardar</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<!-- PATCH -->
<v-dialog v-model="patchDialog" persistent max-width="500px">
  <v-card>
    <v-card-title class="text-h5">Editar Docente (PATCH)</v-card-title>
    <v-card-text>
      <v-form>
        <v-text-field
          v-model="docenteAPatch.nuevoNumEmpleado"
          label="Nuevo Núm. Empleado"
          type="number"
          required
        />
        <v-text-field
          v-model="docenteAPatch.categoriaId"
          label="ID de Categoría"
          type="number"
          required
        />
        <v-text-field
          v-model="docenteAPatch.persona.nombre"
          label="Nombre"
          required
        />
        <v-text-field
          v-model="docenteAPatch.persona.email"
          label="Email"
          type="email"
          required
        />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn text @click="patchDialog = false">Cancelar</v-btn>
      <v-btn color="primary" @click="guardarPatch">Guardar</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>


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

const emit = defineEmits(['docenteDeleted']);

const headers = [
  { title: 'Núm. Empleado', key: 'numEmpleado', width: '120px' },
  { title: 'Nombre', key: 'nombre', width: '200px' },
  { title: 'Categoría', key: 'categoria' },
  { title: 'Email', key: 'email' },
  { title: 'Acciones', key: 'actions', sortable: false, width: '100px' }
];

const deleteDialog = ref(false);
const docenteToDelete = ref(null);
const deleting = ref(false);

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

const patchDialog = ref(false);
const docenteAPatch = ref({
  nuevoNumEmpleado: '',
  categoriaId: '',
  persona: {
    nombre: '',
    email: ''
  }
});
const docenteToPatch = ref(null); 
const docenteOriginalPatch = ref(null);
const docenteData = ref(null);
const loading = ref(false);
const error = ref(null);
const noDataMessage = ref('Ingrese un número de empleado para buscar');

const formattedDocenteData = computed(() => {
  if (!docenteData.value) return [];
  
  return [{
    numEmpleado: docenteData.value.numEmpleado,
    nombre: docenteData.value.persona?.nombre || 'No disponible',
    categoria: docenteData.value.categoriaId?.toString() || 'Sin categoría',
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

//put
const abrirDialogoEdicion = (docente) => {
  docenteOriginal.value = docente.numEmpleado;
  docenteAEditar.value = {
    nuevoNumEmpleado: '',
    categoriaId: '',
    persona: {
      nombre: '',
      email: ''
    }
  };
  editDialog.value = true;
};

const guardarEdicion = async () => {
  try {
    const res = await fetch(`https://localhost:3000/docentes/${docenteOriginal.value}`, {
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

//patch
const abrirDialogoPatch = (item) => {
  docenteToPatch.value = item;
  // Copiar datos actuales del item al formulario PATCH
  docenteAPatch.value = {
    nuevoNumEmpleado: item.numEmpleado || '',
    categoriaId: Number(item.categoria) || null,
    persona: {
      nombre: item.nombre || '',
      email: item.email || ''
    }
  };
  patchDialog.value = true;
};

const guardarPatch = async () => {
  if (!docenteToPatch.value) return;

  try {
    const response = await fetch(`https://localhost:3000/docentes/${docenteToPatch.value.numEmpleado}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(docenteAPatch.value)
    });

    if (!response.ok) {
      throw new Error('Error al actualizar docente');
    }

    await fetchDocente(docenteAPatch.value.nuevoNumEmpleado);

    patchDialog.value = false;
  } catch (err) {
    console.error(err);
    error.value = err.message;
  }
};

//delete

const openDeleteDialog = (docente) => {
  docenteToDelete.value = docente;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!docenteToDelete.value) return;

  try {
    deleting.value = true;
    const response = await fetch(`https://localhost:3000/docentes/${docenteToDelete.value.numEmpleado}`, {
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
</style>