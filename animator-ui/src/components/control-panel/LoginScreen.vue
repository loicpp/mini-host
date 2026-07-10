<template>
  <div class="login-screen">
    <div class="login-card card">
      <h2>Connexion Régie</h2>
      <form @submit.prevent="handleSubmit">
        <div class="input-group">
          <label>Email</label>
          <input type="email" v-model="email" required />
        </div>
        <div class="input-group">
          <label>Mot de passe</label>
          <input type="password" v-model="password" required />
        </div>
        <button type="submit" class="btn btn-primary btn-block">Se Connecter</button>
        <p class="error-text" v-if="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  error: string;
}>();

const emit = defineEmits<{
  (e: 'login', email?: string, password?: string): void
}>();

const email = ref('');
const password = ref('');

const handleSubmit = () => {
  emit('login', email.value, password.value);
};
</script>

<style scoped>
.login-screen {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.login-card {
  width: 100%;
  max-width: 400px;
  background: #2b2b40;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  color: white;
}
.error-text {
  color: #f1416c;
  margin-top: 10px;
  text-align: center;
}
</style>
