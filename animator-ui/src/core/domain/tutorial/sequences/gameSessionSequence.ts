import { driver } from 'driver.js';
import i18n from '../../../../i18n';
import { tutorialState, isTutorialActive, tutorialGameId } from '../state';
import { watch } from 'vue';
import { useGameStore } from '../../general/stores/game';
import { useMusicStore } from '../../general/stores/music';
import { usePlayerStore } from '../../general/stores/player';

const { gameId, status, nextTrackInfo } = useGameStore();
const { selectedTrack, playedTracks } = useMusicStore();
const { pendingPoints, autoCorrectResults, wasAutoCorrected, lastAwardedPoints } = usePlayerStore();
import { tutorialMockService } from '../../../../services/tutorialMockService';
import { animatorService } from '../../../../services/animatorService';
import { musicManager } from '../../../../services/music/MusicManager';
import { goBackToSequence, dummyStep, fixTutorialProgress } from '../utils';
import { playInitBlindTestSequence } from './initBlindTestSequence';

const { t } = i18n.global;

let savedTutorialTrack: any = null;

export const advanceToMusicLaunched = () => {
  if (tutorialState.driverObj && isTutorialActive.value) {
    const targetGameId = tutorialGameId.value || gameId.value;
    if (targetGameId) {
      tutorialMockService.simulateAnswers(targetGameId, selectedTrack.value);
    }
    
    const checkReviewingInterval = setInterval(() => {
      if (!isTutorialActive.value || !tutorialState.driverObj || tutorialState.driverObj.getActiveIndex() !== 10) {
        clearInterval(checkReviewingInterval);
        return;
      }
      if (document.querySelector('#player-grid')) {
        clearInterval(checkReviewingInterval);
        tutorialState.driverObj.moveNext();
      }
    }, 500);
  }
};

