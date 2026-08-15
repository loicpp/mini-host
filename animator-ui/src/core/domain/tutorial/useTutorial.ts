import { useRouter } from 'vue-router';
import 'driver.js/dist/driver.css';
import { isTutorialActive, tutorialGameId, tutorialState } from './state';
import { playHomeSequence, resumeHomeSequence } from './sequences/homeSequence';
import { playSetupSequence } from './sequences/setupSequence';
import { playPlaylistsSequence } from './sequences/playlistsSequence';
import { playPlaylistEditorSequence } from './sequences/playlistEditorSequence';
import { playCreateGameSequence } from './sequences/createGameSequence';
import { playInitBlindTestSequence } from './sequences/initBlindTestSequence';
import { playGameSessionSequence } from './sequences/gameSessionSequence';

export function useTutorial() {
  const router = useRouter();

  const startTutorial = () => {
    isTutorialActive.value = true;
    tutorialState.playlistCreated = false;
    playHomeSequence();
  };

  const exitTutorial = async () => {
    isTutorialActive.value = false;
    if (tutorialState.driverObj) {
      tutorialState.driverObj.destroy();
      tutorialState.driverObj = null;
    }
    router.push('/');
  };



  return {
    startTutorial,
    resumeHomeSequence: () => resumeHomeSequence(),
    exitTutorial,
    playSetupSequence: () => playSetupSequence(),
    playPlaylistsSequence: () => playPlaylistsSequence(),
    playPlaylistEditorSequence: () => playPlaylistEditorSequence(),
    playCreateGameSequence: () => playCreateGameSequence(),
    playInitBlindTestSequence: () => playInitBlindTestSequence(),
    playGameSessionSequence: () => playGameSessionSequence(),
    isTutorialActive,
    tutorialGameId
  };
}

export { isTutorialActive, tutorialGameId } from './state';
