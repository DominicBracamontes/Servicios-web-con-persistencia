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
<div class="d-flex justify-end mb-4">
      <v-btn color="primary" @click="nuevoDialogo = true">
        <v-icon left>mdi-plus</v-icon>
        Nuevo Docente
      </v-btn>
    </div>

<!-- TABLA -->
<template v-if="!loading && docentes.length > 0">
  <v-data-table-virtual
    :headers="headers"
    :items="docentes"
    :item-height="50"
    height="auto"
    fixed-header
    class="compact-table"
  >

    <template v-slot:item.acciones="{ item }">
  <v-icon
    size="14"
    color="blue"
    class="mx-1 cursor-pointer"
    @click="abrirDialogoEdicion(item)"
  >
    mdi-pencil
  </v-icon>
  <v-icon
    size="14"
    color="orange"
    class="mx-1 cursor-pointer"
    @click="abrirDialogoPatch(item)"
  >
    mdi-pencil
  </v-icon>
  <v-icon
    size="14"
    color="red"
    class="mx-1 cursor-pointer"
    @click="abrirDialogoEliminar(item)"
  >
    mdi-delete
  </v-icon>
</template>
    <template v-slot:bottom>
      <div class="text-caption text-right pa-2">
        Mostrando {{ docentes.length }} registros
      </div>
    </template>
  </v-data-table-virtual>
</template>

<v-alert v-else-if="!loading && docentes.length === 0" type="info" class="mt-4">
  No hay docentes disponibles
</v-alert>

<v-progress-linear v-if="loading" indeterminate color="primary" class="mt-4" />

<!-- DELETE -->
<v-dialog v-model="deleteDialog" persistent max-width="500">
  <v-card>
    <v-card-title class="text-h5">Confirmar Eliminación</v-card-title>
    <v-card-text>
      ¿Estás seguro que deseas eliminar al docente
      <strong>{{ docenteAEliminar?.nombre }}</strong> (Núm. Empleado:
      {{ docenteAEliminar?.numEmpleado }})?
      <br /><br />
      Esta acción no se puede deshacer.
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="blue-darken-1" variant="text" @click="deleteDialog = false" :disabled="deleting">
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
<v-dialog v-model="nuevoDialogo" persistent max-width="600">
  <v-card>
    <v-card-title class="text-h6">Agregar Docente</v-card-title>
    <v-card-text>
      <v-form ref="formRef" lazy-validation>
        <v-text-field v-model="nuevoDocente.numEmpleado" label="Núm. Empleado" type="number" required />
        <v-text-field v-model="nuevoDocente.categoriaId" label="Categoría ID" type="number" required />
        <v-text-field v-model="nuevoDocente.persona.nombre" label="Nombre" required />
        <v-text-field v-model="nuevoDocente.persona.email" label="Email" required />
      </v-form>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="text" @click="nuevoDialogo = false" :disabled="saving">Cancelar</v-btn>
      <v-btn color="primary" variant="text" @click="crearDocente" :loading="saving" :disabled="saving">
        Guardar
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

 <!-- PUT -->
  <v-dialog v-model="editarDialogo" persistent max-width="600">
  <v-card>
    <v-card-title class="text-h6">Editar Docente</v-card-title>
    <v-card-text>
      <v-form ref="formEditarRef" lazy-validation>
        <v-text-field 
          v-model="docenteAEditar.nuevoNumEmpleado" 
          label="Nuevo Núm. Empleado *" 
          type="number" 
          required 
          :rules="[v => !!v || 'Campo requerido']"
        />
        <v-text-field 
          v-model="docenteAEditar.categoriaId" 
          label="Categoría ID *" 
          type="number" 
          required 
          :rules="[v => !!v || 'Campo requerido']"
        />
        <v-text-field 
          v-model="docenteAEditar.persona.nombre" 
          label="Nombre *" 
          required 
          :rules="[v => !!v || 'Campo requerido']"
        />
        <v-text-field 
          v-model="docenteAEditar.persona.email" 
          label="Email *" 
          required 
          :rules="[
            v => !!v || 'Email es requerido',
            v => /.+@.+\..+/.test(v) || 'Email debe ser válido'
          ]"
        />
      </v-form>
      <small>* campos obligatorios</small>
    </v-card-text>
    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn variant="text" @click="editarDialogo = false" :disabled="editando">Cancelar</v-btn>
      <v-btn 
        color="primary" 
        variant="text" 
        @click="actualizarDocente" 
        :loading="editando" 
        :disabled="editando"
      >
        Actualizar
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>

