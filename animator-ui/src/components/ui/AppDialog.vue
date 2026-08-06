<template>
  <Modal v-if="isOpen" @close="handleCancel" maxW="max-w-md" :customStyle="{ zIndex: 2000000000 }">
    <div class="p-6">
      <div class="flex items-start gap-4">
        <div :class="[
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          options.type === 'alert' || options.confirmVariant === 'danger' ? 'bg-red-50 text-red-500' : 'bg-[#fff6e0] text-[#FFBA49]'
        ]">
          <TriangleAlert v-if="options.type === 'alert' || options.confirmVariant === 'danger'" class="w-5 h-5" />
          <Info v-else class="w-5 h-5" />
        </div>
        <div class="pt-1.5 flex-1">
          <h2 class="text-xl font-bold text-primary m-0 mb-1.5">{{ options.title }}</h2>
          <p class="text-sm text-muted-foreground m-0 leading-relaxed">{{ options.message }}</p>
        </div>
      </div>
      
      <div class="flex justify-end gap-3 mt-8">
        <Btn v-if="options.type === 'confirm'" variant="ghost" @click="handleCancel" className="font-semibold text-muted-foreground hover:text-primary">
          {{ options.cancelText || $t('app.cancel') }}
        </Btn>
        <Btn id="app-dialog-confirm-btn" :variant="options.confirmVariant || 'primary'" @click="handleConfirm" className="font-bold px-6">
          {{ options.confirmText || $t('app.ok') }}
        </Btn>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { TriangleAlert, Info } from '@lucide/vue';
import Modal from './Modal.vue';
import Btn from './Btn.vue';
import { useDialog } from '../../composables/useDialog';

const { isOpen, options, handleConfirm, handleCancel } = useDialog();
</script>
