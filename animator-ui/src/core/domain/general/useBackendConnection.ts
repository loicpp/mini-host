import { useUiStore } from './stores/ui';

const { isBackendConnected } = useUiStore();


let pingTimeout: ReturnType<typeof setTimeout> | null = null;

export function useBackendConnection() {
  const checkBackendConnection = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/api/test_connection');
      isBackendConnected.value = res.ok;
    } catch (e) {
      console.warn(e);
      isBackendConnected.value = false;
    } finally {
      pingTimeout = setTimeout(checkBackendConnection, isBackendConnected.value ? 4000 : 2000);
    }
  };

  const startConnectionMonitor = () => {
    if (!pingTimeout) {
      checkBackendConnection();
    }
  };

  const stopConnectionMonitor = () => {
    if (pingTimeout) {
      clearTimeout(pingTimeout);
      pingTimeout = null;
    }
  };

  return {
    startConnectionMonitor,
    stopConnectionMonitor
  };
}
