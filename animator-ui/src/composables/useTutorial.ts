import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { tutorialMockService } from '../services/tutorialMockService';
import { gameId, selectedTrack } from './state';
import i18n from '../i18n';

const { t } = i18n.global;

export const isTutorialActive = ref(false);
export const tutorialGameId = ref<string | null>(null);

let driverObj: any = null;
let playlistCreated = false;

export function useTutorial() {
  const router = useRouter();

  const startTutorial = () => {
    isTutorialActive.value = true;
    playlistCreated = false;
    playHomeSequence();
  };

  const playHomeSequence = async () => {
    if (!isTutorialActive.value) return;

    try {
      setTimeout(() => {
        if (driverObj) {
          driverObj.destroy();
        }
        driverObj = driver({
          allowClose: false,
          showButtons: ['next'],
          nextBtnText: t('tutorial.buttons.next'),
          doneBtnText: t('tutorial.buttons.done'),
          onPrevClick: () => {},
          showProgress: true,
          steps: [
            {
              popover: {
                description: t('tutorial.homeSequence.step1.description'),
                side: 'bottom',
                align: 'start',
                onPopoverRender: (popover) => {
                  const skipPlaylistCreation = document.createElement("button");
                  skipPlaylistCreation.className = "driver-popover-footer-btn";
                  skipPlaylistCreation.innerText = t('tutorial.buttons.skip');
                  // Add this class to give the button the default driver.js styling.
                  // Leave it out if you want to apply your own styles instead.
                  skipPlaylistCreation.classList.add("driver-popover-footer-btn");
                  popover.footerButtons.appendChild(skipPlaylistCreation);

                  skipPlaylistCreation.addEventListener("click", () => {
                    driverObj.destroy();
                    playlistCreated = true;
                    resumeHomeSequence();
                  });
                },
              }
            },
            {
              element: '#home-screen',
              disableActiveInteraction: true,
              popover: {
                title: t('tutorial.homeSequence.step2.title'),
                description: t('tutorial.homeSequence.step2.description'),
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '#btn-create-game',
              disableActiveInteraction: true,
              popover: {
                title: t('tutorial.homeSequence.step3.title'),
                description: t('tutorial.homeSequence.step3.description'),
                side: 'left',
                align: 'start'
              }
            },
            {
              element: '#btn-setup',
              disableActiveInteraction: true,
              popover: {
                title: t('tutorial.homeSequence.step4.title'),
                description: t('tutorial.homeSequence.step4.description'),
                side: 'left',
                align: 'start'
              }
            },
            {
              element: '#btn-diagnostics',
              disableActiveInteraction: true,
              popover: {
                title: t('tutorial.homeSequence.step5.title'),
                description: t('tutorial.homeSequence.step5.description'),
                side: 'left',
                align: 'start'
              }
            },
            {
              element: '#btn-settings',
              disableActiveInteraction: true,
              popover: {
                title: t('tutorial.homeSequence.step6.title'),
                description: t('tutorial.homeSequence.step6.description'),
                side: 'left',
                align: 'start'
              }
            },
            {
              element: '#btn-setup',
              popover: {
                title: t('tutorial.homeSequence.step4.title'),
                description: t('tutorial.homeSequence.step7.description'),
                side: 'left',
                align: 'start',
                showButtons: [],
              onNextClick: () => {}
              }
            },
          ]
        });
        driverObj.drive();
      }, 500);
    } catch (e) {
      console.error(e);
    }
  };

  const playSetupSequence = () => {
    if (!isTutorialActive.value) return;
    setTimeout(() => {
      if (driverObj) {
        driverObj.destroy();
      }
      driverObj = driver({
          allowClose: false,
          showButtons: ['next'],
          nextBtnText: t('tutorial.buttons.next'),
          doneBtnText: t('tutorial.buttons.done'),
          onPrevClick: () => {},
        steps: [
          {
            element: '#setup-type-selector',
            popover: {
              title: t('tutorial.setupSequence.step1.title'),
              description: t('tutorial.setupSequence.step1.description'),
              side: 'top',
              align: 'start',
              showButtons: [],
              onNextClick: () => {}
            }
          }
        ]
      });
      driverObj.drive();
    }, 500);
  };

  const playPlaylistsSequence = () => {
    if (!isTutorialActive.value) return;
    setTimeout(() => {
      if (driverObj) {
        driverObj.destroy();
      }
      driverObj = driver({
          allowClose: false,
          showButtons: ['next'],
          nextBtnText: t('tutorial.buttons.next'),
          doneBtnText: t('tutorial.buttons.done'),
          onPrevClick: () => {},
        showProgress: true,
        steps: [
          {
            element: '#input-new-playlist',
            popover: {
              title: t('tutorial.playlistsSequence.step1.title'),
              description: t('tutorial.playlistsSequence.step1.description'),
              side: 'bottom',
              align: 'start',
              onNextClick: () => {
                const input = document.querySelector('#input-new-playlist') as HTMLInputElement;
                if (input && !input.value.trim()) {
                  input.value = "Playlist 1";
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                }
                if (driverObj) driverObj.moveNext();
              }
            }
          },
          {
            element: '#div-playlist-type',
            popover: {
              title: t('tutorial.playlistsSequence.step2.title'),
              description: t('tutorial.playlistsSequence.step2.description'),
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '#btn-create-playlist',
            popover: {
              title: t('tutorial.playlistsSequence.step3.title'),
              description: t('tutorial.playlistsSequence.step3.description'),
              side: 'bottom',
              align: 'start',
              showButtons: [],
              onNextClick: () => {}
            }
          },
          {
            element: '#btn-generate-playlist',
            disableActiveInteraction: true,
            popover: {
              title: t('tutorial.playlistsSequence.step4.title'),
              description: t('tutorial.playlistsSequence.step4.description'),
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '#div-playlists',
            disableActiveInteraction: true,
            popover: {
              title: t('tutorial.playlistsSequence.step5.title'),
              description: t('tutorial.playlistsSequence.step5.description'),
              side: 'top',
              align: 'start'
            }
          },
          {
            element: '#div-playlists > div:last-child .btn-edit-playlists',
            popover: {
              title: t('tutorial.playlistsSequence.step6.title'),
              description: t('tutorial.playlistsSequence.step6.description'),
              side: 'left',
              align: 'start',
              showButtons: [],
              onNextClick: () => {}
            }
          }
        ]
      });
      driverObj.drive();
    }, 500);
  };

  const advanceToSuggestions = () => {
    if (driverObj && isTutorialActive.value) {
      if (typeof driverObj.getActiveIndex === 'function' && driverObj.getActiveIndex() === 0) {
        driverObj.moveNext();
      } else if (typeof driverObj.getActiveIndex !== 'function') {
        driverObj.moveNext();
      }
    }
  };

  const advanceToCertification = () => {
    if (driverObj && isTutorialActive.value) {
      if (typeof driverObj.getActiveIndex === 'function' && driverObj.getActiveIndex() === 1) {
        driverObj.moveNext();
      } else if (typeof driverObj.getActiveIndex !== 'function') {
        driverObj.moveNext();
      }
    }
  };

  const advanceToTrackAdded = () => {
    if (driverObj && isTutorialActive.value) {
      if (typeof driverObj.getActiveIndex === 'function' && driverObj.getActiveIndex() === 4) {
        driverObj.moveNext();
      } else if (typeof driverObj.getActiveIndex !== 'function') {
        driverObj.moveNext();
      }
    }
  };

  const advanceToTrackSelected = () => {
    if (driverObj && isTutorialActive.value) {
      if (typeof driverObj.getActiveIndex === 'function' && driverObj.getActiveIndex() === 7) {
        driverObj.moveNext();
      } else if (typeof driverObj.getActiveIndex !== 'function') {
        driverObj.moveNext();
      }
    }
  };

  const advanceToPlayerMenu = () => {
    if (driverObj && isTutorialActive.value) {
      if (typeof driverObj.getActiveIndex === 'function' && driverObj.getActiveIndex() === 3) {
        driverObj.moveNext();
      } else if (typeof driverObj.getActiveIndex !== 'function') {
        driverObj.moveNext();
      }
    }
  };

  const advanceToPlayerActions = () => {
    if (driverObj && isTutorialActive.value) {
      if (typeof driverObj.getActiveIndex === 'function' && driverObj.getActiveIndex() === 5) {
        driverObj.moveNext();
      } else if (typeof driverObj.getActiveIndex !== 'function') {
        driverObj.moveNext();
      }
    }
  };

  const advanceToMusicLaunched = () => {
    if (driverObj && isTutorialActive.value) {
      const targetGameId = tutorialGameId.value || gameId.value;
      if (targetGameId) {
        tutorialMockService.simulateAnswers(targetGameId, selectedTrack.value);
      }
      
      const checkPlayingInterval = setInterval(() => {
          if (!isTutorialActive.value || !driverObj) {
            clearInterval(checkPlayingInterval);
            return;
          }
          if (document.querySelector('#player-grid-playing')) {
            clearInterval(checkPlayingInterval);
            driverObj.moveNext();
            
            const checkReviewingInterval = setInterval(() => {
              if (!isTutorialActive.value || !driverObj) {
                clearInterval(checkReviewingInterval);
                return;
              }
              if (document.querySelector('#player-grid')) {
                clearInterval(checkReviewingInterval);
                driverObj.moveNext();
              }
            }, 500);
          }
        }, 500);
    }
  };

  const playPlaylistEditorSequence = () => {
    if (!isTutorialActive.value) return;
    setTimeout(() => {
      if (driverObj) {
        driverObj.destroy();
      }
      driverObj = driver({
          allowClose: false,
          showButtons: ['next'],
          nextBtnText: t('tutorial.buttons.next'),
          doneBtnText: t('tutorial.buttons.done'),
          onPrevClick: () => {},
        showProgress: true,
        steps: [
          {
            element: '#track-name-input',
            popover: {
              title: t('tutorial.playlistEditorSequence.step1.title'),
              description: t('tutorial.playlistEditorSequence.step1.description'),
              side: 'bottom',
              align: 'start',
              showButtons: [],
              onNextClick: () => {}
            }
          },
          {
            element: '#track-suggestions-list',
            popover: {
              title: t('tutorial.playlistEditorSequence.step2.title'),
              description: t('tutorial.playlistEditorSequence.step2.description'),
              side: 'bottom',
              align: 'start',
              showButtons: [],
              onNextClick: () => {}
            }
          },
          {
            element: '#track-certification',
            popover: {
              title: t('tutorial.playlistEditorSequence.step3.title'),
              description: t('tutorial.playlistEditorSequence.step3.description'),
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '#soundcloud-track-url',
            disableActiveInteraction: true,
            popover: {
              title: t('tutorial.playlistEditorSequence.step4.title'),
              description: t('tutorial.playlistEditorSequence.step4.description'),
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '#soundcloud-add-track-btn',
            popover: {
              title: t('tutorial.playlistEditorSequence.step5.title'),
              description: t('tutorial.playlistEditorSequence.step5.description'),
              side: 'bottom',
              align: 'start',
              showButtons: [],
              onNextClick: () => {}
            }
          },
          {
            element: '#tracks-list',
            popover: {
              title: t('tutorial.playlistEditorSequence.step6.title'),
              description: t('tutorial.playlistEditorSequence.step6.description'),
              side: 'top',
              align: 'start'
            }
          },
          {
            popover: {
              title: t('tutorial.playlistEditorSequence.step7.title'),
              description: t('tutorial.playlistEditorSequence.step7.description'),
              side: 'bottom',
              align: 'start',
              onNextClick: () => {
                driverObj.destroy();
                router.push('/');
                playlistCreated = true;
              }
            }
          }
        ]
      });
      driverObj.drive();
    }, 500);
  };

  const resumeHomeSequence = () => {
    console.log(playlistCreated);
    if (!isTutorialActive.value || !playlistCreated) return;
    setTimeout(() => {
      if (driverObj) {
        driverObj.destroy();
      }
      driverObj = driver({
          allowClose: false,
          showButtons: ['next'],
          nextBtnText: t('tutorial.buttons.next'),
          doneBtnText: t('tutorial.buttons.done'),
          onPrevClick: () => {},
        steps: [
          {
            element: '#btn-create-game',
            popover: {
              title: t('tutorial.homeSequence.step3.title'),
              description: t('tutorial.resumeHomeSequence.step1.description'),
              side: 'left',
              align: 'start',
              showButtons: [],
              onNextClick: () => {}
            }
          }
        ]
      });
      driverObj.drive();
    }, 500);
  };

  const playCreateGameSequence = () => {
    if (!isTutorialActive.value) return;
    setTimeout(() => {
      if (driverObj) {
        driverObj.destroy();
      }
      driverObj = driver({
          allowClose: false,
          showButtons: ['next'],
          nextBtnText: t('tutorial.buttons.next'),
          doneBtnText: t('tutorial.buttons.done'),
          onPrevClick: () => {},
        steps: [
          {
            element: '#game-type-selector',
            popover: {
              title: t('tutorial.createGameSequence.step1.title'),
              description: t('tutorial.createGameSequence.step1.description'),
              side: 'top',
              align: 'start',
              showButtons: [],
              onNextClick: () => {}
            }
          }
        ]
      });
      driverObj.drive();
    }, 500);
  };

  const playInitBlindTestSequence = () => {
    if (!isTutorialActive.value) return;
    setTimeout(() => {
      if (driverObj) {
        driverObj.destroy();
      }
      driverObj = driver({
          allowClose: false,
          showButtons: ['next'],
          nextBtnText: t('tutorial.buttons.next'),
          doneBtnText: t('tutorial.buttons.done'),
          onPrevClick: () => {},
        showProgress: true,
        steps: [
          {
            element: '#quick-modes',
            disableActiveInteraction: true,
            popover: {
              title: t('tutorial.initBlindTestSequence.step1.title'),
              description: t('tutorial.initBlindTestSequence.step1.description'),
              side: 'bottom',
              align: 'start',
              onPopoverRender: (popover) => {
                const skipPlaylistCreation = document.createElement("button");
                skipPlaylistCreation.className = "driver-popover-footer-btn";
                skipPlaylistCreation.innerText = t('tutorial.buttons.skip');
                // Add this class to give the button the default driver.js styling.
                // Leave it out if you want to apply your own styles instead.
                skipPlaylistCreation.classList.add("driver-popover-footer-btn");
                popover.footerButtons.appendChild(skipPlaylistCreation);

                skipPlaylistCreation.addEventListener("click", () => {
                  driverObj.drive(5);
                });
              }
            }
          },
          {
            element: '#time-sliders',
            disableActiveInteraction: true,
            popover: {
              title: t('tutorial.initBlindTestSequence.step2.title'),
              description: t('tutorial.initBlindTestSequence.step2.description'),
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '#game-type-selector',
            disableActiveInteraction: true,
            popover: {
              title: t('tutorial.initBlindTestSequence.step3.title'),
              description: t('tutorial.initBlindTestSequence.step3.description'),
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '#allow-suggestions',
            disableActiveInteraction: true,
            popover: {
              title: t('tutorial.initBlindTestSequence.step4.title'),
              description: t('tutorial.initBlindTestSequence.step4.description'),
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '#select-playlist',
            disableActiveInteraction: true,
            popover: {
              title: t('tutorial.initBlindTestSequence.step5.title'),
              description: t('tutorial.initBlindTestSequence.step5.description'),
              side: 'bottom',
              align: 'start'
            }
          },
          {
            element: '#start-btn',
            popover: {
              title: t('tutorial.initBlindTestSequence.step6.title'),
              description: t('tutorial.initBlindTestSequence.step6.description'),
              side: 'bottom',
              align: 'start',
              showButtons: [],
              onNextClick: () => {}
            }
          }
        ]
      });
      driverObj.drive();
    }, 500);
  };

  const playGameSessionSequence = async () => {
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
      if (driverObj) {
        driverObj.destroy();
      }
      driverObj = driver({
          allowClose: false,
          showButtons: ['next'],
          nextBtnText: t('tutorial.buttons.next'),
          doneBtnText: t('tutorial.buttons.done'),
          onPrevClick: () => {},
        showProgress: true,
        steps: [
          {
            popover: {
              title: t('tutorial.gameSessionSequence.step1.title'),
              description: t('tutorial.gameSessionSequence.step1.description'),
              side: 'bottom',
              align: 'start'
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
              showButtons: [],
              onNextClick: () => {}
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
              showButtons: [],
              onNextClick: () => {}
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
                  if (driverObj) driverObj.moveNext();
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
              showButtons: [],
              onNextClick: () => {}
            }
          },
          {
            element: '#music-control-btn',
            popover: {
              title: t('tutorial.gameSessionSequence.step6.title'),
              description: t('tutorial.gameSessionSequence.step6.description'),
              side: 'left',
              align: 'start',
              showButtons: [],
              onNextClick: () => {}
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
              showButtons: [],
              onNextClick: () => {}
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
              showButtons: [],
              onNextClick: () => {}
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
              showButtons: [],
              onNextClick: () => {}
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
              showButtons: [],
              onNextClick: () => {}
            }
          },
          {
            element: '#stop-btn',
            popover: {
              title: t('tutorial.gameSessionSequence.step14.title'),
              description: t('tutorial.gameSessionSequence.step14.description'),
              side: 'top',
              align: 'start',
              showButtons: [],
              onNextClick: () => {}
            }
          },

          {
            popover: {
              title: t('tutorial.gameSessionSequence.step16.title'),
              description: t('tutorial.gameSessionSequence.step16.description'),
              side: 'bottom',
              align: 'start',
              onNextClick: async () => {
                driverObj.destroy();
                tutorialGameId.value = null;
                isTutorialActive.value = false;
              }
            }
          }
        ]
      });
      driverObj.drive();
    }, 1000);
  };

  const exitTutorial = async () => {
    isTutorialActive.value = false;
    if (driverObj) {
      driverObj.destroy();
      driverObj = null;
    }
    router.push('/');
  };
  const advanceTutorialStep = () => {
    if (driverObj && isTutorialActive.value) {
      driverObj.moveNext();
    }
  };

  return {
    startTutorial,
    resumeHomeSequence,
    exitTutorial,
    playSetupSequence,
    playPlaylistsSequence,
    playPlaylistEditorSequence,
    playCreateGameSequence,
    playInitBlindTestSequence,
    playGameSessionSequence,
    isTutorialActive,
    tutorialGameId,
    advanceToSuggestions,
    advanceToCertification,
    advanceToTrackAdded,
    advanceToTrackSelected,
    advanceToMusicLaunched,
    advanceTutorialStep,
    advanceToPlayerMenu,
    advanceToPlayerActions
  };
}
