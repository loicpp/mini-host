<template>
  <LoginScreen 
    :error="loginError"
    @login="handleLogin" 
    class="w-full h-full"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import LoginScreen from '../components/control-panel/LoginScreen.vue';
import { loginError } from '../composables/state';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { login, attemptAutoLogin } = useAuth();

onMounted(async () => {
  await attemptAutoLogin();
  if (loginError.value === '' && !loginError.value) {
    // Check if logged in state became true
    import('../composables/state').then(({ isLoggedIn }) => {
      if (isLoggedIn.value) {
        router.push('/');
      }
    });
  }
});

const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
  const success = await login(loginEmail, loginPassword);
  if (success) {
    router.push('/');
  }
};
</script>
