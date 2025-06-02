<template>
  <v-app>
    <AppBar />
    <AppDrawer />

    <v-main>
      <v-container fluid class="pa-0 ma-0" style="height: calc(100vh - 64px); overflow: hidden;">
        <v-row no-gutters class="h-100">

          <v-col class="h-100" style="flex: 0 0 75%; max-width: 75%;">
            <v-card class="h-100 d-flex flex-column" flat>
              <v-img src="https://picsum.photos/id/11/1600/900" height="50%" cover
                gradient="to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.5)">
              </v-img>

              <v-card-text class="flex-grow-1 pa-4" style="overflow-y: auto;">
                <div style="max-width: 800px; margin: 0 auto;">
                  <p class="text-body-1 mb-4">Esta página web gestiona estudiantes, docentes y asignaturas de forma
                    centralizada, facilitando matrículas, semestres y calificaciones. Ideal para instituciones
                    educativas que buscan optimizar su administración académica.</p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col class="h-100" style="flex: 0 0 25%; max-width: 25%; padding-left: 8px;">
            <v-row no-gutters class="h-100 flex-column">

              <v-col style="height: 48%">
                <v-card class="h-100 d-flex flex-column" @click="irAPagina('estudiantes')" style="cursor: pointer;">
                  <v-img src="https://picsum.photos/id/12/400/300" height="60%" cover />
                  <v-card-text class="flex-grow-1 pa-2">
                    <div class="text-caption font-weight-bold mb-1">Estudiantes</div>
                    <div class="text-caption">Buscar información de estudiantes</div>
                  </v-card-text>
                </v-card>
              </v-col>

              <v-col style="height: 48%; margin-top: 4%">
                <v-card class="h-100 d-flex flex-column" @click="irAPagina('actualizar')" style="cursor: pointer;">
                  <v-img src="https://picsum.photos/id/13/400/300" height="60%" cover />
                  <v-card-text class="flex-grow-1 pa-2">
                    <div class="text-caption font-weight-bold mb-1">Docentes</div>
                    <div class="text-caption">Buscar información de docentes</div>
                  </v-card-text>
                </v-card>
              </v-col>

            </v-row>
          </v-col>

        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import AppBar from '@/components/AppBar.vue'
import AppDrawer from '@/components/drawer.vue'

export default {
  components: { AppBar, AppDrawer },
  methods: {
    irAPagina(destino) {
      if (destino === 'estudiantes') {
        this.$router.push('/paginaBuscarEstudianteCom');
      } else if (destino === 'actualizar') {
        this.$router.push('/paginaBuscarDocCom');
      }
    }
  }
}
</script>

<style scoped>
.v-card {
  transition: all 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  transform: translateY(-2px);
}

.text-caption {
  font-size: 0.8rem !important;
  line-height: 1.2;
}

@media (max-width: 960px) {

  [style*="max-width: 75%"],
  [style*="max-width: 25%"] {
    flex: 0 0 100% !important;
    max-width: 100% !important;
    padding-left: 0 !important;
  }

  [style*="height: 48%"] {
    height: 220px !important;
    margin-top: 8px !important;
  }
}
</style> 
