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
import LoginScreen from '../components/control-panel/LoginScreen.vue';
import { loginError } from '../composables/state';
import { useAuth } from '../composables/useAuth';

const route = useRoute();
const router = useRouter();
const { login, attemptAutoLogin } = useAuth();

onMounted(async () => {
  await attemptAutoLogin();
  if (loginError.value === '' && !loginError.value) {
    // Check if logged in state became true
    import('../composables/state').then(({ isLoggedIn }) => {
      if (isLoggedIn.value) {
        const redirectUrl = (route.query.redirect as string) || '/';
        router.push(redirectUrl);
      }
    });
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
