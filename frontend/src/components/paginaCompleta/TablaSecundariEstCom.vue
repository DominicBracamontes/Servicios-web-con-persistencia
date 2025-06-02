<template>
  <div>
    <!-- BOTON POST -->
    <div class="d-flex justify-start mb-4">
      <v-btn color="primary" @click="dialog = true">Agregar inscripción</v-btn>
    </div>

    <!-- POST -->
    <v-dialog v-model="dialog" max-width="500">
      <v-card>
        <v-card-title>Agregar inscripción</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="crearInscripcion">
            <v-text-field v-model="form.asignaturaId" label="Clave de Asignatura" required />
            <v-text-field v-model="form.semestre" label="Semestre (ej. 20241)" required />
            <v-text-field v-model="form.calificacion" label="Calificación" type="number" required />
            <v-btn type="submit" color="primary" class="mt-3" block>
              Guardar
            </v-btn>
          </v-form>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- TABLA-->
    <v-data-table :headers="headers" :items="inscripciones" :loading="loading" hide-default-footer
      class="inscripciones-table">
      <template v-slot:loading>
        <v-progress-linear indeterminate color="primary"></v-progress-linear>
      </template>

      <template v-slot:no-data>
        <v-alert :type="error ? 'error' : 'info'" class="mt-4">
          {{ noDataMessage }}
        </v-alert>
      </template>

      <template v-slot:item.acciones="{ item }">
        <v-icon color="blue" class="mr-1 cursor-pointer" size="20" @click="abrirDialogoEditar(item)">
          mdi-pencil
        </v-icon>

        <v-icon color="orange" class="mr-1 cursor-pointer" size="20" @click="abrirDialogoPatch(item)">
          mdi-pencil
        </v-icon>

        <v-icon color="red" class="cursor-pointer" size="20" @click="abrirDialogoEliminar(item)">
          mdi-delete
        </v-icon>
      </template>
    </v-data-table>

    <!-- DELETE -->
    <v-dialog v-model="deleteDialog" persistent max-width="500">
      <v-card>
        <v-card-title class="text-h5">Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar la inscripción de
          <strong>{{ inscripcionAEliminar?.asignatura }}</strong>
          (Clave: {{ inscripcionAEliminar?.clave }}, Semestre: {{ inscripcionAEliminar?.semestre }})?
          <br /><br />
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
  </div>

  <!-- PUT -->
  <v-dialog v-model="editDialog" persistent max-width="500">
    <v-card>
      <v-card-title class="text-h5">Editar Inscripción</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="confirmEdit">
          <v-text-field v-model="editForm.nuevaClaveAsignatura" label="Nueva Clave de Asignatura" required />
          <v-text-field v-model="editForm.nuevoSemestre" label="Nuevo Semestre (ej. 20241)" required />
          <v-text-field v-model="editForm.nuevaCalificacion" label="Nueva Calificación" type="number" required />
          <v-btn type="submit" color="primary" block class="mt-3" :loading="editing">
            Guardar Cambios
          </v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="editDialog = false" :disabled="editing">
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- PATCH -->
  <v-dialog v-model="patchDialog" persistent max-width="500">
    <v-card>
      <v-card-title class="text-h5">Editar Parcial Inscripción</v-card-title>
      <v-card-text>
        <v-form @submit.prevent="confirmPatch">
          <v-text-field v-model="patchForm.nuevaClaveAsignatura" label="Clave de Asignatura" required />
          <v-text-field v-model="patchForm.nuevaCalificacion" label="Calificación" type="number" required />
          <v-btn type="submit" color="orange" block class="mt-3" :loading="patching">
            Actualizar Parcial
          </v-btn>
        </v-form>
      </v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" @click="patchDialog = false" :disabled="patching">
          Cancelar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  matricula: {
    type: String,
    required: true
  }
});

const headers = [
  { title: 'Clave', key: 'clave', width: '80px' },
  { title: 'Asignatura', key: 'asignatura', width: '180px' },
  { title: 'Créditos', key: 'creditos', align: 'center', width: '80px' },
  { title: 'Semestre', key: 'semestre', align: 'center', width: '100px' },
  { title: 'Calificación', key: 'calificacion', align: 'center', width: '110px' },
  { title: 'Acciones', key: 'acciones', align: 'center', sortable: false, width: '110px' }
];



const inscripciones = ref([]);
const loading = ref(false);
const error = ref(null);
const noDataMessage = ref('Ingrese una matrícula para buscar asignaturas');

const editDialog = ref(false);
const editing = ref(false);
const inscripcionAEditar = ref(null);

const patchDialog = ref(false);
const patching = ref(false);
const inscripcionAEditarParcial = ref(null);

//PATCH
const patchForm = ref({
  nuevaClaveAsignatura: '',
  nuevaCalificacion: ''
});

const abrirDialogoPatch = (item) => {
  inscripcionAEditarParcial.value = item;
  patchForm.value = {
    nuevaClaveAsignatura: item.clave,
    nuevaCalificacion: item.calificacion !== 'N/A' ? item.calificacion : ''
  };
  patchDialog.value = true;
};

