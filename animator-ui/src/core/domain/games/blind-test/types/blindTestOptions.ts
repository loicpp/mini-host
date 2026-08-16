import { Lightbulb, AlertTriangle, Ban, Timer } from '@lucide/vue';

export interface BlindTestOption {
  key: string;
  icon: any;
  titleKey: string;
  shortTitleKey: string;
  descKey: string;
  requiredMode: string | null;
  fallbackValue: boolean;
  sidebarBadgeClass: string;
  projectorIconClass: string;
}

export const allowSuggestionsOption: BlindTestOption = {
  key: 'allowSuggestions',
  icon: Lightbulb,
  titleKey: 'create_game.allow_suggestions',
  shortTitleKey: 'create_game.allow_suggestions_short',
  descKey: 'create_game.allow_suggestions_desc',
  requiredMode: 'text',
  fallbackValue: false,
  sidebarBadgeClass: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  projectorIconClass: 'text-emerald-400'
};

export const penaltyOnWrongAnswerOption: BlindTestOption = {
  key: 'penaltyOnWrongAnswer',
  icon: AlertTriangle,
  titleKey: 'create_game.auto_correction_penalty',
  shortTitleKey: 'create_game.auto_correction_penalty_short',
  descKey: 'create_game.auto_correction_penalty_desc',
  requiredMode: null,
  fallbackValue: false,
  sidebarBadgeClass: 'text-red-600 bg-red-50 border-red-100',
  projectorIconClass: 'text-red-500'
};

export const blockPlayerOnWrongAnswerOption: BlindTestOption = {
  key: 'blockPlayerOnWrongAnswer',
  icon: Ban,
  titleKey: 'create_game.block_player_wrong_answer',
  shortTitleKey: 'create_game.block_player_wrong_answer_short',
  descKey: 'create_game.block_player_wrong_answer_desc',
  requiredMode: 'buzzer',
  fallbackValue: true,
  sidebarBadgeClass: 'text-orange-500 bg-orange-50 border-orange-100',
  projectorIconClass: 'text-orange-400'
};

export const speedPointsOption: BlindTestOption = {
  key: 'speedPoints',
  icon: Timer,
  titleKey: 'create_game.speed_points',
  shortTitleKey: 'create_game.speed_points_short',
  descKey: 'create_game.speed_points_desc',
  requiredMode: 'text',
  fallbackValue: false,
  sidebarBadgeClass: 'text-amber-500 bg-amber-50 border-amber-100',
  projectorIconClass: 'text-amber-400'
};

export const BLIND_TEST_ADDITIONAL_OPTIONS = [
  allowSuggestionsOption,
  penaltyOnWrongAnswerOption,
  blockPlayerOnWrongAnswerOption,
  speedPointsOption
];

export const getExpectedValue = (optionKey: string, presetValue: any, currentMode: string) => {
  const opt = BLIND_TEST_ADDITIONAL_OPTIONS.find(o => o.key === optionKey);
  if (opt && opt.requiredMode && currentMode !== opt.requiredMode) {
    return opt.fallbackValue;
  }
  return presetValue;
};
