<template>
  <div>
    <v-text-field
      v-model="semestre"
      label="Ingrese el semestre"
      type="text"
      class="mb-4"
      @keyup.enter="filtrarInscripciones"
    />

    <v-alert v-if="error" type="error" class="mb-4">
      {{ error }}
    </v-alert>

    <div style="max-height: 300px; overflow-y: auto;">
      <v-data-table-virtual
        :headers="headers"
        :items="inscripcionesFiltradas"
        item-value="id"
        height="400"
      >
        <template v-slot:item.acciones="{ item }">
          <v-icon
            color="red"
            class="cursor-pointer"
            title="Eliminar inscripción"
            @click="abrirDialogoEliminacion(item)"
          >
            mdi-delete
          </v-icon>
        </template>
      </v-data-table-virtual>
    </div>

    <v-alert
      v-if="inscripcionesFiltradas.length === 0 && !error"
      type="info"
      class="mt-4"
    >
      {{ noDataMessage }}
    </v-alert>

    <!-- DELETE -->
    <v-dialog v-model="deleteDialog" persistent max-width="500">
      <v-card>
        <v-card-title class="text-h5">Confirmar Eliminación</v-card-title>
        <v-card-text>
          ¿Estás seguro que deseas eliminar la inscripción del estudiante
          <strong>{{ inscripcionAEliminar?.nombre || inscripcionAEliminar?.matricula }}</strong>
          (Matrícula: {{ inscripcionAEliminar?.matricula }})?
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
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';

const props = defineProps({
  clave: {
    type: String,
    required: true
  }
});

const semestre = ref('');
const inscripciones = ref([]);
const estudiantes = ref([]);
const inscripcionesFiltradas = ref([]);
const error = ref(null);
const noDataMessage = ref('Ingrese un semestre para ver las inscripciones');

const deleteDialog = ref(false);
const inscripcionAEliminar = ref(null);
const deleting = ref(false);

const headers = [
  { title: 'Matrícula', key: 'matricula' },
  { title: 'Estudiante', key: 'nombre' },
  { title: 'Calificación', key: 'calificacion' },
  { title: 'Acciones', key: 'acciones', align: 'center', width: '100px' }
];

const cargarInscripciones = async () => {
  try {
    const [inscRes, estRes] = await Promise.all([
      fetch('https://localhost:3000/inscripciones'),
      fetch('https://localhost:3000/estudiantes')
    ]);

    const inscJson = await inscRes.json();
    const estJson = await estRes.json();

    const mapaEstudiantes = new Map();
    estJson.forEach(est => {
      mapaEstudiantes.set(est.matricula, est.persona.nombre);
    });

    const enriquecidas = (inscJson.data || []).map(insc => {
      return {
        id: insc.id,
        asignaturaId: insc.asignaturaId,
        semestre: insc.semestre,
        calificacion: insc.calificacion,
        matricula: insc.estudianteId,
        nombre: mapaEstudiantes.get(insc.estudianteId) || 'Desconocido'
      };
    });

    inscripciones.value = enriquecidas;
    filtrarInscripciones();
  } catch (err) {
    error.value = 'Error al cargar datos';
    inscripciones.value = [];
  }
};

const filtrarInscripciones = () => {
  if (!semestre.value) {
    inscripcionesFiltradas.value = inscripciones.value.filter(
      insc => insc.asignaturaId === parseInt(props.clave)
    );
    noDataMessage.value = 'Mostrando todos los registros de esta asignatura';
    return;
  }

  const semestreNum = parseInt(semestre.value);

  inscripcionesFiltradas.value = inscripciones.value.filter(
    insc =>
      insc.asignaturaId === parseInt(props.clave) &&
      insc.semestre === semestreNum
  );

  noDataMessage.value =
    inscripcionesFiltradas.value.length === 0
      ? 'No hay inscripciones para la clave y semestre proporcionados'
      : '';
};

const abrirDialogoEliminacion = (item) => {
  inscripcionAEliminar.value = item;
  deleteDialog.value = true;
};

const confirmarEliminacion = async () => {
  if (!inscripcionAEliminar.value) return;

  deleting.value = true;

  try {
    const res = await fetch(
      `https://localhost:3000/inscripciones/${inscripcionAEliminar.value.matricula}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claveAsignatura: inscripcionAEliminar.value.asignaturaId,
          semestre: inscripcionAEliminar.value.semestre
        })
      }
    );

    if (!res.ok) throw new Error('Error al eliminar la inscripción');

    inscripciones.value = inscripciones.value.filter(
      insc =>
        !(
          insc.matricula === inscripcionAEliminar.value.matricula &&
          insc.asignaturaId === inscripcionAEliminar.value.asignaturaId &&
          insc.semestre === inscripcionAEliminar.value.semestre
        )
    );

    deleteDialog.value = false;
    inscripcionAEliminar.value = null;
    filtrarInscripciones();
  } catch (err) {
    error.value = err.message || 'Error al eliminar inscripción';
  } finally {
    deleting.value = false;
  }
};

onMounted(() => {
  cargarInscripciones();
});

watch(() => props.clave, cargarInscripciones);
</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
