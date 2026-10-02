import { Platform, ViewStyle } from 'react-native';

/** App-wide color palette. Import from here instead of hard-coding hex values. */
export const colors = {
  peach: '#FFB6A3', // primary accent
  rose: '#E07A5F', // strong accent (active states, icons)
  peachSoft: 'rgba(255, 182, 163, 0.25)', // tinted backgrounds
  cream: '#FDFBF7', // screen background
  white: '#FFFFFF', // cards & surfaces
  text: '#2C252D', // primary text (deep plum/charcoal)
  muted: '#8C828A', // secondary text
};

/** Soft drop shadow for cards; iOS uses shadow*, Android uses elevation. */
export const cardShadow: ViewStyle = Platform.select({
  ios: {
    shadowColor: '#2C252D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
  },
  default: { elevation: 4, shadowColor: '#2C252D' },
}) as ViewStyle;
