<!-- <template>
  <v-navigation-drawer
    v-model="internalDrawer"
    app
    expand-on-hover
    rail
    :permanent="true"
    color="indigo-darken-2"
    width="280"
    mini-variant-width="64"
  >
    <v-list>
      <v-list-item
        prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
        title="Nicole López"
        :subtitle="correoUsuario"
      ></v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-list density="compact" nav>

      <v-list-item
  prepend-icon="mdi-account-school"
  title="Estudiantes"
  value="students"
  to="/paginaBuscarEstudianteCom"
></v-list-item>

      <v-list-item
  prepend-icon="mdi-account-tie"
  title="Docentes"
  value="teachers"
  to="/paginaBuscarDocCom"
></v-list-item>

     <v-list-item
  prepend-icon="mdi-bookshelf"
  title="Asignaturas"
  value="subjects"
  to="/paginaBuscarAsigCom"
></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "AppDrawer",
  props: {
    modelValue: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      internalDrawer: this.modelValue,
      correoUsuario: localStorage.getItem('correoUsuario') || 'Usuario no identificado'
    };
  },
  watch: {
    modelValue(newVal) {
      this.internalDrawer = newVal;
    },
    internalDrawer(newVal) {
      this.$emit('update:modelValue', newVal);
    }
  }
};
</script>


<style scoped>
.v-navigation-drawer {
  z-index: 1000;
  transition: all 0.3s ease !important;
}

.v-navigation-drawer--expand-on-hover:hover {
  width: 280px !important;
}
</style> -->

<template>
  <v-navigation-drawer
    v-model="internalDrawer"
    app
    expand-on-hover
    rail
    :permanent="true"
    color="indigo-darken-2"
    width="280"
    mini-variant-width="64"
  >
    <!-- <v-list>
      <v-list-item
        :subtitle="correoUsuario"
      >
        <template v-slot:prepend>
          <v-avatar color="indigo">
            <v-icon color="white">mdi-account</v-icon>
          </v-avatar>
        </template>
      </v-list-item>
    </v-list> -->

    <v-divider></v-divider>

    <v-list density="compact" nav>
      <v-list-item
        prepend-icon="mdi-account-school"
        title="Estudiantes"
        value="students"
        to="/paginaBuscarEstudianteCom"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-account-tie"
        title="Docentes"
        value="teachers"
        to="/paginaBuscarDocCom"
      ></v-list-item>

      <v-list-item
        prepend-icon="mdi-bookshelf"
        title="Asignaturas"
        value="subjects"
        to="/paginaBuscarAsigCom"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
export default {
  name: "AppDrawer",
  props: {
    modelValue: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      internalDrawer: this.modelValue,
      correoUsuario: this.obtenerCorreoUsuario()
    };
  },
  methods: {
    obtenerCorreoUsuario() {
      const correo = localStorage.getItem('correoUsuario');
      if (!correo) {
        const urlParams = new URLSearchParams(window.location.search);
        const emailGoogle = urlParams.get('email');
        return emailGoogle ? emailGoogle : 'Usuario Google';
      }
      return correo;
    }
  },
  watch: {
    modelValue(newVal) {
      this.internalDrawer = newVal;
    },
    internalDrawer(newVal) {
      this.$emit('update:modelValue', newVal);
    },
    '$store.state.usuario'(nuevoValor) {
      this.correoUsuario = this.obtenerCorreoUsuario();
    }
  },
  created() {
    this.correoUsuario = this.obtenerCorreoUsuario();
  }
};
</script>

<style scoped>
.v-navigation-drawer {
  z-index: 1000;
  transition: all 0.3s ease !important;
}

.v-navigation-drawer--expand-on-hover:hover {
  width: 280px !important;
}
</style>