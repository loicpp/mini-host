import { driver } from 'driver.js';
import i18n from '../../../i18n';
import { tutorialState, isTutorialActive } from '../state';
import { addSkipBtnWithCallback } from '../utils';

const { t } = i18n.global;
const dummyStep = { popover: { title: 'dummy', description: '' }, element: 'body' };

export const playHomeSequence = async (startIndex: number = 0) => {
  if (!isTutorialActive.value) return;

  let hasPlaylistsWithTracks = false;
  try {
    const res = await fetch('http://127.0.0.1:5000/api/playlists');
    if (res.ok) {
      const data = await res.json();
      let loadedPlaylists = [];
      if (Array.isArray(data)) {
        loadedPlaylists = data;
      } else if (data.playlists) {
        loadedPlaylists = data.playlists;
      }
      hasPlaylistsWithTracks = loadedPlaylists.some((pl: any) => pl.tracks && pl.tracks.length > 0);
    }
  } catch(e) {
    console.warn("Could not load playlists for tutorial skip check", e);
  }

  try {
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
          {
            popover: {
              description: t('tutorial.homeSequence.step1.description'),
              side: 'bottom',
              align: 'start',
              showButtons: ['next'],
              onPopoverRender: (popover) => {
                if (hasPlaylistsWithTracks) {
                  addSkipBtnWithCallback(popover, () => {
                    tutorialState.playlistCreated = true;
                    resumeHomeSequence(1);
                  });
                }
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
              showButtons: ['next', 'previous'],
              onNextClick: () => {
                const btn = document.querySelector('#btn-setup') as HTMLButtonElement;
                if (btn) btn.click();
              },
              onPopoverRender: () => {
                const checkInterval = setInterval(() => {
                  if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 6) {
                    clearInterval(checkInterval); return;
                  }
                  if (document.querySelector('#setup-type-selector')) {
                    clearInterval(checkInterval);
                    if (tutorialState.driverObj) tutorialState.driverObj.destroy();
                    setTimeout(() => import('./setupSequence').then(m => m.playSetupSequence(1)), 200);
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
  } catch (e) {
    console.error(e);
  }
};

export const resumeHomeSequence = (startIndex: number = 1) => {
  if (!isTutorialActive.value) return;
  if (!tutorialState.playlistCreated) return;
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
        if (tutorialState.driverObj && tutorialState.driverObj.getActiveIndex() > 1) {
          tutorialState.driverObj.movePrevious();
        }
      },
      steps: [
        dummyStep,
        {
          element: '#btn-create-game',
          popover: {
            title: t('tutorial.homeSequence.step3.title'),
            description: t('tutorial.resumeHomeSequence.step1.description'),
            side: 'left',
            align: 'start',
            showButtons: ['next'],
            onNextClick: () => {
              const btn = document.querySelector('#btn-create-game') as HTMLButtonElement;
              if (btn) btn.click();
            },
            onPopoverRender: () => {
              const checkInterval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 1) {
                  clearInterval(checkInterval); return;
                }
                if (document.querySelector('#game-type-selector')) {
                  clearInterval(checkInterval);
                  if (tutorialState.driverObj) tutorialState.driverObj.destroy();
                  setTimeout(() => import('./createGameSequence').then(m => m.playCreateGameSequence(0)), 200);
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
