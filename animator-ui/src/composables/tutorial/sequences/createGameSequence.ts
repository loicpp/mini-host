import { driver } from 'driver.js';
import i18n from '../../../i18n';
import { tutorialState, isTutorialActive } from '../state';
import { goBackToSequence, dummyStep, fixTutorialProgress } from '../utils';
import { resumeHomeSequence } from './homeSequence';

const { t } = i18n.global;

import router from '../../../router';

export const playCreateGameSequence = (startIndex: number = 1) => {
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
        fixTutorialProgress(popover, tutorialState.driverObj);
      },
      steps: [
        dummyStep,
        {
          element: '#game-type-selector',
          popover: {
            title: t('tutorial.createGameSequence.step1.title'),
            description: t('tutorial.createGameSequence.step1.description'),
            side: 'top',
            align: 'start',
            showButtons: ['next', 'previous'],
            onPrevClick: () => {
              goBackToSequence('/', () => resumeHomeSequence(1));
            },
            onNextClick: () => {
              if (router) router.push('/game/create/blind_test');
            },
            onPopoverRender: (popover) => {
              fixTutorialProgress(popover, tutorialState.driverObj);
              const checkInterval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 1) {
                  clearInterval(checkInterval); return;
                }
                if (document.querySelector('#input-settings')) {
                  clearInterval(checkInterval);
                  if (tutorialState.driverObj) tutorialState.driverObj.destroy();
                  setTimeout(() => import('./initBlindTestSequence').then(m => m.playInitBlindTestSequence(1)), 200);
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
