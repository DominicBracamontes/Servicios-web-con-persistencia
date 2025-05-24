import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

export const useAsignaturaData = () => {
  const router = useRouter()
  const drawer = ref(false)
  const searchPlaceholder = ref('Buscar por clave de asignatura...')
  const allAsignaturas = ref([])
  const searchTerm = ref('')
  const loading = ref(false)
  const error = ref(null)

  const fetchAsignaturas = async () => {
    try {
      loading.value = true
      error.value = null
      const response = await fetch('https://localhost:3000/asignaturas')
      
      if (!response.ok) throw new Error('Error al cargar las asignaturas')
      
      const data = await response.json()
      allAsignaturas.value = data.map(asignatura => ({
        clave: asignatura.clave,
        nombre: asignatura.nombre,
        creditos: asignatura.creditos,
        programa: asignatura.programa,
        area: asignatura.area
      }))
      
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  const filteredAsignaturas = computed(() => {
    if (!searchTerm.value) return allAsignaturas.value
    
    return allAsignaturas.value.filter(asignatura => 
      asignatura.clave.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      asignatura.nombre.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  })

  const handleAsignaturasSelection = () => {
    searchPlaceholder.value = 'Buscar por clave de asignatura...'
    searchTerm.value = ''
    fetchAsignaturas()
  }

  const resetView = () => {
    searchTerm.value = ''
    router.push({ name: 'asignaturas' })
  }

  const resetSearch = () => {
    searchTerm.value = ''
  }

  return {
    drawer,
    searchPlaceholder,
    filteredAsignaturas,
    loading,
    error,
    handleAsignaturasSelection,
    resetView,
    resetSearch,
    fetchAsignaturas,
    searchTerm
  }
}