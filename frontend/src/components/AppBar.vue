<template>
  <v-app-bar
    app
    color="indigo-darken-2"
    dense
    flat
    height="64"
  >
    <v-app-bar-nav-icon 
      @click.stop="$emit('toggle-drawer')"
      color="white"
    />
    
    <v-container class="pa-0 fill-height">
      <v-row no-gutters align="center" justify="center">
        <v-col cols="auto">
          <v-toolbar-title class="white--text text-h5 font-weight-bold">
           SISTEMA DE INSCRIPCIONES Y CONTRATOS
          </v-toolbar-title>
        </v-col>
      </v-row>
    </v-container>
  </v-app-bar>
</template>

<script>
export default {
  name: 'AppBar',
  emits: ['toggle-drawer'] 
}
</script>