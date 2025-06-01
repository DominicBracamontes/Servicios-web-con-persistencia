<template>
  <v-btn color="primary" class="mb-4" @click="abrirDialogoAgregar">
    Agregar Asignatura
  </v-btn>

  <!-- Tabla -->
  <v-data-table
    :headers="headers"
    :items="asignaturas"
    :loading="loading"
    hide-default-footer
    class="inscripciones-table"
  >
    <template v-slot:loading>
      <v-progress-linear indeterminate color="primary" />
    </template>

    <template v-slot:no-data>
      <v-alert type="info" class="mt-4">
        {{ noDataMessage }}
      </v-alert>
    </template>

    <template #item.acciones="{ item }">
  <v-icon color="blue" class="mr-2" @click="abrirDialogoEditar(item)" style="cursor: pointer;">
    mdi-pencil
  </v-icon>
  <v-icon color="orange" class="mr-2" @click="abrirDialogoPatch(item)" style="cursor: pointer;">
  mdi-pencil
</v-icon>

  <v-icon color="red" class="mr-2" @click="abrirDialogoEliminar(item)" style="cursor: pointer;">
    mdi-delete
  </v-icon>
</template>

  </v-data-table>

  <!-- DELETE -->
  <v-dialog v-model="deleteDialog" persistent max-width="500">
    <v-card>
      <v-card-title class="text-h5">Confirmar Eliminación</v-card-title>
      <v-card-text>
        ¿Estás seguro que deseas eliminar el contrato de la asignatura
        <strong>{{ asignaturaAEliminar?.nombre }}</strong> (Clave:
        {{ asignaturaAEliminar?.asignaturaId }})?
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" color="blue-darken-1" @click="deleteDialog = false" :disabled="deleting">
          Cancelar
        </v-btn>
        <v-btn variant="text" color="red-darken-1" @click="confirmarEliminacion" :loading="deleting" :disabled="deleting">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- POST -->
  <v-dialog v-model="addDialog" persistent max-width="500">
    <v-card>
      <v-card-title class="text-h5">Agregar Asignatura</v-card-title>
      <v-card-text>
        <v-select
  v-model="asignaturaSeleccionada"
  :items="todasAsignaturas"
  item-title="display"
  item-value="clave"
  label="Selecciona una asignatura"
  :return-object="false"
/>


      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" color="blue-darken-1" @click="addDialog = false" :disabled="agregando">
          Cancelar
        </v-btn>
        <v-btn variant="text" color="green-darken-1" @click="confirmarAgregar" :loading="agregando" :disabled="!asignaturaSeleccionada || agregando">
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <!-- PUT -->
<v-dialog v-model="editDialog" persistent max-width="500">
  <v-card>
    <v-card-title class="text-h5">Editar Contrato</v-card-title>
    <v-card-text>
      <v-card-text>
  <v-text-field
  v-model="formularioEdicion.nuevoNumEmpleado"
  label="Nuevo número de empleado"
  type="number"
  :error="!!erroresEdicion.nuevoNumEmpleado"
  :error-messages="erroresEdicion.nuevoNumEmpleado"
/>

<v-text-field
  v-model="formularioEdicion.nuevaClave"
  label="Nueva clave de asignatura"
  type="number"
  :error="!!erroresEdicion.nuevaClave"
  :error-messages="erroresEdicion.nuevaClave"
/>

</v-card-text>

    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" color="blue-darken-1" @click="editDialog = false" :disabled="editando">
        Cancelar
      </v-btn>
      <v-btn variant="text" color="green-darken-1" @click="confirmarEdicion" :loading="editando" :disabled="editando">
        Confirmar
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
<!-- PATCH -->
<v-dialog v-model="patchDialog" persistent max-width="500">
  <v-card>
    <v-card-title class="text-h5">Editar Contrato (PATCH)</v-card-title>
    <v-card-text>
      <v-text-field
        v-model="formularioPatch.nuevoNumEmpleado"
        label="Nuevo número de empleado"
        type="number"
        :error="!!erroresPatch.nuevoNumEmpleado"
        :error-messages="erroresPatch.nuevoNumEmpleado"
      />
      <v-text-field
        v-model="formularioPatch.nuevaClave"
        label="Nueva clave de asignatura"
        type="number"
        :error="!!erroresPatch.nuevaClave"
        :error-messages="erroresPatch.nuevaClave"
      />
    </v-card-text>
    <v-card-actions>
      <v-spacer />
      <v-btn variant="text" color="blue-darken-1" @click="patchDialog = false" :disabled="editando">
        Cancelar
      </v-btn>
      <v-btn variant="text" color="orange-darken-1" @click="confirmarPatch" :loading="editando" :disabled="editando">
        Confirmar
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

