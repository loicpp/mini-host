import { tutorialState } from './state';
import i18n from '../../i18n';

const { t } = i18n.global;

export const moveToNextStep = (selector: string) => {
  const el = document.querySelector(selector) as HTMLElement;
  if (el) {
    el.addEventListener('click', () => {
      if (tutorialState.driverObj) {
        tutorialState.driverObj.moveNext();
      }
    }, { once: true });
  }
};

export const addSkipBtnWithCallback = (popover: any, callback: () => void) => {
  const wrapper = popover.wrapper as HTMLElement;
  if (wrapper) {
    const navBtns = wrapper.querySelector('.driver-popover-navigation-btns');
    if (navBtns && !wrapper.querySelector('.btn-skip')) {
      const skipBtn = document.createElement('button');
      skipBtn.className = 'driver-popover-footer-btn btn-skip';
      skipBtn.innerText = t('tutorial.buttons.skip');
      skipBtn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        callback();
      };
      navBtns.insertBefore(skipBtn, navBtns.firstChild);
    }
  }
};

export const goBackToSequence = (router: any, routePath: string, callback?: Function) => {
  if (tutorialState.driverObj) {
    tutorialState.driverObj.destroy();
  }
  
  const isSameRoute = router && router.currentRoute && router.currentRoute.value.path === routePath;

  if (callback) {
    tutorialState.nextSequenceOverride = callback;
  }
  
  if (router && !isSameRoute) {
    router.push(routePath);
  } else if (isSameRoute) {
    if (tutorialState.nextSequenceOverride) {
      const override = tutorialState.nextSequenceOverride;
      tutorialState.nextSequenceOverride = undefined;
      override();
    }
  }
};
