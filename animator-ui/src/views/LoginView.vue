<template>
  <LoginScreen 
    :error="loginError"
    @login="handleLogin" 
    class="w-full h-full"
  />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import LoginScreen from '../components/general/LoginScreen.vue';
import { useAuthStore } from '../core/domain/general/stores/auth';
import { useAuth } from '../core/domain/general/useAuth';

const { loginError, isLoggedIn } = useAuthStore();


const route = useRoute();
const router = useRouter();
const { login, attemptAutoLogin } = useAuth();

onMounted(async () => {
  await attemptAutoLogin();
  if (loginError.value === '' && !loginError.value) {
    // Check if logged in state became true
    if (isLoggedIn.value) {
      const redirectUrl = (route.query.redirect as string) || '/';
      router.push(redirectUrl);
    }
  }
});

const handleLogin = async (loginEmail?: string, loginPassword?: string) => {
  const success = await login(loginEmail, loginPassword);
  if (success) {
    const redirectUrl = (route.query.redirect as string) || '/';
    router.push(redirectUrl);
  }
};
</script>
