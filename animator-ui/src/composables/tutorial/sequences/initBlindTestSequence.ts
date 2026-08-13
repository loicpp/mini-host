import { driver } from 'driver.js';
import i18n from '../../../i18n';
import { tutorialState, isTutorialActive } from '../state';
import { addSkipBtnWithCallback, moveToNextStep, goBackToSequence } from '../utils';
import { playCreateGameSequence } from './createGameSequence';

const { t } = i18n.global;

export const playInitBlindTestSequence = (router?: any, startIndex: number = 1) => {
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
      showProgress: true,
      progressText: t('tutorial.progress', { current: '{{current}}', total: '{{total}}' }),
      steps: [
        { popover: { title: 'dummy', description: '' }, element: 'body' }, // index 0
        {
          element: '#blind-test-main-card',
          disableActiveInteraction: true,
          popover: {
            title: t('tutorial.initBlindTestSequence.presentation.title'),
            description: t('tutorial.initBlindTestSequence.presentation.description'),
            side: 'bottom',
            align: 'start',
            onPrevClick: () => {
              goBackToSequence(router, '/create-game', playCreateGameSequence, 1);
            },
            onPopoverRender: (popover) => {
              addSkipBtnWithCallback(popover, () => {
                const target = document.querySelector('#mode-text-card') as HTMLElement;
                if (target) {
                  target.click();
                }
                if (tutorialState.driverObj) tutorialState.driverObj.drive(9);
              });
            }
          }
        },
        {
          element: '#input-settings',
          disableActiveInteraction: true,
          popover: {
            title: t('tutorial.initBlindTestSequence.input-mode.title'),
            description: t('tutorial.initBlindTestSequence.input-mode.description'),
            side: 'bottom',
            align: 'start'
          }          
        },
        {
          element: '#mode-text-card',
          popover: {
            title: t('tutorial.initBlindTestSequence.text-input.title'),
            description: t('tutorial.initBlindTestSequence.text-input.description'),
            side: 'bottom',
            align: 'start',
            showButtons: ['next', 'previous'],
            onNextClick: () => {
              const btn = document.querySelector('#mode-text-card') as HTMLButtonElement;
              if (btn) btn.click();
            },
            onPopoverRender: () => {
              moveToNextStep('#mode-text-card');
            }
          }
        },
        {
          element: '#game-settings',
          disableActiveInteraction: true,
          popover: {
            title: t('tutorial.initBlindTestSequence.game-settings.title'),
            description: t('tutorial.initBlindTestSequence.game-settings.description'),
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#adjust-summary-bar',
          popover: {
            title: t('tutorial.initBlindTestSequence.adjust-summary.title'),
            description: t('tutorial.initBlindTestSequence.adjust-summary.description'),
            side: 'bottom',
            align: 'start',
            showButtons: ['next', 'previous'],
            onNextClick: () => {
              const btn = document.querySelector('#adjust-summary-bar') as HTMLButtonElement;
              if (btn) btn.click();
            },
            onPopoverRender: () => {
              moveToNextStep('#adjust-summary-bar');
            }
          }
        },
        {
          element: '#sliders-panel',
          disableActiveInteraction: true,
          popover: {
            title: t('tutorial.initBlindTestSequence.time-limit.title'),
            description: t('tutorial.initBlindTestSequence.time-limit.description'),
            side: 'bottom',
            align: 'start',
          }
        },
        {
          element: '#additional-options',
          disableActiveInteraction: true,
          popover: {
            title: t('tutorial.initBlindTestSequence.additional-settings.title'),
            description: t('tutorial.initBlindTestSequence.additional-settings.description'),
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#playlist-settings',
          disableActiveInteraction: true,
          popover: {
            title: t('tutorial.initBlindTestSequence.playlist.title'),
            description: t('tutorial.initBlindTestSequence.playlist.description'),
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#start-btn',
          popover: {
            title: t('tutorial.initBlindTestSequence.start-game.title'),
            description: t('tutorial.initBlindTestSequence.start-game.description'),
            side: 'bottom',
            align: 'start',
            showButtons: ['next', 'previous'],
            onNextClick: () => {
              const btn = document.querySelector('#start-btn') as HTMLButtonElement;
              if (btn) btn.click();
            }
          }
        },
        { popover: { title: 'dummy', description: '' }, element: 'body' } // index 10
      ]
    });
    tutorialState.driverObj.drive(startIndex);
  }, 500);
};
