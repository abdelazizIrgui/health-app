import type { ComponentProps } from 'react';
import type { MaterialCommunityIcons } from '@expo/vector-icons';

type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

export type LogKind = 'flow' | 'symptoms' | 'mood';

/** Everything she can log for one day. Saved per date ("YYYY-MM-DD"). */
export interface DayLog {
  flow?: string; // one id from FLOW_OPTIONS
  symptoms?: string[]; // ids from SYMPTOM_OPTIONS
  mood?: string; // one id from MOOD_OPTIONS
}

export interface LogOption {
  id: string;
  labelKey: string;
  icon: IconName;
}

export const FLOW_OPTIONS: LogOption[] = [
  { id: 'spotting', labelKey: 'log.flow.spotting', icon: 'water-outline' },
  { id: 'light', labelKey: 'log.flow.light', icon: 'water' },
  { id: 'medium', labelKey: 'log.flow.medium', icon: 'water-plus' },
  { id: 'heavy', labelKey: 'log.flow.heavy', icon: 'water-alert' },
];

export const SYMPTOM_OPTIONS: LogOption[] = [
  { id: 'cramps', labelKey: 'log.symptom.cramps', icon: 'lightning-bolt' },
  { id: 'headache', labelKey: 'log.symptom.headache', icon: 'head-alert-outline' },
  { id: 'bloating', labelKey: 'log.symptom.bloating', icon: 'stomach' },
  { id: 'backache', labelKey: 'log.symptom.backache', icon: 'human-handsdown' },
  { id: 'breasts', labelKey: 'log.symptom.breasts', icon: 'heart-flash' },
  { id: 'acne', labelKey: 'log.symptom.acne', icon: 'face-woman-shimmer-outline' },
  { id: 'fatigue', labelKey: 'log.symptom.fatigue', icon: 'sleep' },
  { id: 'nausea', labelKey: 'log.symptom.nausea', icon: 'emoticon-sick-outline' },
];

export const MOOD_OPTIONS: LogOption[] = [
  { id: 'happy', labelKey: 'log.mood.happy', icon: 'emoticon-happy-outline' },
  { id: 'calm', labelKey: 'log.mood.calm', icon: 'emoticon-cool-outline' },
  { id: 'energetic', labelKey: 'log.mood.energetic', icon: 'lightning-bolt-circle' },
  { id: 'sad', labelKey: 'log.mood.sad', icon: 'emoticon-sad-outline' },
  { id: 'anxious', labelKey: 'log.mood.anxious', icon: 'emoticon-confused-outline' },
  { id: 'irritable', labelKey: 'log.mood.irritable', icon: 'emoticon-angry-outline' },
];