import { driver } from 'driver.js';
import i18n from '../../../i18n';
import { tutorialState, isTutorialActive } from '../state';
import { goBackToSequence } from '../utils';
import { playHomeSequence } from './homeSequence';

const { t } = i18n.global;

export const playSetupSequence = (router?: any, startIndex: number = 1) => {
  if (!isTutorialActive.value) return;
  if (tutorialState.nextSequenceOverride) {
    const override = tutorialState.nextSequenceOverride;
    tutorialState.nextSequenceOverride = undefined;
    override();
    return;
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
      steps: [
        { popover: { title: 'dummy', description: '' }, element: 'body' },
        {
          element: '#setup-type-selector',
          popover: {
            title: t('tutorial.setupSequence.step1.title'),
            description: t('tutorial.setupSequence.step1.description'),
            side: 'top',
            align: 'start',
            showButtons: ['next', 'previous'],
            onPrevClick: () => {
              goBackToSequence(router, '/', () => playHomeSequence(6));
            },
            onNextClick: () => {
              if (router) router.push('/playlists');
            }
          }
        },
        { popover: { title: 'dummy', description: '' }, element: 'body' }
      ]
    });
    tutorialState.driverObj.drive(startIndex);
  }, 500);
};
