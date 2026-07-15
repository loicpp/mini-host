import { ref, onUnmounted } from 'vue';

export function useGameTimer(getServerTime: () => number) {
  const isBuffering = ref(false);
  const isDelaying = ref(false);
  const timeLeft = ref(0);
  const delayTimeLeft = ref(0);
  const timerInterval = ref<any>(null);

  const startTimer = (startTime: number, duration: number, blockDuration: number = 0) => {
    clearInterval(timerInterval.value);
    
    const updateTimer = () => {
      const now = getServerTime();
      
      if (now < startTime) {
        isBuffering.value = true;
        isDelaying.value = false;
        timeLeft.value = Math.ceil(duration / 1000);
        delayTimeLeft.value = Math.ceil(blockDuration / 1000);
      } else {
        isBuffering.value = false;
        const elapsed = now - startTime;
        const remaining = Math.max(0, duration - elapsed);
        const remainingDelay = Math.max(0, blockDuration - elapsed);
        
        timeLeft.value = Math.ceil(remaining / 1000);
        
        if (remainingDelay > 0) {
          isDelaying.value = true;
          delayTimeLeft.value = Math.ceil(remainingDelay / 1000);
        } else {
          isDelaying.value = false;
          delayTimeLeft.value = 0;
        }
        
        if (remaining <= 0) {
          clearInterval(timerInterval.value);
        }
      }
    };
    
    updateTimer();
    // In test environment, we might want to avoid setInterval or mock it.
    // The setInterval ensures UI updates smoothly.
    timerInterval.value = setInterval(updateTimer, 100);
  };

  const stopTimer = () => {
    clearInterval(timerInterval.value);
  };

  onUnmounted(() => {
    stopTimer();
  });

  return {
    isBuffering,
    isDelaying,
    timeLeft,
    delayTimeLeft,
    startTimer,
    stopTimer
  };
}
