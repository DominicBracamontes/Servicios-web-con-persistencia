import { ref, computed } from 'vue';

export const useStudentData = () => {
  const drawer = ref(true);
  const searchPlaceholder = ref('Buscar...');
  const showEstudiantes = ref(false);
  const currentMatricula = ref(null);
  const allStudents = ref([]);
  const searchQuery = ref('');

  const filteredStudents = computed(() => {
    if (!searchQuery.value?.trim()) return allStudents.value;
    const query = searchQuery.value.trim().toLowerCase();
    return allStudents.value.filter(student => 
      student.matricula.toLowerCase().includes(query)
    );
  });

  const handleEstudiantesSelection = async () => {
    showEstudiantes.value = true;
    await loadStudents();
  };

  const resetView = () => {
    showEstudiantes.value = false;
    currentMatricula.value = null;
    searchQuery.value = '';
  };

  const handleSearch = (query) => {
    searchQuery.value = query;
    if (filteredStudents.value.length === 1) {
      currentMatricula.value = filteredStudents.value[0].matricula;
    } else {
      currentMatricula.value = null;
    }
  };

  const resetSearch = () => {
    searchQuery.value = '';
    currentMatricula.value = null;
  };

  const loadStudents = async () => {
    try {
      const response = await fetch('http://localhost:9000/estudiantes');
      if (!response.ok) throw new Error('Error al cargar estudiantes');
      allStudents.value = await response.json();
    } catch (error) {
      console.error("Error loading students:", error);
      allStudents.value = [];
    }
  };

  return {
    drawer,
    searchPlaceholder,
    showEstudiantes,
    currentMatricula,
    filteredStudents,
    handleEstudiantesSelection,
    resetView,
    handleSearch,
    resetSearch
  };
};