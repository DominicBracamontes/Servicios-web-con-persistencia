// src/composables/useAuth.js
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

export function useAuth() {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null);
  const loading = ref(false);
  const error = ref(null);
  const router = useRouter();

  const setUser = (userData) => {
    user.value = userData;
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const clearUser = () => {
    user.value = null;
    localStorage.removeItem('user');
  };

  const loadUser = async () => {
    loading.value = true;
    try {
      const response = await fetch('https://localhost:9000/user/profile', {
        credentials: 'include'
      });
      
      if (!response.ok) throw new Error('No autenticado');
      
      const userData = await response.json();
      setUser(userData);
    } catch (err) {
      error.value = err.message;
      clearUser();
    } finally {
      loading.value = false;
    }
  };

  const loginWithGoogle = () => {
    return new Promise((resolve, reject) => {
      loading.value = true;
      const authWindow = window.open(
        'https://localhost:9000/auth/google',
        'googleAuth',
        'width=500,height=600'
      );
      
      window.addEventListener('message', (event) => {
        if (event.origin !== 'https://localhost:9000') return;
        
        if (event.data.type === 'google-auth-success') {
          setUser(event.data.user);
          loading.value = false;
          resolve(event.data.user);
          if (authWindow) authWindow.close();
        }
        
        if (event.data.type === 'google-auth-error') {
          error.value = event.data.message;
          loading.value = false;
          reject(new Error(event.data.message));
        }
      }, { once: true });
    });
  };

  const logout = async () => {
    try {
      loading.value = true;
      await fetch('https://localhost:9000/logout', {
        method: 'GET',
        credentials: 'include'
      });
      clearUser();
      router.push('/login');
    } catch (err) {
      error.value = err.message;
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (!user.value) {
      loadUser();
    }
  });

  return {
    user,
    loading,
    error,
    loadUser,
    loginWithGoogle,
    logout
  };
}