<!--PATCH-->
<v-dialog v-model="patchDialogo" persistent max-width="600">
  <v-card>
    <v-card-title class="text-h6">
      <v-icon left>mdi-pencil</v-icon>
      Editar Docente 
    </v-card-title>
    
    
    <v-card-text>
      <v-form ref="formPatchRef">
        <!-- Número de Empleado -->
        <v-text-field 
          v-model="docenteAPatch.nuevoNumEmpleado" 
          label="Nuevo Número de Empleado"
          type="number"
          :placeholder="`Actual: ${docenteOriginal?.numEmpleado || ''}`"
          clearable
          class="mb-3"
        >
          <template v-slot:append>
            <v-tooltip bottom>
              <template v-slot:activator="{ on }">
                <v-icon color="grey" v-on="on">mdi-information</v-icon>
              </template>
              <span>Dejar vacío para mantener el actual</span>
            </v-tooltip>
          </template>
        </v-text-field>

        <!-- Categoría -->
        <v-autocomplete
          v-model="docenteAPatch.categoriaId"
          :items="categorias"
          item-title="nombre"
          item-value="clave"
          label="Categoría"
          :placeholder="`Actual: ${getCategoriaName(docenteOriginal?.categoriaId) || 'Sin categoría'}`"
          clearable
          class="mb-3"
        >
          <template v-slot:selection="{ item }">
            {{ item.raw.nombre }}
          </template>
        </v-autocomplete>

        <!-- Nombre -->
        <v-text-field 
          v-model="docenteAPatch.persona.nombre" 
          label="Nombre"
          :placeholder="`Actual: ${docenteOriginal?.nombre || ''}`"
          clearable
          class="mb-3"
        />

        <!-- Email -->
        <v-text-field 
          v-model="docenteAPatch.persona.email" 
          label="Email"
          :placeholder="`Actual: ${docenteOriginal?.email || ''}`"
          :rules="[v => !v || /.+@.+\..+/.test(v) || 'Email debe ser válido']"
          clearable
        />
      </v-form>

      
    </v-card-text>

    <v-card-actions>
      <v-spacer></v-spacer>
      <v-btn color="grey" variant="text" @click="patchDialogo = false">
        Cancelar
      </v-btn>
      <v-btn 
        color="primary" 
        variant="flat" 
        @click="aplicarPatch" 
        :loading="patchLoading"
        :disabled="patchLoading"
      >
        
        Guardar Cambios
      </v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const headers = [
  { title: 'Núm. Empleado', key: 'numEmpleado', width: '120px' },
  { title: 'Nombre', key: 'nombre', width: '200px' },
  { title: 'Categoría', key: 'categoriaEmpleado' },
  { title: 'Email', key: 'email' },
  { title: 'Acciones', key: 'acciones', sortable: false, align: 'center', width: '100px' }
];

const docentes = ref([]);
const loading = ref(false);
const error = ref(null);

const deleteDialog = ref(false);
const deleting = ref(false);
const docenteAEliminar = ref(null);

const nuevoDialogo = ref(false);
const saving = ref(false);
const formRef = ref(null);

const editarDialogo = ref(false);
const editando = ref(false);
const formEditarRef = ref(null);
const numEmpleadoOriginal = ref('');
const docenteAEditar = ref({
  nuevoNumEmpleado: '',
  categoriaId: '',
  persona: {
    nombre: '',
    email: ''
  }
});

