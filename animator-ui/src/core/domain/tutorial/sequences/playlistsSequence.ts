import { driver } from 'driver.js';
import i18n from '../../../../i18n';
import { tutorialState, isTutorialActive } from '../state';
import { goBackToSequence, dummyStep, fixTutorialProgress } from '../utils';
import { playSetupSequence } from './setupSequence';
import { playPlaylistEditorSequence } from './playlistEditorSequence';
import { globalPlaylists } from '../../setup/playlists/usePlaylists';

const { t } = i18n.global;

export const playPlaylistsSequence = (startIndex: number = 1) => {
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
      showProgress: true,
      progressText: t('tutorial.progress', { current: '{{current}}', total: '{{total}}' }),
      steps: [
        dummyStep,
        {
          element: '#input-new-playlist',
          popover: {
            title: t('tutorial.playlistsSequence.step1.title'),
            description: t('tutorial.playlistsSequence.step1.description'),
            side: 'bottom',
            align: 'start',
            showButtons: ['next', 'previous'],
            onPopoverRender: (popover) => {
              fixTutorialProgress(popover, tutorialState.driverObj, 1, 2);
              setTimeout(() => {
                const input = document.querySelector('#input-new-playlist') as HTMLInputElement;
                if (input) {
                  input.focus();
                  input.setSelectionRange(input.value.length, input.value.length);
                }
              }, 300);
              
              const interval = setInterval(() => {
                const currentInput = document.querySelector('#input-new-playlist') as HTMLInputElement;
                if (currentInput && currentInput.value) {
                  tutorialState.savedPlaylistName = currentInput.value;
                }
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 1) {
                  clearInterval(interval);
                }
              }, 100);
            },
            onPrevClick: () => {
              goBackToSequence('/setup', () => playSetupSequence(1));
            },
            onNextClick: () => {
              const input = document.querySelector('#input-new-playlist') as HTMLInputElement;
              if (input && !input.value.trim()) {
                input.value = "Playlist 1";
                input.dispatchEvent(new Event('input', { bubbles: true }));
              }
              if (tutorialState.driverObj) tutorialState.driverObj.moveNext();
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
            showButtons: ['next', 'previous'],
            onPopoverRender: (popover) => {
              fixTutorialProgress(popover, tutorialState.driverObj, 1, 2);
              const interval = setInterval(() => {
                const input = document.querySelector('#input-new-playlist') as HTMLInputElement;
                if (input && input.value) {
                  tutorialState.savedPlaylistName = input.value;
                }
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 3) {
                  clearInterval(interval);
                }
              }, 100);
              
              const btn = document.querySelector('#btn-create-playlist') as HTMLButtonElement;
              if (btn) {
                const clickHandler = () => {
                  btn.removeEventListener('click', clickHandler);
                  if (tutorialState.driverObj) tutorialState.driverObj.moveNext();
                };
                btn.addEventListener('click', clickHandler);
              }
            },
            onNextClick: () => {
              const btn = document.querySelector('#btn-create-playlist') as HTMLButtonElement;
              if (btn) btn.click();
            }
          }
        },
        {
          element: '#btn-generate-playlist',
          disableActiveInteraction: true,
          popover: {
            title: t('tutorial.playlistsSequence.step4.title'),
            description: t('tutorial.playlistsSequence.step4.description'),
            side: 'bottom',
            align: 'start',
            onPrevClick: async () => {
              // UNDO Playlist Creation
              try {
                if (globalPlaylists.value.length > 0) {
                  globalPlaylists.value.pop();
                  await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/playlists`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(globalPlaylists.value)
                  });
                }
              } catch (error) {
                console.error('Error undoing playlist creation:', error);
              }
              const input = document.querySelector('#input-new-playlist') as HTMLInputElement;
              if (input) {
                input.value = tutorialState.savedPlaylistName || "Playlist 1";
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
              
              setTimeout(() => {
                if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
              }, 150);
            }
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
            showButtons: ['next', 'previous'],
            onNextClick: () => {
              const btn = document.querySelector('#div-playlists > div:last-child .btn-edit-playlists') as HTMLButtonElement;
              if (btn) btn.click();
            },
            onPopoverRender: (popover) => {
              fixTutorialProgress(popover, tutorialState.driverObj, 1, 2);
              const checkInterval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 6) {
                  clearInterval(checkInterval); return;
                }
                if (document.querySelector('#track-search-input')) {
                  clearInterval(checkInterval);
                  if (tutorialState.driverObj) tutorialState.driverObj.destroy();
                  setTimeout(() => playPlaylistEditorSequence(1), 200);
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
