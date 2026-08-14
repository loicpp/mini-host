import { driver } from 'driver.js';
import i18n from '../../../i18n';
import { tutorialState, isTutorialActive, tutorialGameId } from '../state';
import { watch } from 'vue';
import { gameId, selectedTrack } from '../../state';
import { tutorialMockService } from '../../../services/tutorialMockService';
import { goBackToSequence } from '../utils';
import { playInitBlindTestSequence } from './initBlindTestSequence';

const { t } = i18n.global;

export const advanceToMusicLaunched = () => {
  if (tutorialState.driverObj && isTutorialActive.value) {
    const targetGameId = tutorialGameId.value || gameId.value;
    if (targetGameId) {
      tutorialMockService.simulateAnswers(targetGameId, selectedTrack.value);
    }
    
    const checkPlayingInterval = setInterval(() => {
        if (!isTutorialActive.value || !tutorialState.driverObj) {
          clearInterval(checkPlayingInterval);
          return;
        }
        if (document.querySelector('#player-grid-playing')) {
          clearInterval(checkPlayingInterval);
          tutorialState.driverObj.moveNext();
          
          const checkReviewingInterval = setInterval(() => {
            if (!isTutorialActive.value || !tutorialState.driverObj) {
              clearInterval(checkReviewingInterval);
              return;
            }
            if (document.querySelector('#player-grid')) {
              clearInterval(checkReviewingInterval);
              tutorialState.driverObj.moveNext();
            }
          }, 500);
        }
      }, 500);
  }
};

