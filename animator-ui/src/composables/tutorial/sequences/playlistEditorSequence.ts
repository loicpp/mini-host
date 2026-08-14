import { driver } from 'driver.js';
import i18n from '../../../i18n';
import { tutorialState, isTutorialActive } from '../state';
import { goBackToSequence } from '../utils';
import { playPlaylistsSequence } from './playlistsSequence';
import { globalPlaylists } from '../../usePlaylists';

const { t } = i18n.global;

import router from '../../../router';

export const playPlaylistEditorSequence = (startIndex: number = 1) => {
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
          element: '#track-name-input',
          popover: {
            title: t('tutorial.playlistEditorSequence.step1.title'),
            description: t('tutorial.playlistEditorSequence.step1.description'),
            side: 'bottom',
            align: 'start',
            showButtons: ['next', 'previous'],
            onPopoverRender: () => {
              setTimeout(() => {
                const input = document.querySelector('#track-search-input') as HTMLInputElement;
                if (input) {
                  input.focus();
                  input.setSelectionRange(input.value.length, input.value.length);
                }
              }, 300);
              
              const interval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 1) {
                  clearInterval(interval);
                  return;
                }
                if (document.querySelector('#track-suggestions-list li')) {
                  clearInterval(interval);
                  tutorialState.driverObj.moveNext();
                }
              }, 500);
            },
            onPrevClick: () => {
              const backBtn = document.querySelector('#btn-playlist-back') as HTMLButtonElement;
              if (backBtn) backBtn.click();
              goBackToSequence('/playlists', () => playPlaylistsSequence(6));
            },
            onNextClick: () => {
              const input = document.querySelector('#track-search-input') as HTMLInputElement;
              if (input) {
                if (!input.value.trim()) {
                  input.value = "Beat It - Michael Jackson";
                }
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('focus', { bubbles: true }));
              }
            }
          }
        },
        {
          element: '#track-suggestions-list',
          popover: {
            title: t('tutorial.playlistEditorSequence.step2.title'),
            description: t('tutorial.playlistEditorSequence.step2.description'),
            side: 'bottom',
            align: 'start',
            showButtons: ['next', 'previous'],
            onPopoverRender: () => {
              const interval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 2) {
                  clearInterval(interval);
                  return;
                }
                const input = document.querySelector('#track-search-input') as HTMLInputElement;
                if (input && input.value) {
                  tutorialState.savedSearchQuery = input.value;
                }
                if (document.querySelector('#track-certification')) {
                  clearInterval(interval);
                  tutorialState.driverObj.moveNext();
                }
              }, 500);
            },
            onPrevClick: () => {
              const input = document.querySelector('#track-search-input') as HTMLInputElement;
              if (input) {
                input.value = "";
                input.dispatchEvent(new Event('input', { bubbles: true }));
              }
              if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
            },
            onNextClick: () => {
              const firstItem = document.querySelector('#track-suggestions-list li') as HTMLElement;
              if (firstItem) {
                firstItem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
              }
            }
          }
        },
        {
          element: '#track-certification',
          popover: {
            title: t('tutorial.playlistEditorSequence.step3.title'),
            description: t('tutorial.playlistEditorSequence.step3.description'),
            side: 'bottom',
            align: 'start',
            showButtons: ['next', 'previous'],
            onPrevClick: () => {
              const clearBtn = document.querySelector('#track-name-input button.text-red-400') as HTMLButtonElement;
              if (clearBtn) clearBtn.click();
              
              setTimeout(() => {
                const input = document.querySelector('#track-search-input') as HTMLInputElement;
                if (input && tutorialState.savedSearchQuery) {
                  input.value = tutorialState.savedSearchQuery;
                  input.dispatchEvent(new Event('input', { bubbles: true }));
                  input.dispatchEvent(new Event('focus', { bubbles: true }));
                  
                  const interval = setInterval(() => {
                    if (document.querySelector('#track-suggestions-list li')) {
                      clearInterval(interval);
                      if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
                    }
                  }, 100);
                  setTimeout(() => clearInterval(interval), 5000);
                } else {
                  if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
                }
              }, 100);
            }
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
            showButtons: ['next', 'previous'],
            onPopoverRender: () => {
              const lastPlaylist = globalPlaylists.value[globalPlaylists.value.length - 1];
              const initialCount = lastPlaylist ? lastPlaylist.tracks.length : 0;
              const interval = setInterval(() => {
                if (!isTutorialActive.value || tutorialState.driverObj?.getActiveIndex() !== 5) {
                  clearInterval(interval);
                  return;
                }
                
                const titleEl = document.querySelector('#track-name-input strong span.truncate');
                const artistEl = document.querySelector('#track-name-input span.text-sm.truncate');
                const isCert = !!document.querySelector('#track-certification .text-blue-500');
                const urlEl = document.querySelector('#soundcloud-track-url') as HTMLInputElement;
                
                if (titleEl && urlEl) {
                  tutorialState.savedTrackInfo = {
                    title: titleEl.textContent || '',
                    artist: artistEl ? artistEl.textContent || '' : '',
                    url: urlEl.value || '',
                    isCertified: isCert
                  };
                }
                
                const currentPlaylist = globalPlaylists.value[globalPlaylists.value.length - 1];
                if (currentPlaylist && currentPlaylist.tracks.length > initialCount) {
                  clearInterval(interval);
                  tutorialState.driverObj.moveNext();
                }
              }, 500);
            },
            onNextClick: () => {
              const btn = document.querySelector('#soundcloud-add-track-btn') as HTMLButtonElement;
              if (btn) btn.click();
            }
          }
        },
        {
          element: '#tracks-list',
          popover: {
            title: t('tutorial.playlistEditorSequence.step6.title'),
            description: t('tutorial.playlistEditorSequence.step6.description'),
            side: 'top',
            align: 'start',
            onPrevClick: async () => {
              // UNDO Track addition
              try {
                const lastPlaylist = globalPlaylists.value[globalPlaylists.value.length - 1];
                if (lastPlaylist && lastPlaylist.tracks && lastPlaylist.tracks.length > 0) {
                  lastPlaylist.tracks.pop();
                  await fetch('http://127.0.0.1:5000/api/playlists', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(globalPlaylists.value)
                  });
                }
              } catch (error) {
                console.error('Error undoing track addition:', error);
              }
              
              if (tutorialState.savedTrackInfo) {
                const info = tutorialState.savedTrackInfo;
                const searchInput = document.querySelector('#track-search-input') as HTMLInputElement;
                if (searchInput) {
                  searchInput.value = info.artist ? `${info.title} - ${info.artist}` : info.title;
                  searchInput.dispatchEvent(new Event('input', { bubbles: true }));
                  searchInput.dispatchEvent(new Event('change', { bubbles: true }));
                  
                  if (info.isCertified) {
                    let retries = 0;
                    const pollSuggestions = setInterval(() => {
                      const firstItem = document.querySelector('#track-suggestions-list li');
                      if (firstItem) {
                        clearInterval(pollSuggestions);
                        firstItem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
                        
                        let urlRetries = 0;
                        const pollUrl = setInterval(() => {
                          const urlInput = document.querySelector('#soundcloud-track-url') as HTMLInputElement;
                          if (urlInput) {
                            clearInterval(pollUrl);
                            urlInput.value = info.url;
                            urlInput.dispatchEvent(new Event('input', { bubbles: true }));
                            urlInput.dispatchEvent(new Event('change', { bubbles: true }));
                            setTimeout(() => {
                              if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
                            }, 100);
                          } else if (++urlRetries > 40) {
                            clearInterval(pollUrl);
                            if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
                          }
                        }, 100);
                      } else if (++retries > 40) {
                        clearInterval(pollSuggestions);
                        // Fallback to non-certified if API fails
                        searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
                        setTimeout(() => { if (tutorialState.driverObj) tutorialState.driverObj.movePrevious(); }, 150);
                      }
                    }, 100);
                  } else {
                    setTimeout(() => {
                      searchInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', keyCode: 13, bubbles: true }));
                      let urlRetries = 0;
                      const pollUrl = setInterval(() => {
                        const urlInput = document.querySelector('#soundcloud-track-url') as HTMLInputElement;
                        if (urlInput) {
                          clearInterval(pollUrl);
                          urlInput.value = info.url;
                          urlInput.dispatchEvent(new Event('input', { bubbles: true }));
                          urlInput.dispatchEvent(new Event('change', { bubbles: true }));
                          setTimeout(() => {
                            if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
                          }, 100);
                        } else if (++urlRetries > 40) {
                          clearInterval(pollUrl);
                          if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
                        }
                      }, 100);
                    }, 50);
                  }
                } else {
                  setTimeout(() => { if (tutorialState.driverObj) tutorialState.driverObj.movePrevious(); }, 150);
                }
              } else {
                setTimeout(() => {
                  if (tutorialState.driverObj) tutorialState.driverObj.movePrevious();
                }, 150);
              }
            }
          }
        },
        {
          popover: {
            title: t('tutorial.playlistEditorSequence.step7.title'),
            description: t('tutorial.playlistEditorSequence.step7.description'),
            side: 'bottom',
            align: 'start',
            onNextClick: () => {
              if (tutorialState.driverObj) tutorialState.driverObj.destroy();
              if (router) router.push('/');
              tutorialState.playlistCreated = true;
              import('./homeSequence').then(m => m.resumeHomeSequence(1));
            }
          }
        }
      ]
    });
    tutorialState.driverObj.drive(startIndex);
  }, 500);
};
