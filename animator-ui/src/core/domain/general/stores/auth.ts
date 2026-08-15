import { ref } from 'vue';

const email = ref('');
const password = ref('');
const loginError = ref('');
const isLoggedIn = ref(false);

export function useAuthStore() {
  return {
    email,
    password,
    loginError,
    isLoggedIn,
  };
}