export const playGameSessionSequence = async (startIndex: number = 1) => {
  if (!isTutorialActive.value) return;
  
  if (!gameId.value) {
    const unwatch = watch(gameId, async (newVal) => {
      if (newVal) {
        unwatch();
        await playGameSessionSequence();
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
      onPopoverRender: (popover) => {
        fixTutorialProgress(popover, tutorialState.driverObj, 1, 1);
      },
      showProgress: true,
      progressText: t('tutorial.progress', { current: '{{current}}', total: '{{total}}' }),
      steps: [
        dummyStep,
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
                  await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/games/${gameId.value}`, { method: 'DELETE' });
                } catch (e) {
                  console.error("Failed to delete game for tutorial:", e);
                }
              }
              if (tutorialState.driverObj) tutorialState.driverObj.destroy();
              tutorialGameId.value = null;
              gameId.value = '';
              goBackToSequence('/game/create/blind_test', () => {
                const modeCard = document.querySelector('#mode-text-card') as HTMLButtonElement;
                if (modeCard) modeCard.click();
                const slidersPanel = document.querySelector('#sliders-panel') as HTMLElement;
                if (slidersPanel && !slidersPanel.offsetParent) {
                  const adjustBar = document.querySelector('#adjust-summary-bar') as HTMLButtonElement;
                  if (adjustBar) adjustBar.click();
                }
                playInitBlindTestSequence(9);
              });
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
            onPopoverRender: (popover) => {
              fixTutorialProgress(popover, tutorialState.driverObj, 1, 1);
              const checkModalInterval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 4) {
                  clearInterval(checkModalInterval);
                  return;
                }
                if (document.querySelector('#player-list')) {
                  clearInterval(checkModalInterval);
                  tutorialState.driverObj.moveNext();
                }
              }, 500);
            },
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
            align: 'start',
            onPrevClick: () => {
              const closeBtn = document.querySelector('#players-modal-close-btn') as HTMLButtonElement;
              if (closeBtn) closeBtn.click();
              if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
            }
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
            onPopoverRender: (popover) => {
              fixTutorialProgress(popover, tutorialState.driverObj, 1, 1);
              const checkModalInterval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 6) {
                  clearInterval(checkModalInterval);
                  return;
                }
                if (document.querySelector('#player-actions-modal')) {
                  clearInterval(checkModalInterval);
                  tutorialState.driverObj.moveNext();
                }
              }, 500);
            },
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
            onPrevClick: () => {
              const cancelBtn = document.querySelector('#player-actions-cancel-btn') as HTMLButtonElement;
              if (cancelBtn) cancelBtn.click();
              if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
            },
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
            onPopoverRender: (popover) => {
              fixTutorialProgress(popover, tutorialState.driverObj, 1, 1);
              const checkTrackInterval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 8) {
                  clearInterval(checkTrackInterval);
                  return;
                }
                if (document.querySelector('.track-item.selected') || selectedTrack.value) {
                  clearInterval(checkTrackInterval);
                  tutorialState.driverObj.moveNext();
                }
              }, 500);
            },
            onPrevClick: () => {
              const playersBtn = document.querySelector('#players-btn') as HTMLButtonElement;
              if (playersBtn) playersBtn.click();
              
              const checkBtnInterval = setInterval(() => {
                const actionsBtn = document.querySelector('.player-actions-btn') as HTMLButtonElement;
                if (actionsBtn) {
                  clearInterval(checkBtnInterval);
                  actionsBtn.click();
                  
                  const checkModalInterval = setInterval(() => {
                    if (document.querySelector('#player-actions-modal')) {
                      clearInterval(checkModalInterval);
                      if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
                    }
                  }, 50);
                }
              }, 50);
            },
            onNextClick: () => {
              if (!selectedTrack.value) {
                const trackBtn = document.querySelector('#track-selection-panel div[id^="track-"]') as HTMLElement;
                if (trackBtn) trackBtn.click();
              } else {
                if (tutorialState.driverObj) tutorialState.driverObj.moveNext();
              }
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
            onPopoverRender: (popover) => {
              fixTutorialProgress(popover, tutorialState.driverObj, 1, 1);
              const checkPlayingInterval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 9) {
                  clearInterval(checkPlayingInterval);
                  return;
                }
                if (document.querySelector('#player-grid-playing')) {
                  clearInterval(checkPlayingInterval);
                  tutorialState.driverObj.moveNext();
                  advanceToMusicLaunched();
                }
              }, 500);
            },
            onPrevClick: () => {
              selectedTrack.value = null;
              if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
            },
            onNextClick: () => {
              savedTutorialTrack = selectedTrack.value;
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
            showButtons: ['next', 'previous'],
            onNextClick: () => {
              const targetGameId = tutorialGameId.value || gameId.value;
              if (targetGameId) {
                tutorialMockService.fastForwardAnswers(targetGameId, selectedTrack.value);
              }
            },
            onPrevClick: async () => {
              // UNDO Music Launch
              status.value = 'waiting';
              try {
                await musicManager.stop();
              } catch (e) {
                console.error("Failed to stop music for tutorial:", e);
              }
              
              const targetGameId = tutorialGameId.value || gameId.value;
              if (targetGameId) {
                tutorialMockService.clearAnswers(targetGameId);
              }
              
              if (selectedTrack.value?.id) {
                playedTracks.value = playedTracks.value.filter((id: string) => id !== selectedTrack.value?.id);
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
            align: 'start',
            showButtons: ['next', 'previous'],
            onPrevClick: async () => {
              const targetGameId = tutorialGameId.value || gameId.value;
              if (targetGameId) {
                tutorialMockService.clearAnswers(targetGameId);
              }
              status.value = 'playing';
              try {
                if (selectedTrack.value) {
                  await musicManager.play(selectedTrack.value);
                }
              } catch (e) {
                console.error("Failed to play music for tutorial:", e);
              }
              
              if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
              
              if (targetGameId) {
                tutorialMockService.simulateAnswers(targetGameId, selectedTrack.value);
              }
              advanceToMusicLaunched();
            }
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
            onPrevClick: () => {
              pendingPoints.value = {};
              autoCorrectResults.value = {};
              wasAutoCorrected.value = false;
              if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
            },
            onPopoverRender: (popover) => {
              fixTutorialProgress(popover, tutorialState.driverObj, 1, 1);
              const checkInterval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 12) {
                  clearInterval(checkInterval);
                  return;
                }
                if (wasAutoCorrected.value) {
                  clearInterval(checkInterval);
                  tutorialState.driverObj.moveNext();
                }
              }, 500);
            },
            onNextClick: () => {
              const btn = document.querySelector('#auto-correct-btn') as HTMLButtonElement;
              if (btn) btn.click();
              if (tutorialState.driverObj) tutorialState.driverObj.moveNext();
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
            align: 'start',
            showButtons: ['next', 'previous'],
            onPrevClick: () => {
              pendingPoints.value = {};
              autoCorrectResults.value = {};
              wasAutoCorrected.value = false;
              if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
            }
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
            onPopoverRender: (popover) => {
              fixTutorialProgress(popover, tutorialState.driverObj, 1, 1);
              const checkInterval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 14) {
                  clearInterval(checkInterval);
                  return;
                }
                if (document.querySelector('#player-rank')) {
                  clearInterval(checkInterval);
                  tutorialState.driverObj.moveNext();
                }
              }, 500);
            },
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
            align: 'start',
            showButtons: ['next', 'previous'],
            onPrevClick: async () => {
              const targetGameId = tutorialGameId.value || gameId.value;
              if (targetGameId) {
                for (const [playerId, points] of Object.entries(lastAwardedPoints.value)) {
                  if (points !== 0) {
                    await animatorService.awardPoints(targetGameId, playerId, -(points as number));
                  }
                }
                await animatorService.updateRanks(targetGameId);
                await animatorService.updateGameState(targetGameId, 'reviewing');
              }
              status.value = 'reviewing';
              
              setTimeout(() => {
                const btn = document.querySelector('#auto-correct-btn') as HTMLButtonElement;
                if (btn) btn.click();
                if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
              }, 100);
            }
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
            onPrevClick: () => {
              if (savedTutorialTrack) {
                selectedTrack.value = savedTutorialTrack;
                nextTrackInfo.value.answer = savedTutorialTrack.artist ? `${savedTutorialTrack.title} - ${savedTutorialTrack.artist}` : savedTutorialTrack.title;
                const targetGameId = tutorialGameId.value || gameId.value;
                if (targetGameId) {
                  tutorialMockService.fastForwardAnswers(targetGameId, savedTutorialTrack);
                }
              }
              if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
            },
            onPopoverRender: (popover) => {
              fixTutorialProgress(popover, tutorialState.driverObj, 1, 1);
              const checkInterval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 16) {
                  clearInterval(checkInterval);
                  return;
                }
                if (!document.querySelector('#player-rank')) {
                  clearInterval(checkInterval);
                  tutorialState.driverObj.moveNext();
                }
              }, 500);
            },
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
            onPopoverRender: (popover) => {
              fixTutorialProgress(popover, tutorialState.driverObj, 1, 1);
              const checkInterval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 17) {
                  clearInterval(checkInterval);
                  return;
                }
                const confirmBtn = Array.from(document.querySelectorAll('button')).find(btn => 
                  btn.textContent?.includes(t('dialogs.stop_game.confirm')) && btn.id !== 'stop-btn'
                );
                if (confirmBtn) {
                  confirmBtn.click();
                }
                if (document.querySelector('.lucide-refresh-cw')) {
                  clearInterval(checkInterval);
                  tutorialState.driverObj.moveNext();
                }
              }, 500);
            },
            onPrevClick: async () => {
              if (savedTutorialTrack) {
                selectedTrack.value = savedTutorialTrack;
                nextTrackInfo.value.answer = savedTutorialTrack.artist ? `${savedTutorialTrack.title} - ${savedTutorialTrack.artist}` : savedTutorialTrack.title;
                const targetGameId = tutorialGameId.value || gameId.value;
                if (targetGameId) {
                  tutorialMockService.fastForwardAnswers(targetGameId, savedTutorialTrack);
                }
              }
              const targetGameId = tutorialGameId.value || gameId.value;
              if (targetGameId) {
                await animatorService.updateGameState(targetGameId, 'results');
              }
              status.value = 'results';
              setTimeout(() => {
                if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
              }, 100);
            },
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
            showButtons: ['next', 'previous'],
            onPrevClick: async () => {
              const targetGameId = tutorialGameId.value || gameId.value;
              if (targetGameId) {
                await animatorService.updateGameState(targetGameId, 'waiting');
              }
              status.value = 'waiting';
              setTimeout(() => {
                if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
              }, 100);
            },
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