const confirmPatch = async () => {
  const { nuevaClaveAsignatura, nuevaCalificacion } = patchForm.value;

  if (!nuevaClaveAsignatura || nuevaCalificacion === '') {
    alert('Debes completar todos los campos');
    return;
  }

  try {
    patching.value = true;

    const response = await fetch(`https://localhost:9000/inscripciones/${props.matricula}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claveAsignaturaOriginal: inscripcionAEditarParcial.value.clave,
        semestreOriginal: inscripcionAEditarParcial.value.semestre.replace('-', ''),
        nuevaClaveAsignatura,
        nuevaCalificacion: parseFloat(nuevaCalificacion)
      })
    });

    if (!response.ok) throw new Error('Error al actualizar inscripción');

    patchDialog.value = false;
    await fetchInscripciones(props.matricula);
  } catch (err) {
    alert('No se pudo actualizar parcialmente la inscripción');
    console.error(err);
  } finally {
    patching.value = false;
    inscripcionAEditarParcial.value = null;
  }
};

// PUT
const editForm = ref({
  nuevaClaveAsignatura: '',
  nuevoSemestre: '',
  nuevaCalificacion: ''
});

const abrirDialogoEditar = (item) => {
  inscripcionAEditar.value = item;
  editForm.value = {
    nuevaClaveAsignatura: '',
    nuevoSemestre: '',
    nuevaCalificacion: ''
  };
  editDialog.value = true;
};

const confirmEdit = async () => {
  const { nuevaClaveAsignatura, nuevoSemestre, nuevaCalificacion } = editForm.value;

  if (!nuevaClaveAsignatura || !nuevoSemestre || !nuevaCalificacion) {
    alert('Debes completar todos los campos');
    return;
  }

  try {
    editing.value = true;

    const response = await fetch(`https://localhost:9000/inscripciones/${props.matricula}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claveAsignaturaOriginal: inscripcionAEditar.value.clave,
        semestreOriginal: inscripcionAEditar.value.semestre.replace('-', ''),
        nuevaClaveAsignatura,
        nuevoSemestre,
        nuevaCalificacion: parseFloat(nuevaCalificacion)
      })
    });

    if (!response.ok) throw new Error('Error al editar inscripción');

    editDialog.value = false;
    await fetchInscripciones(props.matricula);
  } catch (err) {
    alert('No se pudo actualizar la inscripción');
    console.error(err);
  } finally {
    editing.value = false;
    inscripcionAEditar.value = null;
  }
};

// POST
const dialog = ref(false);
const form = ref({
  asignaturaId: '',
  semestre: '',
  calificacion: ''
});

const crearInscripcion = async () => {
  try {
    const payload = {
      estudianteId: props.matricula,
      asignaturaId: form.value.asignaturaId,
      semestre: form.value.semestre,
      calificacion: parseFloat(form.value.calificacion)
    };

    const response = await fetch('https://localhost:9000/inscripciones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error('Error al crear inscripción');

    dialog.value = false;
    form.value = { asignaturaId: '', semestre: '', calificacion: '' };
    await fetchInscripciones(props.matricula);
  } catch (err) {
    alert('No se pudo crear la inscripción');
    console.error(err);
  }
};

//DELETE
const deleteDialog = ref(false);
const deleting = ref(false);
const inscripcionAEliminar = ref(null);

const abrirDialogoEliminar = (item) => {
  inscripcionAEliminar.value = item;
  deleteDialog.value = true;
};

const confirmDelete = async () => {
  if (!inscripcionAEliminar.value) return;

  try {
    deleting.value = true;
    const response = await fetch(`https://localhost:9000/inscripciones/${props.matricula}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        claveAsignatura: inscripcionAEliminar.value.clave,
        semestre: inscripcionAEliminar.value.semestre.replace('-', '')
      })
    });

    if (!response.ok) throw new Error('Error al eliminar inscripción');

    deleteDialog.value = false;
    await fetchInscripciones(props.matricula);
  } catch (err) {
    alert('No se pudo eliminar la inscripción');
    console.error(err);
  } finally {
    deleting.value = false;
    inscripcionAEliminar.value = null;
  }
};

const fetchInscripciones = async (matricula) => {
  if (!matricula) {
    inscripciones.value = [];
    noDataMessage.value = 'Ingrese una matrícula para buscar';
    return;
  }

  try {
    loading.value = true;
    error.value = null;
    noDataMessage.value = 'Cargando asignaturas inscritas...';

    const response = await fetch(`https://localhost:9000/inscripciones/estudiante/${matricula}`);

    if (!response.ok) {
      throw new Error(response.status === 404
        ? 'No se encontraron asignaturas para este estudiante'
        : 'Error al cargar asignaturas');
    }

    const result = await response.json();

    if (result.status !== 'success') {
      throw new Error(result.message || 'Error en la respuesta del servidor');
    }

    inscripciones.value = result.data.map(item => ({
      clave: item.asignatura.clave,
      asignatura: item.asignatura.nombre,
      creditos: item.asignatura.creditos,
      semestre: item.semestre.toString().replace(/(\d{4})(\d{1})/, '$1-$2'),
      calificacion: item.calificacion ?? 'N/A'
    }));

    noDataMessage.value = 'No se encontraron asignaturas inscritas';

  } catch (err) {
    error.value = err.message;
    noDataMessage.value = err.message;
    inscripciones.value = [];
  } finally {
    loading.value = false;
  }
};

watch(() => props.matricula, (newVal) => {
  if (newVal) {
    fetchInscripciones(newVal);
  }
}, { immediate: true });
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

.inscripciones-table :deep(td:nth-child(5)) {
  font-weight: bold;
  color: var(--v-primary-base);
}

.cursor-pointer {
  cursor: pointer;
}
</style>