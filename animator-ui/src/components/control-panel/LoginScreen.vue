<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 bg-muted/50">
    <Card className="w-full max-w-md p-8">
      <div class="text-center mb-8">
        <h2 class="text-2xl font-bold text-primary mb-2">{{ $t('login_screen.title') }}</h2>
        <p class="text-muted-foreground text-sm">{{ $t('login_screen.subtitle') }}</p>
      </div>

      <form @submit.prevent="handleSubmit" class="flex flex-col gap-5">
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-primary">{{ $t('login_screen.email') }}</label>
          <TextInput 
            type="email" 
            v-model="email" 
            required 
            inputClass="w-full px-4 py-3 bg-muted rounded-xl border-none text-foreground font-medium"
            focusClass="focus:ring-2 focus:ring-[#FFBA49] transition-shadow outline-none"
            :clearOnUnmount="false"
          />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-sm font-semibold text-primary">{{ $t('login_screen.password') }}</label>
          <TextInput 
            type="password" 
            v-model="password" 
            required 
            inputClass="w-full px-4 py-3 bg-muted rounded-xl border-none text-foreground font-medium"
            focusClass="focus:ring-2 focus:ring-[#FFBA49] transition-shadow outline-none"
            :clearOnUnmount="false"
          />
        </div>
        
        <Btn type="submit" variant="primary" size="lg" className="w-full mt-2 font-bold text-lg">
          {{ $t('login_screen.submit') }}
        </Btn>
        
        <div v-if="error" class="mt-4 p-3 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-100 flex items-center gap-2 justify-center">
          <span>⚠️</span> {{ error }}
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Card from '../ui/Card.vue';
import Btn from '../ui/Btn.vue';
import TextInput from '../ui/TextInput.vue';

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