</template>


<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  numEmpleado: {
    type: String,
    required: true
  }
});

// Tabla
const headers = [
  { title: 'Clave', key: 'asignaturaId', width: '100px' },
  { title: 'Nombre de Asignatura', key: 'nombre', width: '300px' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center', width: '80px' }
];

const asignaturas = ref([]);
const loading = ref(false);
const noDataMessage = ref('Ingrese un número de empleado para buscar asignaturas');

// DELETE
const deleteDialog = ref(false);
const deleting = ref(false);
const asignaturaAEliminar = ref(null);

// POST
const addDialog = ref(false);
const agregando = ref(false);
const todasAsignaturas = ref([]);
const asignaturaSeleccionada = ref(null);

// PUT
const editDialog = ref(false);
const editando = ref(false);
const formularioEdicion = ref({
  clave: null,
  nuevoNumEmpleado: null,
  nuevaClave: null
});
const erroresEdicion = ref({
  nuevoNumEmpleado: '',
  nuevaClave: ''
});

// PATCH
const patchDialog = ref(false);
const formularioPatch = ref({
  clave: null,
  nuevoNumEmpleado: null,
  nuevaClave: null
});
const erroresPatch = ref({
  nuevoNumEmpleado: '',
  nuevaClave: ''
});

const abrirDialogoPatch = (asignatura) => {
  formularioPatch.value = {
    clave: asignatura.asignaturaId,
    nuevoNumEmpleado: props.numEmpleado,
    nuevaClave: asignatura.asignaturaId
  };
  erroresPatch.value = {
    nuevoNumEmpleado: '',
    nuevaClave: ''
  };
  patchDialog.value = true;
};

const confirmarPatch = async () => {
  erroresPatch.value = {
    nuevoNumEmpleado: '',
    nuevaClave: ''
  };

  const { clave, nuevoNumEmpleado, nuevaClave } = formularioPatch.value;

  if (!nuevoNumEmpleado) {
    erroresPatch.value.nuevoNumEmpleado = 'Este campo es obligatorio';
  }
  if (!nuevaClave) {
    erroresPatch.value.nuevaClave = 'Este campo es obligatorio';
  }

  if (erroresPatch.value.nuevoNumEmpleado || erroresPatch.value.nuevaClave) return;

  editando.value = true;
  try {
    const res = await fetch(`https://localhost:9000/contratos/${props.numEmpleado}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave, nuevoNumEmpleado, nuevaClave })
    });

    const result = await res.json();
    if (result.status !== 'success') {
      if (result.message.includes('docente')) {
        erroresPatch.value.nuevoNumEmpleado = 'Número de empleado no válido o no existe';
      }
      if (result.message.includes('asignatura')) {
        erroresPatch.value.nuevaClave = 'Clave de asignatura no válida o no existe';
      }
      throw new Error(result.message);
    }

    await fetchAsignaturas(props.numEmpleado);
    patchDialog.value = false;
  } catch (err) {
    console.error(err);
  } finally {
    editando.value = false;
  }
};


// DELETE
const abrirDialogoEliminar = (asignatura) => {
  asignaturaAEliminar.value = asignatura;
  deleteDialog.value = true;
};

const confirmarEliminacion = async () => {
  if (!asignaturaAEliminar.value) return;

  deleting.value = true;
  try {
    const res = await fetch(
      `https://localhost:9000/contratos/${props.numEmpleado}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clave: asignaturaAEliminar.value.asignaturaId })
      }
    );
    const result = await res.json();
    if (result.status !== 'success') throw new Error(result.message);

    asignaturas.value = asignaturas.value.filter(
      a => a.asignaturaId !== asignaturaAEliminar.value.asignaturaId
    );

    deleteDialog.value = false;
    asignaturaAEliminar.value = null;

    if (asignaturas.value.length === 0) {
      noDataMessage.value = 'No se encontraron asignaturas para este docente';
    }
  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    deleting.value = false;
  }
};

