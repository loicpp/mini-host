import { ref } from 'vue';

type DialogOptions = {
  title: string;
  message: string;
  type?: 'alert' | 'confirm';
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'success' | 'secondary';
};

const isOpen = ref(false);
const options = ref<DialogOptions>({
  title: '',
  message: '',
  type: 'alert',
  confirmText: 'OK',
  cancelText: 'Annuler',
  confirmVariant: 'primary'
});
let resolvePromise: ((value: boolean) => void) | null = null;

export function useDialog() {
  const showConfirm = (opts: Omit<DialogOptions, 'type'>): Promise<boolean> => {
    options.value = { 
      confirmText: 'OK', 
      cancelText: 'Annuler',
      confirmVariant: 'primary',
      ...opts, 
      type: 'confirm' 
    };
    isOpen.value = true;
    return new Promise((resolve) => {
      resolvePromise = resolve;
    });
  };

  const showAlert = (opts: Omit<DialogOptions, 'type'>): Promise<void> => {
    options.value = { 
      confirmText: 'OK', 
      confirmVariant: 'primary',
      ...opts, 
      type: 'alert' 
    };
    isOpen.value = true;
    return new Promise((resolve) => {
      resolvePromise = resolve as any;
    });
  };

  const handleConfirm = () => {
    isOpen.value = false;
    if (resolvePromise) {
      resolvePromise(true);
      resolvePromise = null;
    }
  };

  const handleCancel = () => {
    isOpen.value = false;
    if (resolvePromise) {
      resolvePromise(false);
      resolvePromise = null;
    }
  };

  return {
    isOpen,
    options,
    showConfirm,
    showAlert,
    handleConfirm,
    handleCancel
  };
}
