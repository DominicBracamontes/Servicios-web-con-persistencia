<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  clave: {
    type: String,
    default: null
  }
});

const loading = ref(false);
const error = ref(null);
const docentesAsignatura = ref([]);
const noDataMessage = ref('Ingrese una clave para buscar');

const deleteDialog = ref(false);
const deleting = ref(false);
const contratoAEliminar = ref(null);

const addDialog = ref(false);  
const adding = ref(false);
const nuevoNumEmpleado = ref('');

const headers = [
  { title: 'Núm. Empleado', key: 'numEmpleado', width: '150px', align: 'center' },
  { title: 'Docente', key: 'nombre', width: '300px' },
  { title: 'Acciones', key: 'acciones', width: '80px', align: 'center' },
];

function abrirDialogoEliminar(contrato) {
  contratoAEliminar.value = contrato;
  deleteDialog.value = true;
  error.value = null;
}

async function confirmarEliminacion() {
  if (!contratoAEliminar.value) return;

  deleting.value = true;
  error.value = null;

  try {
    const response = await fetch(`https://localhost:3000/contratos/${contratoAEliminar.value.numEmpleado}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clave: props.clave
      })
    });

    if (!response.ok) {
      throw new Error(`Error al eliminar contrato del empleado ${contratoAEliminar.value.numEmpleado}`);
    }

    docentesAsignatura.value = docentesAsignatura.value.filter(
      (item) =>
        !(item.numEmpleado === contratoAEliminar.value.numEmpleado && item.clave === props.clave)
    );

    deleteDialog.value = false;
    contratoAEliminar.value = null;
  } catch (err) {
    error.value = err.message || 'Error al eliminar contrato';
  } finally {
    deleting.value = false;
  }
}

function abrirDialogoAgregar() {
  nuevoNumEmpleado.value = '';
  addDialog.value = true;
  error.value = null;
}

async function confirmarAgregar() {
  if (!nuevoNumEmpleado.value) {
    error.value = 'Ingrese el número de empleado';
    return;
  }

  adding.value = true;
  error.value = null;

  try {
    const response = await fetch('https://localhost:3000/contratos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numEmpleado: nuevoNumEmpleado.value,
        clave: props.clave
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error al agregar contrato');
    }

    await fetchDocentes(props.clave);

    addDialog.value = false;
    nuevoNumEmpleado.value = '';
  } catch (err) {
    error.value = err.message || 'Error al agregar contrato';
  } finally {
    adding.value = false;
  }
}


const fetchDocentes = async (clave) => {
  if (!clave) {
    docentesAsignatura.value = [];
    noDataMessage.value = 'Ingrese una clave para buscar';
    error.value = null;
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    noDataMessage.value = 'Cargando docentes...';

    const response = await fetch(`https://localhost:3000/contratos/asignaturas/${clave}`);
    if (!response.ok) {
      throw new Error(`Error al cargar docentes para la clave ${clave}`);
    }
    const json = await response.json();

    if (json.status === 'success' && Array.isArray(json.data)) {
      docentesAsignatura.value = json.data;
      noDataMessage.value = 'No se encontraron docentes para esta clave';
    } else {
      docentesAsignatura.value = [];
      noDataMessage.value = 'No se encontraron docentes para esta clave';
    }
  } catch (err) {
    error.value = err.message || 'Error al cargar docentes';
    docentesAsignatura.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.clave, (newClave) => {
  fetchDocentes(newClave);
}, { immediate: true });
</script>

<template>
  <div>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

    <v-btn
      color="primary"
      class="mb-4"
      @click="abrirDialogoAgregar"
      :disabled="!props.clave"
      title="Agregar contrato para la clave actual"
    >
      Agregar Contrato
    </v-btn>

    <template v-if="!loading && docentesAsignatura.length > 0">
      <v-data-table
        :headers="headers"
        :items="docentesAsignatura"
        :loading="loading"
        hide-default-footer
        class="single-row-table"
      >
        <template v-slot:item.acciones="{ item }">
          <v-icon
            color="red"
            class="cursor-pointer"
            @click="abrirDialogoEliminar(item)"
            title="Eliminar contrato"
          >
            mdi-delete
          </v-icon>
        </template>

        <template v-slot:loading>
          <v-progress-linear indeterminate color="primary" />
        </template>

        <template v-slot:no-data>
          <v-alert :type="error ? 'error' : 'info'" class="mt-4">
            {{ noDataMessage }}
          </v-alert>
        </template>
      </v-data-table>
    </template>

    <v-alert
      v-else-if="!loading && docentesAsignatura.length === 0"
      type="info"
      class="mt-4"
    >
      {{ noDataMessage }}
    </v-alert>

    <v-progress-linear v-if="loading" indeterminate color="primary" class="mt-4" />

    <!-- DELETE-->
    <v-dialog v-model="deleteDialog" persistent max-width="500">
      <v-card>
        <v-card-title class="text-h5">Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar el contrato del empleado
          <strong>{{ contratoAEliminar?.nombre || contratoAEliminar?.numEmpleado }}</strong>
          (Núm. Empleado: {{ contratoAEliminar?.numEmpleado }})?
          <br /><br />
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
            @click="confirmarEliminacion"
            :loading="deleting"
            :disabled="deleting"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- POST -->
    <v-dialog v-model="addDialog" persistent max-width="400">
      <v-card>
        <v-card-title class="text-h5">Agregar Contrato</v-card-title>
        <v-card-text>
          <v-text-field
            label="Número de Empleado"
            v-model="nuevoNumEmpleado"
            type="number"
            :disabled="adding"
            autofocus
          />
          <p>Clave de asignatura: <strong>{{ props.clave }}</strong></p>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn
            color="blue-darken-1"
            variant="text"
            @click="addDialog = false"
            :disabled="adding"
          >
            Cancelar
          </v-btn>
          <v-btn
            color="green darken-1"
            variant="text"
            @click="confirmarAgregar"
            :loading="adding"
            :disabled="adding"
          >
            Agregar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.single-row-table {
  border: thin solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  width: 100%;
  max-width: 600px;
  max-height: 250px;
  margin: 0 auto;
}

.single-row-table :deep(.v-data-table__wrapper) {
  overflow-y: auto;
}

.single-row-table :deep(th),
.single-row-table :deep(td) {
  padding: 0 12px;
}

.single-row-table :deep(th:nth-child(1)),
.single-row-table :deep(td:nth-child(1)) {
  text-align: center;
}

.cursor-pointer {
  cursor: pointer;
}

.mx-1 {
  margin: 0 4px;
}
</style>
