import { useRouter } from 'vue-router';
import 'driver.js/dist/driver.css';
import { isTutorialActive, tutorialGameId, tutorialState } from './state';
import { playHomeSequence, resumeHomeSequence } from './sequences/homeSequence';
import { playSetupSequence } from './sequences/setupSequence';
import { playPlaylistsSequence } from './sequences/playlistsSequence';
import { playPlaylistEditorSequence } from './sequences/playlistEditorSequence';
import { playCreateGameSequence } from './sequences/createGameSequence';
import { playInitBlindTestSequence } from './sequences/initBlindTestSequence';
import { advanceToMusicLaunched, playGameSessionSequence } from './sequences/gameSessionSequence';

export function useTutorial() {
  const router = useRouter();

  const startTutorial = () => {
    isTutorialActive.value = true;
    tutorialState.playlistCreated = false;
    playHomeSequence();
  };


  const advanceToTrackSelected = () => {
    if (tutorialState.driverObj && isTutorialActive.value) {
      if (typeof tutorialState.driverObj.getActiveIndex === 'function' && tutorialState.driverObj.getActiveIndex() === 8) {
        tutorialState.driverObj.moveNext();
      } else if (typeof tutorialState.driverObj.getActiveIndex !== 'function') {
        tutorialState.driverObj.moveNext();
      }
    }
  };

  const advanceToPlayerMenu = () => {
    if (tutorialState.driverObj && isTutorialActive.value) {
      if (typeof tutorialState.driverObj.getActiveIndex === 'function' && tutorialState.driverObj.getActiveIndex() === 4) {
        tutorialState.driverObj.moveNext();
      } else if (typeof tutorialState.driverObj.getActiveIndex !== 'function') {
        tutorialState.driverObj.moveNext();
      }
    }
  };

  const advanceToPlayerActions = () => {
    if (tutorialState.driverObj && isTutorialActive.value) {
      if (typeof tutorialState.driverObj.getActiveIndex === 'function' && tutorialState.driverObj.getActiveIndex() === 6) {
        tutorialState.driverObj.moveNext();
      } else if (typeof tutorialState.driverObj.getActiveIndex !== 'function') {
        tutorialState.driverObj.moveNext();
      }
    }
  };

  const exitTutorial = async () => {
    isTutorialActive.value = false;
    if (tutorialState.driverObj) {
      tutorialState.driverObj.destroy();
      tutorialState.driverObj = null;
    }
    router.push('/');
  };

  const advanceTutorialStep = () => {
    if (tutorialState.driverObj && isTutorialActive.value) {
      tutorialState.driverObj.moveNext();
    }
  };

  return {
    startTutorial,
    resumeHomeSequence: () => resumeHomeSequence(),
    exitTutorial,
    playSetupSequence: () => playSetupSequence(router),
    playPlaylistsSequence: () => playPlaylistsSequence(router),
    playPlaylistEditorSequence: () => playPlaylistEditorSequence(router),
    playCreateGameSequence: () => playCreateGameSequence(router),
    playInitBlindTestSequence: () => playInitBlindTestSequence(router),
    playGameSessionSequence: () => playGameSessionSequence(router),
    isTutorialActive,
    tutorialGameId,

    advanceToTrackSelected,
    advanceToMusicLaunched,
    advanceTutorialStep,
    advanceToPlayerMenu,
    advanceToPlayerActions
  };
}

export { isTutorialActive, tutorialGameId } from './state';
