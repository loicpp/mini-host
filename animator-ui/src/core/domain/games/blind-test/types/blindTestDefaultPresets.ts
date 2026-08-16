import { GameSettings } from '../../../models/Game';

export interface BlindTestPreset extends GameSettings {
  name: string;
  icon?: string;
  titleKey: string;
  descKey: string;
  blockDuration: number;
  musicDuration: number;
  duration: number;
  allowSuggestions: boolean;
  penaltyOnWrongAnswer: boolean;
  blockPlayerOnWrongAnswer: boolean;
}

export const normalPreset: BlindTestPreset = {
  name: 'normal',
  icon: 'Clock',
  titleKey: 'create_game.quick_mode_normal',
  descKey: 'create_game.normal_desc',
  blockDuration: 0,
  musicDuration: 15,
  duration: 15,
  allowSuggestions: true,
  penaltyOnWrongAnswer: false,
  blockPlayerOnWrongAnswer: true
};

export const hardPreset: BlindTestPreset = {
  name: 'hard',
  icon: 'Zap',
  titleKey: 'create_game.quick_mode_hard',
  descKey: 'create_game.hard_desc',
  blockDuration: 0,
  musicDuration: 5,
  duration: 10,
  allowSuggestions: false,
  penaltyOnWrongAnswer: true,
  blockPlayerOnWrongAnswer: true
};

export const funPreset: BlindTestPreset = {
  name: 'fun',
  icon: 'Smile',
  titleKey: 'create_game.quick_mode_fun',
  descKey: 'create_game.fun_desc',
  blockDuration: 0,
  musicDuration: 30,
  duration: 30,
  allowSuggestions: true,
  penaltyOnWrongAnswer: false,
  blockPlayerOnWrongAnswer: true
};

export const peacefulPreset: BlindTestPreset = {
  name: 'peaceful',
  icon: 'Leaf',
  titleKey: 'create_game.quick_mode_peaceful',
  descKey: 'create_game.peaceful_desc',
  blockDuration: 10,
  musicDuration: 30,
  duration: 30,
  allowSuggestions: true,
  penaltyOnWrongAnswer: false,
  blockPlayerOnWrongAnswer: false
};

export const DEFAULT_PRESETS = [normalPreset, hardPreset, funPreset, peacefulPreset];
