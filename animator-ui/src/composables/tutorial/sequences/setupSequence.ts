import { driver } from 'driver.js';
import i18n from '../../../i18n';
import { tutorialState, isTutorialActive } from '../state';
import { goBackToSequence, dummyStep, fixTutorialProgress } from '../utils';
import { playHomeSequence } from './homeSequence';

const { t } = i18n.global;

import router from '../../../router';

export const playSetupSequence = (startIndex: number = 1) => {
  if (!isTutorialActive.value) return;
  setTimeout(() => {
    if (tutorialState.driverObj) {
      tutorialState.driverObj.destroy();
    }
    tutorialState.driverObj = driver({
      allowClose: false,
      showButtons: ['next', 'previous'],
      nextBtnText: t('tutorial.buttons.next'),
      prevBtnText: t('tutorial.buttons.prev'),
      doneBtnText: t('tutorial.buttons.done'),
      onPrevClick: () => {
        if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
      },
      onPopoverRender: (popover) => {
        fixTutorialProgress(popover, tutorialState.driverObj, 1, 2);
      },
      steps: [
        dummyStep,
        {
          element: '#setup-type-selector',
          popover: {
            title: t('tutorial.setupSequence.step1.title'),
            description: t('tutorial.setupSequence.step1.description'),
            side: 'top',
            align: 'start',
            showButtons: ['next', 'previous'],
            onPrevClick: () => {
              goBackToSequence('/', () => playHomeSequence(6));
            },
            onNextClick: () => {
              if (router) router.push('/playlists');
            },
            onPopoverRender: (popover) => {
              fixTutorialProgress(popover, tutorialState.driverObj, 1, 2);
              const checkInterval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 1) {
                  clearInterval(checkInterval); return;
                }
                if (document.querySelector('#input-new-playlist')) {
                  clearInterval(checkInterval);
                  if (tutorialState.driverObj) tutorialState.driverObj.destroy();
                  setTimeout(() => import('./playlistsSequence').then(m => m.playPlaylistsSequence(1)), 200);
                }
              }, 200);
            }
          }
        },
        dummyStep
      ]
    });
    tutorialState.driverObj.drive(startIndex);
  }, 500);
};