const patchDialogo = ref(false);
const patchLoading = ref(false);
const docenteAPatch = ref({
  nuevoNumEmpleado: '',
  categoriaId: '',
  persona: {
    nombre: '',
    email: ''
  }
});
const numEmpleadoOriginalPatch = ref('');
const formPatchRef = ref(null);
const categorias = ref([]);

const docenteOriginal = ref(null);
// patch

const snackbar = ref({
  show: false,
  message: '',
  color: 'warning' // Puede ser 'success', 'error', 'warning', 'info'
});

const showSnackbar = (message, color = 'success') => {
  snackbar.value = {
    show: true,
    message,
    color
  };
};

const abrirDialogoPatch = async (docente) => {
  try {
    await fetchCategorias();
    
    // Guardar datos originales
    docenteOriginal.value = {
      numEmpleado: docente.numEmpleado,
      categoriaId: docente.categoriaId,
      nombre: docente.nombre,
      email: docente.email
    };
    
    // Inicializar con valores actuales
    docenteAPatch.value = {
      nuevoNumEmpleado: docente.numEmpleado, // Mostrar valor actual
      categoriaId: docente.categoriaId,      // Mostrar valor actual
      persona: {
        nombre: docente.nombre,              // Mostrar valor actual
        email: docente.email                 // Mostrar valor actual
      }
    };
    
    numEmpleadoOriginalPatch.value = docente.numEmpleado;
    patchDialogo.value = true;
  } catch (err) {
    error.value = err.message;
    showSnackbar(`Error al abrir edición: ${err.message}`, 'error');
  }
};


const getCategoriaName = (id) => {
  const categoria = categorias.value.find(c => c.clave === id);
  return categoria ? categoria.nombre : '';
};

