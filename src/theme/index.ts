import { Platform, ViewStyle } from 'react-native';

/** App-wide color palette. Import from here instead of hard-coding hex values. */
export const colors = {
  peach: '#FF9EBB', // primary accent (soft pink)
  rose: '#D6336C', // strong accent (active states, icons) - raspberry
  peachSoft: 'rgba(255, 158, 187, 0.22)', // tinted backgrounds
  cream: '#FFF7FA', // screen background
  white: '#FFFFFF', // cards & surfaces
  text: '#2B1E2E', // primary text (deep plum)
  muted: '#7C6B80', // secondary text

  // New (not used yet, ready for the calendar: fertile window / ovulation)
  lilac: '#B8A1F0',
  lilacSoft: 'rgba(184, 161, 240, 0.22)',
};

/** Soft drop shadow for cards; iOS uses shadow*, Android uses elevation. */
export const cardShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#7A2E54',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
  },
  default: { elevation: 4, shadowColor: '#7A2E54' },
}) as ViewStyle;