// POST
const abrirDialogoAgregar = async () => {
  addDialog.value = true;
  asignaturaSeleccionada.value = null;

  try {
    const res = await fetch('https://localhost:9000/asignaturas');
    const result = await res.json();  

    todasAsignaturas.value = result.map(a => ({
      ...a,
      display: `${a.clave} - ${a.nombre}`
    }));
  } catch (err) {
    alert(`Error al cargar asignaturas: ${err.message}`);
    addDialog.value = false;
  }
};

const confirmarAgregar = async () => {
  if (!asignaturaSeleccionada.value) return;

  agregando.value = true;
  try {
    const res = await fetch(`https://localhost:9000/contratos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        numEmpleado: props.numEmpleado,
    clave: asignaturaSeleccionada.value, 
      })
    });

    const result = await res.json();
    if (result.status !== 'success') throw new Error(result.message);

    await fetchAsignaturas(props.numEmpleado);

    addDialog.value = false;
    asignaturaSeleccionada.value = null;
  } catch (err) {
    alert(`Error al agregar contrato: ${err.message}`);
  } finally {
    agregando.value = false;
  }
};

// PUT
const abrirDialogoEditar = (asignatura) => {
  formularioEdicion.value = {
    clave: asignatura.asignaturaId, 
    nuevoNumEmpleado: null,
    nuevaClave: null
  };
  editDialog.value = true;
};

const confirmarEdicion = async () => {
  erroresEdicion.value = {
    nuevoNumEmpleado: '',
    nuevaClave: ''
  };

  const { clave, nuevoNumEmpleado, nuevaClave } = formularioEdicion.value;

  if (!nuevoNumEmpleado) {
    erroresEdicion.value.nuevoNumEmpleado = 'Este campo es obligatorio';
  }
  if (!nuevaClave) {
    erroresEdicion.value.nuevaClave = 'Este campo es obligatorio';
  }

  if (erroresEdicion.value.nuevoNumEmpleado || erroresEdicion.value.nuevaClave) {
    return;
  }

  editando.value = true;
  try {
    const res = await fetch(`https://localhost:9000/contratos/${props.numEmpleado}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clave, nuevoNumEmpleado, nuevaClave })
    });

    const result = await res.json();
    if (result.status !== 'success') {
      if (result.message.includes('docente')) {
        erroresEdicion.value.nuevoNumEmpleado = 'Número de empleado no válido o no existe';
      }
      if (result.message.includes('asignatura')) {
        erroresEdicion.value.nuevaClave = 'Clave de asignatura no válida o no existe';
      }
      throw new Error(result.message);
    }

    await fetchAsignaturas(props.numEmpleado);

    editDialog.value = false;
    formularioEdicion.value = {
      clave: null,
      nuevoNumEmpleado: null,
      nuevaClave: null
    };
  } catch (err) {
    console.error(err);
  } finally {
    editando.value = false;
  }
};

const fetchAsignaturas = async (numEmpleado) => {
  if (!numEmpleado) {
    asignaturas.value = [];
    noDataMessage.value = 'Ingrese un número de empleado para buscar asignaturas';
    return;
  }

  try {
    loading.value = true;
    noDataMessage.value = 'Cargando asignaturas...';

    const res = await fetch(`https://localhost:9000/docentes/${numEmpleado}/contratos`);
    const result = await res.json();
    if (result.status !== 'success') throw new Error(result.message);

    asignaturas.value = result.data.map(contrato => ({
      asignaturaId: contrato.asignatura.clave,
      nombre: contrato.asignatura.nombre
    }));

    if (asignaturas.value.length === 0) {
      noDataMessage.value = 'No se encontraron asignaturas para este docente';
    }
  } catch (err) {
    asignaturas.value = [];
    noDataMessage.value = err.message;
  } finally {
    loading.value = false;
  }
};

watch(() => props.numEmpleado, fetchAsignaturas, { immediate: true });
</script>

<style scoped>
.inscripciones-table :deep(th),
.inscripciones-table :deep(td) {
  padding: 4px 6px !important;
  font-size: 13px;
  white-space: nowrap;
}

.inscripciones-table {
  border: thin solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
  margin-top: 20px;
}
</style>
