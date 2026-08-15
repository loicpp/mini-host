import { ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { musicManager } from '../../../services/music/MusicManager';
import { animatorService } from '../../../services/animatorService';
import { itunesService } from '../../../services/itunesService';
import { db } from '../../../firebase';
import { ref as dbRef, set, onValue, off } from 'firebase/database';
import QRCode from 'qrcode';
import { useConfig } from '../general/useConfig';

export function useDiagnostics() {
  const { t } = useI18n();
  const { loadConfig, saveConfig } = useConfig();
  
  const isRunning = ref(true);

  const steps = ref([
    { name: t('diagnostics.step_internet'), status: 'pending', message: '' },
    { name: t('diagnostics.step_local_perms'), status: 'pending', message: '' },
    { name: t('diagnostics.step_backend'), status: 'pending', message: '' },
    { name: t('diagnostics.step_itunes'), status: 'pending', message: '' },
    { name: t('diagnostics.step_lastfm'), status: 'pending', message: '' },
    { name: t('diagnostics.step_playback'), status: 'pending', message: '' },
    { name: t('diagnostics.step_create_game'), status: 'pending', message: '' },
    { name: t('diagnostics.step_realtime'), status: 'pending', message: '' },
    { name: t('diagnostics.step_player_access'), status: 'pending', message: '' },
    { name: t('diagnostics.step_qrcode'), status: 'pending', message: '' },
    { name: t('diagnostics.step_popup'), status: 'pending', message: '' },
    { name: t('diagnostics.step_fetch_game'), status: 'pending', message: '' },
    { name: t('diagnostics.step_cleanup'), status: 'pending', message: '' }
  ]);

  const wait = (ms: number) => new Promise(r => setTimeout(r, ms));

  const setStepRunning = async (index: number) => {
    steps.value[index].status = 'running';
    await nextTick();
    setTimeout(() => {
      const el = document.getElementById('step-' + index);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  const runDiagnostics = async () => {
    isRunning.value = true;

    // Step 1: Internet
    await setStepRunning(0);
    try {
      await fetch('https://www.google.com', { mode: 'no-cors' });
      steps.value[0].status = 'success';
      steps.value[0].message = t('diagnostics.connected_public');
    } catch {
      steps.value[0].status = 'error';
      steps.value[0].message = t('diagnostics.no_internet');
      isRunning.value = false;
      return;
    }

    // Step 2: Local Permissions
    await setStepRunning(1);
    try {
      const testVal = Date.now().toString();
      const config = await loadConfig();
      if (!config) throw new Error();
      
      config.diagnostics_test_write = testVal;
      await saveConfig(config);
      
      const checkConfig = await loadConfig();
      if (!checkConfig || checkConfig.diagnostics_test_write !== testVal) throw new Error();
      
      checkConfig.diagnostics_test_write = null;
      await saveConfig(checkConfig);
      
      steps.value[1].status = 'success';
      steps.value[1].message = t('diagnostics.perms_ok');
    } catch {
      steps.value[1].status = 'error';
      steps.value[1].message = t('diagnostics.perms_error');
      isRunning.value = false;
      return;
    }

    // Step 3: Backend
    await setStepRunning(2);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/test_connection');
      if (!res.ok) throw new Error(t('diagnostics.backend_unavailable'));
      steps.value[2].status = 'success';
      steps.value[2].message = t('diagnostics.backend_ok');
    } catch {
      steps.value[2].status = 'error';
      steps.value[2].message = t('diagnostics.backend_error');
      isRunning.value = false;
      return;
    }

    // Step 4: iTunes
    await setStepRunning(3);
    try {
      const results = await itunesService.search('test');
      if (results.length === 0) throw new Error();
      steps.value[3].status = 'success';
      steps.value[3].message = t('diagnostics.itunes_ok');
    } catch {
      steps.value[3].status = 'warning';
      steps.value[3].message = t('diagnostics.itunes_warning');
    }

    // Step 5: Last.fm (Playlists Generator)
    await setStepRunning(4);
    try {
      const res = await fetch('http://127.0.0.1:5000/api/playlists/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: 'test', limit: 1 })
      });
      const data = await res.json();
      if (!res.ok || !Array.isArray(data)) throw new Error();
      steps.value[4].status = 'success';
      steps.value[4].message = t('diagnostics.lastfm_ok');
    } catch {
      steps.value[4].status = 'warning';
      steps.value[4].message = t('diagnostics.lastfm_warning');
    }

    // Step 6: Music Playback
    await setStepRunning(5);
    steps.value[5].message = t('diagnostics.loading_track');
    try {
      const originalProvider = musicManager.activeProviderName;
      await musicManager.setProvider('soundcloud');
      
      const track = {
        id: 'soundcloud:tracks:422967342',
        url: 'https://soundcloud.com/monstercat/noisestorm-crab-rave',
        title: 'Crab Rave',
        artist: 'Noisestorm',
        source: 'soundcloud' as any,
        duration: 10000
      };
      
      const results = await musicManager.search(track.url);
      if (results.length > 0) {
        steps.value[5].message = t('diagnostics.playing_track');
        await musicManager.play(results[0], 0);
        await wait(3000);
        await musicManager.stop();
        steps.value[5].status = 'success';
        steps.value[5].message = t('diagnostics.playback_success');
      } else {
        throw new Error(t('diagnostics.track_not_found'));
      }

      if (originalProvider) {
        await musicManager.setProvider(originalProvider);
      }
    } catch (e: any) {
      steps.value[5].status = 'error';
      steps.value[5].message = e.message || t('diagnostics.playback_error');
      isRunning.value = false;
      return;
    }

    // Step 7: Firebase Create
    await setStepRunning(6);
    let testGameId = '';
    try {
      const game = await animatorService.createGame('blind_test');
      testGameId = game.gameId;
      steps.value[6].status = 'success';
      steps.value[6].message = `${t('diagnostics.game_created')} (${testGameId})`;
    } catch (e: any) {
      steps.value[6].status = 'error';
      steps.value[6].message = e.message || t('diagnostics.game_create_error');
      isRunning.value = false;
      return;
    }

    // Step 8: Realtime Sync (WebSockets)
    await setStepRunning(7);
    try {
      await new Promise<void>((resolve, reject) => {
        const testPath = dbRef(db, `diagnostics/${testGameId}`);
        const timeout = setTimeout(() => {
          off(testPath);
          reject(new Error('Timeout'));
        }, 5000);

        onValue(testPath, (snapshot) => {
          if (snapshot.val() === 'ping') {
            clearTimeout(timeout);
            off(testPath);
            set(testPath, null);
            resolve();
          }
        });
        set(testPath, 'ping').catch(reject);
      });
      steps.value[7].status = 'success';
      steps.value[7].message = t('diagnostics.realtime_ok');
    } catch {
      steps.value[7].status = 'error';
      steps.value[7].message = t('diagnostics.realtime_error');
      isRunning.value = false;
      return;
    }

    // Step 9: Player App Reachability
    await setStepRunning(8);
    try {
      const playerUrl = `https://minihostapp-1.web.app/?game=${testGameId}&secret=test`;
      await fetch(playerUrl, { mode: 'no-cors' });
      if (playerUrl && playerUrl.includes(testGameId)) {
        steps.value[8].status = 'success';
        steps.value[8].message = t('diagnostics.access_ok');
      } else {
        steps.value[8].status = 'error';
        steps.value[8].message = t('diagnostics.access_error');
      }
    } catch (e: any) {
      steps.value[8].status = 'error';
      steps.value[8].message = `${t('diagnostics.access_error')}: ${e.message}`;
      isRunning.value = false;
      return;
    }

    // Step 10: QR Code Generation
    await setStepRunning(9);
    try {
      const testUrl = `https://minihostapp-1.web.app/?game=${testGameId || 'TEST'}&secret=test`;
      const qrData = await QRCode.toDataURL(testUrl, { width: 250, margin: 1 });
      if (!qrData || !qrData.startsWith('data:image/')) {
        throw new Error(t('diagnostics.qrcode_invalid'));
      }
      steps.value[9].status = 'success';
      steps.value[9].message = t('diagnostics.qrcode_ok');
    } catch (e: any) {
      steps.value[9].status = 'error';
      steps.value[9].message = e?.message || t('diagnostics.qrcode_error');
      isRunning.value = false;
      return;
    }

    // Step 11: Popup Blocker
    await setStepRunning(10);
    try {
      const popup = window.open('about:blank', '_blank', 'width=100,height=100,left=-1000,top=-1000');
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        throw new Error();
      }
      popup.close();
      steps.value[10].status = 'success';
      steps.value[10].message = t('diagnostics.popup_ok');
    } catch {
      steps.value[10].status = 'warning';
      steps.value[10].message = t('diagnostics.popup_warning');
    }

    // Step 12: Firebase Retrieve
    await setStepRunning(11);
    try {
      const fetchedGame = await animatorService.getGame(testGameId);
      if (!fetchedGame) throw new Error(t('diagnostics.game_not_found'));
      steps.value[11].status = 'success';
      steps.value[11].message = t('diagnostics.data_synced');
    } catch (e: any) {
      steps.value[11].status = 'error';
      steps.value[11].message = e?.message || t('diagnostics.game_fetch_error');
    }

    // Step 13: Firebase Clean
    await setStepRunning(12);
    try {
      if (testGameId) {
        await animatorService.deleteGame(testGameId);
        steps.value[12].status = 'success';
        steps.value[12].message = t('diagnostics.cleanup_ok');
      }
    } catch (e: any) {
      steps.value[12].status = 'error';
      steps.value[12].message = `${t('diagnostics.cleanup_error')} ${e.message}`;
    }

    isRunning.value = false;
  };

  return {
    isRunning,
    steps,
    runDiagnostics
  };
}
