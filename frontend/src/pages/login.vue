<template>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" lg="4" md="6" sm="8">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>Iniciar Sesión</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <v-form @submit.prevent="loginWithLocal">
                <v-text-field
                  v-model="username"
                  label="Usuario"
                  name="username"
                  prepend-icon="mdi-account"
                  required
                  type="text"
                />
  
                <v-text-field
                  v-model="password"
                  label="Contraseña"
                  name="password"
                  prepend-icon="mdi-lock"
                  required
                  type="password"
                />
  
                <v-btn block color="primary" type="submit">Iniciar con Usuario/Contraseña</v-btn>
              </v-form>
  
              <v-divider class="my-4" />
  
              <v-btn block color="red darken-1" @click="loginWithGoogle">
                <v-icon left>mdi-google</v-icon>
                Iniciar con Google
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
    import { ref } from 'vue';
    import { useRouter } from 'vue-router';
  
    const router = useRouter();
    const username = ref('');
    const password = ref('');
  
    const loginWithLocal = async () => {
      try {
        // Aquí iría la lógica para autenticación local
        const response = await fetch('https://localhost:3000/auth/local', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: username.value,
            password: password.value,
          }),
        });
  
        if (!response.ok) throw new Error('Error en la autenticación');
  
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        router.push('/main');
      } catch (error) {
        console.error('Error al iniciar sesión:', error);
        alert('Error al iniciar sesión');
      }
    };
  
    const loginWithGoogle = () => {
      window.location.href = 'https://localhost:3000/auth/google';
    };
  
  
  </script>
  
  <style scoped>
  .fill-height {
    min-height: 100vh;
  }
  </style>