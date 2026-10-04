import { registerRootComponent } from 'expo';
import { I18nManager } from 'react-native';

import App from './App';

// The app flips layouts itself (see useI18n().dir), so turn off the system auto-flip.
// Otherwise on an Arabic phone the layout is flipped twice and comes out wrong.
I18nManager.allowRTL(false);
I18nManager.forceRTL(false);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);