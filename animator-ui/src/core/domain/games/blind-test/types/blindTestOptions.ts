import { Lightbulb, AlertTriangle } from '@lucide/vue';

export const BLIND_TEST_ADDITIONAL_OPTIONS = [
  {
    key: 'allowSuggestions',
    icon: Lightbulb,
    titleKey: 'create_game.allow_suggestions',
    shortTitleKey: 'create_game.allow_suggestions_short',
    descKey: 'create_game.allow_suggestions_desc',
    requiredMode: 'text',
    fallbackValue: false,
    sidebarBadgeClass: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    projectorIconClass: 'text-[#FFBA49]'
  },
  {
    key: 'penaltyOnWrongAnswer',
    icon: AlertTriangle,
    titleKey: 'create_game.auto_correction_penalty',
    shortTitleKey: 'create_game.auto_correction_penalty_short',
    descKey: 'create_game.auto_correction_penalty_desc',
    requiredMode: null,
    fallbackValue: false,
    sidebarBadgeClass: 'text-rose-700 bg-rose-50 border-rose-100',
    projectorIconClass: 'text-[#ff4d4d]'
  }
];

export const getExpectedValue = (optionKey: string, presetValue: any, currentMode: string) => {
  const opt = BLIND_TEST_ADDITIONAL_OPTIONS.find(o => o.key === optionKey);
  if (opt && opt.requiredMode && currentMode !== opt.requiredMode) {
    return opt.fallbackValue;
  }
  return presetValue;
};
