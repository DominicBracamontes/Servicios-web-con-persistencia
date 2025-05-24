<template>
    <v-navigation-drawer
      v-model="internalDrawer"
      expand-on-hover
      rail
      app
      :temporary="false"
      color="indigo-darken-2"
    >
      <v-list>
        <v-list-item
          prepend-avatar="https://randomuser.me/api/portraits/women/85.jpg"
          subtitle="nicole.lopez82@uabc.edu.mx"
          title="Nicole López"
        ></v-list-item>
      </v-list>
  
      <v-divider></v-divider>
  
      <v-list density="compact" nav>
        <!-- <v-list-item 
          prepend-icon="mdi-folder" 
          title="Buscar" 
          value="myfiles"
          to="/paginaBuscar"
        ></v-list-item>
        <v-list-item 
          prepend-icon="mdi-account-multiple" 
          title="Actualizar" 
          value="shared"
          to="/paginaActualizar"
        ></v-list-item>
        <v-list-item 
          prepend-icon="mdi-star" 
          title="Eliminar" 
          value="starred"
          to="/paginaBorrar"
        ></v-list-item> -->
        <v-list-item 
          prepend-icon="mdi-star" 
          title="Busquedas" 
          value="starred"
          to="/paginaCompleta"
        ></v-list-item>
      </v-list>
    </v-navigation-drawer>
  </template>
  
  <script>
  export default {
    name: "AppDrawer",
    props: {
      drawer: {
        type: Boolean,
        default: true
      }
    },
    data() {
      return {
        internalDrawer: this.drawer
      };
    },
    watch: {
      drawer(newVal) {
        this.internalDrawer = newVal;
      }
    }
  };
  </script>
  
  <style scoped>
  .v-navigation-drawer {
    transition: all 0.3s ease;
  }
  </style>