export const playGameSessionSequence = async (router?: any, startIndex: number = 1) => {
  if (!isTutorialActive.value) return;
  if (tutorialState.nextSequenceOverride) {
    const override = tutorialState.nextSequenceOverride;
    tutorialState.nextSequenceOverride = undefined;
    override();
    return;
  }
  
  if (!gameId.value) {
    const unwatch = watch(gameId, async (newVal) => {
      if (newVal) {
        unwatch();
        await playGameSessionSequence(router);
      }
    });
    return;
  }

  if (tutorialGameId.value !== gameId.value) {
    tutorialGameId.value = gameId.value;
  }

  try {
    await tutorialMockService.addFakePlayers(gameId.value);
  } catch (e) {
    console.error("Failed to add fake players for tutorial:", e);
  }
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
          popover: {
            title: t('tutorial.gameSessionSequence.step1.title'),
            description: t('tutorial.gameSessionSequence.step1.description'),
            side: 'bottom',
            align: 'start',
            onPrevClick: async () => {
              // UNDO Game Creation
              if (gameId.value) {
                try {
                  await fetch(`http://127.0.0.1:5000/api/games/${gameId.value}`, { method: 'DELETE' });
                } catch (e) {
                  console.error("Failed to delete game for tutorial:", e);
                }
              }
              if (tutorialState.driverObj) tutorialState.driverObj.destroy();
              tutorialGameId.value = null;
              gameId.value = '';
              goBackToSequence(router, '/game/create/blind_test', () => playInitBlindTestSequence(router, 9));
            }
          }
        },
        {
          element: '#projector-btn',
          popover: {
            title: t('tutorial.gameSessionSequence.step2.title'),
            description: t('tutorial.gameSessionSequence.step2.description'),
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#game-status',
          popover: {
            title: t('tutorial.gameSessionSequence.step3.title'),
            description: t('tutorial.gameSessionSequence.step3.description'),
            side: 'bottom',
            align: 'start'
          }
        },
        {
          element: '#players-btn',
          popover: {
            title: t('tutorial.gameSessionSequence.step4.title'),
            description: t('tutorial.gameSessionSequence.step4.description'),
            side: 'right',
            align: 'start',
            showButtons: ['next', 'previous'],
            onNextClick: () => {
              const btn = document.querySelector('#players-btn') as HTMLButtonElement;
              if (btn) btn.click();
            }
          }
        },
        {
          element: '#player-list',
          disableActiveInteraction: true,
          popover: {
            title: t('tutorial.gameSessionSequence.player-list.title'),
            description: t('tutorial.gameSessionSequence.player-list.description'),
            side: 'right',
            align: 'start'
          }
        },
        {
          element: '.player-actions-btn',
          popover: {
            title: t('tutorial.gameSessionSequence.step4b.title'),
            description: t('tutorial.gameSessionSequence.step4b.description'),
            side: 'left',
            align: 'start',
            showButtons: ['next', 'previous'],
            onNextClick: () => {
              const btn = document.querySelector('.player-actions-btn') as HTMLButtonElement;
              if (btn) btn.click();
            }
          }
        },
        {
          element: '#player-actions-modal',
          disableActiveInteraction: true,
          popover: {
            title: t('tutorial.gameSessionSequence.step4c.title'),
            description: t('tutorial.gameSessionSequence.step4c.description'),
            side: 'right',
            align: 'start',
            onNextClick: () => {
              const cancelBtn = document.querySelector('#player-actions-cancel-btn') as HTMLButtonElement;
              if (cancelBtn) cancelBtn.click();
              setTimeout(() => {
                const closeBtn = document.querySelector('#players-modal-close-btn') as HTMLButtonElement;
                if (closeBtn) closeBtn.click();
                if (tutorialState.driverObj) tutorialState.driverObj.moveNext();
              }, 300);
            }
          }
        },
        {
          element: '#track-selection-panel',
          popover: {
            title: t('tutorial.gameSessionSequence.step5.title'),
            description: t('tutorial.gameSessionSequence.step5.description'),
            side: 'left',
            align: 'start',
            showButtons: ['next', 'previous'],
            onNextClick: () => {
              const trackBtn = document.querySelector('#track-selection-panel button.track-item') as HTMLButtonElement;
              if (trackBtn) trackBtn.click();
            }
          }
        },
        {
          element: '#music-control-btn',
          popover: {
            title: t('tutorial.gameSessionSequence.step6.title'),
            description: t('tutorial.gameSessionSequence.step6.description'),
            side: 'left',
            align: 'start',
            showButtons: ['next', 'previous'],
            onNextClick: () => {
              const btn = document.querySelector('#music-control-btn') as HTMLButtonElement;
              if (btn) btn.click();
            }
          }
        },
        {
          element: '#player-grid-playing',
          disableActiveInteraction: true,
          popover: {
            title: t('tutorial.gameSessionSequence.step7.title'),
            description: t('tutorial.gameSessionSequence.step7.description'),
            side: 'top',
            align: 'start',
            onPrevClick: () => {
              // UNDO Music Launch
              if (document.querySelector('#player-grid-playing')) {
                const btn = document.querySelector('#music-control-btn') as HTMLButtonElement;
                if (btn) btn.click();
              }
              if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
            }
          }
        },
        {
          element: '#player-grid',
          disableActiveInteraction: true,
          popover: {
            title: t('tutorial.gameSessionSequence.step7.title'),
            description: t('tutorial.gameSessionSequence.step8.description'),
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#auto-correct-btn',
          popover: {
            title: t('tutorial.gameSessionSequence.step9.title'),
            description: t('tutorial.gameSessionSequence.step9.description'),
            side: 'top',
            align: 'start',
            showButtons: ['next', 'previous'],
            onNextClick: () => {
              const btn = document.querySelector('#auto-correct-btn') as HTMLButtonElement;
              if (btn) btn.click();
            }
          }
        },
        {
          element: '#player-grid',
          disableActiveInteraction: true,
          popover: {
            title: t('tutorial.gameSessionSequence.step7.title'),
            description: t('tutorial.gameSessionSequence.step10.description'),
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#submit-correction-btn',
          popover: {
            title: t('tutorial.gameSessionSequence.step11.title'),
            description: t('tutorial.gameSessionSequence.step11.description'),
            side: 'top',
            align: 'start',
            showButtons: ['next', 'previous'],
            onNextClick: () => {
              const btn = document.querySelector('#submit-correction-btn') as HTMLButtonElement;
              if (btn) btn.click();
            }
          }
        },
        {
          element: '#player-rank',
          popover: {
            title: t('tutorial.gameSessionSequence.step12.title'),
            description: t('tutorial.gameSessionSequence.step12.description'),
            side: 'top',
            align: 'start'
          }
        },
        {
          element: '#next-round-btn',
          popover: {
            title: t('tutorial.gameSessionSequence.step13.title'),
            description: t('tutorial.gameSessionSequence.step13.description'),
            side: 'top',
            align: 'start',
            showButtons: ['next', 'previous'],
            onNextClick: () => {
              const btn = document.querySelector('#next-round-btn') as HTMLButtonElement;
              if (btn) btn.click();
            }
          }
        },
        {
          element: '#stop-btn',
          popover: {
            title: t('tutorial.gameSessionSequence.step14.title'),
            description: t('tutorial.gameSessionSequence.step14.description'),
            side: 'top',
            align: 'start',
            showButtons: ['next', 'previous'],
            onNextClick: () => {
              const btn = document.querySelector('#stop-btn') as HTMLButtonElement;
              if (btn) btn.click();
            }
          }
        },

        {
          popover: {
            title: t('tutorial.gameSessionSequence.step16.title'),
            description: t('tutorial.gameSessionSequence.step16.description'),
            side: 'bottom',
            align: 'start',
            onNextClick: async () => {
              tutorialState.driverObj.destroy();
              tutorialGameId.value = null;
              isTutorialActive.value = false;
            }
          }
        }
      ]
    });
    tutorialState.driverObj.drive(startIndex);
  }, 1000);
};
