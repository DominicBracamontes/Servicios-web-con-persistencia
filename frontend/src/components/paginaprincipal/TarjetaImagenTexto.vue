<template>
    <v-card 
      class="mx-auto"
      :width="width"
      :elevation="elevation"
      :hover="hover"
    >
      <v-img
        :src="imagen"
        :height="imgHeight"
        cover
        class="align-end"
        gradient="to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5)"
      >
        <v-card-title 
          class="text-white"
          v-if="tituloImagen"
        >
          {{ tituloImagen }}
        </v-card-title>
      </v-img>
  
      <v-card-text :class="`text-${textAlign}`">
        <div 
          v-if="titulo"
          class="text-h6 mb-2"
        >
          {{ titulo }}
        </div>
        <div class="text-body-1">
          {{ texto }}
        </div>
      </v-card-text>
  
      <v-card-actions v-if="botonTexto">
        <v-btn
          :color="botonColor"
          variant="text"
          @click="$emit('click-boton')"
        >
          {{ botonTexto }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </template>
  
  <script>
  export default {
    props: {
      imagen: {
        type: String,
        required: true
      },
      texto: {
        type: String,
        default: ''
      },
      titulo: {
        type: String,
        default: ''
      },
      tituloImagen: {
        type: String,
        default: ''
      },
      width: {
        type: [Number, String],
        default: 400
      },
      imgHeight: {
        type: [Number, String],
        default: 200
      },
      elevation: {
        type: Number,
        default: 2
      },
      hover: {
        type: Boolean,
        default: true
      },
      textAlign: {
        type: String,
        default: 'left',
        validator: value => ['left', 'center', 'right'].includes(value)
      },
      botonTexto: {
        type: String,
        default: ''
      },
      botonColor: {
        type: String,
        default: 'primary'
      }
    }
  }
  </script>
  
  <style scoped>
  .v-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }
  .v-card:hover {
    transform: translateY(-5px);
  }
  </style>