const aplicarPatch = async () => {
  const { valid } = await formPatchRef.value.validate();
  if (!valid) return;

  patchLoading.value = true;
  error.value = null;

  try {
    // Crear payload solo con los campos modificados
    const payload = {};
    
    // Verificar cambios en número de empleado
    if (docenteAPatch.value.nuevoNumEmpleado && 
        docenteAPatch.value.nuevoNumEmpleado !== docenteOriginal.value.numEmpleado) {
      payload.nuevoNumEmpleado = docenteAPatch.value.nuevoNumEmpleado;
    }
    
    // Verificar cambios en categoría
    if (docenteAPatch.value.categoriaId !== undefined && 
        docenteAPatch.value.categoriaId !== docenteOriginal.value.categoriaId) {
      payload.categoriaId = docenteAPatch.value.categoriaId;
    }
    
    // Verificar cambios en datos de persona
    const personaChanges = {};
    if (docenteAPatch.value.persona.nombre && 
        docenteAPatch.value.persona.nombre !== docenteOriginal.value.nombre) {
      personaChanges.nombre = docenteAPatch.value.persona.nombre;
    }
    if (docenteAPatch.value.persona.email && 
        docenteAPatch.value.persona.email !== docenteOriginal.value.email) {
      personaChanges.email = docenteAPatch.value.persona.email;
    }
    
    if (Object.keys(personaChanges).length > 0) {
      payload.persona = personaChanges;
    }
    
    if (Object.keys(payload).length === 0) {
      showSnackbar('No shay cambios para actualizar', 'warning');
      patchLoading.value = false;
      return;
    }

    const res = await fetch(`https://localhost:9000/docentes/${numEmpleadoOriginalPatch.value}`, {
      method: 'PATCH',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al actualizar docente');
    }

    showSnackbar('Docente actualizado correctamente', 'success');
    patchDialogo.value = false;
    await fetchDocentes();
  } catch (err) {
    error.value = err.message;
    showSnackbar(`Error: ${err.message}`, 'error');
  } finally {
    patchLoading.value = false;
  }
};

//PUT
const abrirDialogoEdicion = (docente) => {
  numEmpleadoOriginal.value = docente.numEmpleado;
  docenteAEditar.value = {
    nuevoNumEmpleado: '',
    categoriaId: '',
    persona: {
      nombre: '',
      email: ''
    }
  };
  editarDialogo.value = true;
};
const actualizarDocente = async () => {
  const { valid } = await formEditarRef.value.validate();
  if (!valid) return;

  editando.value = true;
  error.value = null;

  try {
    const res = await fetch(`https://localhost:9000/docentes/${numEmpleadoOriginal.value}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(docenteAEditar.value)
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Error al actualizar docente');
    }

    editarDialogo.value = false;
    await fetchDocentes(); 
  } catch (err) {
    error.value = err.message;
  } finally {
    editando.value = false;
  }
};

//DELETE
const abrirDialogoEliminar = (docente) => {
  docenteAEliminar.value = docente;
  deleteDialog.value = true;
};
const confirmarEliminacion = async () => {
  if (!docenteAEliminar.value) return;
  deleting.value = true;

  try {
    const res = await fetch(`https://localhost:9000/docentes/${docenteAEliminar.value.numEmpleado}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error('No se pudo eliminar el docente');

    docentes.value = docentes.value.filter(
      d => d.numEmpleado !== docenteAEliminar.value.numEmpleado
    );

    deleteDialog.value = false;
    docenteAEliminar.value = null;
  } catch (err) {
    error.value = err.message;
  } finally {
    deleting.value = false;
  }
};

//POST
const nuevoDocente = ref({
  numEmpleado: '',
  categoriaId: '',
  persona: {
    nombre: '',
    email: ''
  }
});
const crearDocente = async () => {
  saving.value = true;
  error.value = null;

  try {
    const res = await fetch('https://localhost:9000/docentes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nuevoDocente.value)
    });

    if (!res.ok) throw new Error('No se pudo crear el docente');

    nuevoDialogo.value = false;
    await fetchDocentes(); // Recargar lista
    nuevoDocente.value = {
      numEmpleado: '',
      categoriaId: '',
      persona: { nombre: '', email: '' }
    };
  } catch (err) {
    error.value = err.message;
  } finally {
    saving.value = false;
  }
};

const fetchCategoriaNombre = async (clave) => {
  try {
    const res = await fetch(`https://localhost:9000/categoriaEmpleados/${clave}`);
    if (!res.ok) throw new Error('Error al obtener categoría');
    const categoriaData = await res.json();
    return categoriaData.nombre || 'Sin nombre';
  } catch {
    return 'Sin categoría';
  }
};

const fetchDocentes = async () => {
  try {
    loading.value = true;
    error.value = null;
    docentes.value = [];

    const response = await fetch('https://localhost:9000/docentes');
    if (!response.ok) throw new Error('Error al cargar docentes');

    const data = await response.json();

    const docentesConCategoria = await Promise.all(
      data.map(async (item) => {
        const categoriaNombre = item.categoriaId 
          ? await fetchCategoriaNombre(item.categoriaId.toString())
          : 'Sin categoría';

        return {
          numEmpleado: item.numEmpleado,
          nombre: item.persona?.nombre || 'No disponible',
          categoriaEmpleado: categoriaNombre,
          email: item.persona?.email || 'No disponible'
        };
      })
    );

    docentes.value = docentesConCategoria;
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
};

const fetchCategorias = async () => {
  try {
    const res = await fetch('https://localhost:9000/categoriaEmpleados');
    if (!res.ok) throw new Error('Error al cargar categorías');
    categorias.value = await res.json();
  } catch (err) {
    error.value = err.message;
  }
};
onMounted(async () => {
  await fetchDocentes();
  await fetchCategorias();
});
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
.cursor-pointer {
  cursor: pointer;
  transition: transform 0.2s ease;
}
.cursor-pointer:hover {
  transform: scale(1.2);
}
</style>
