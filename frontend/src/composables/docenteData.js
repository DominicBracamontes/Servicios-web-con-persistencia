import { ref, computed } from 'vue';

export function useDocenteData() {
    const drawer = ref(false);
    const searchPlaceholder = ref('Buscar por número de empleado');
    const filteredDocentes = ref([]);
    const allDocentes = ref([]); 
    
    const fetchDocentes = async () => {
        try {
            const response = await fetch('https://localhost:3000/docentes');
            if (!response.ok) throw new Error('Error al cargar docentes');
            
            const data = await response.json();
            allDocentes.value = data;
            filteredDocentes.value = data;
        } catch (error) {
            console.error('Error fetching docentes:', error);
            filteredDocentes.value = [];
        }
    };

    const handleDocentesSelection = () => {
        fetchDocentes();
        searchPlaceholder.value = 'Buscar por número de empleado';
    };

    const resetView = () => {
        filteredDocentes.value = allDocentes.value;
    };

    const resetSearch = () => {
        filteredDocentes.value = allDocentes.value;
    };

    const filterDocentes = (searchTerm) => {
        if (!searchTerm) {
            filteredDocentes.value = allDocentes.value;
            return;
        }
        
        filteredDocentes.value = allDocentes.value.filter(docente => 
            docente.numEmpleado.toString().includes(searchTerm) ||
            docente.persona.nombre.toLowerCase().includes(searchTerm.toLowerCase())
        );
    };

    return {
        drawer,
        searchPlaceholder,
        filteredDocentes,
        handleDocentesSelection,
        resetView,
        resetSearch,
        filterDocentes
    };
}