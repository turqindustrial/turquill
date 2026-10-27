// First of all: saved keys from before the rename (questbound.*) move to their new names before anything reads them.
import './storageMigration';
import { registerRootComponent } from 'expo';

import App from './App';
import {initializeWebLayout} from './webLayout';
import {initializeWebTheme} from './webTheme';
import {initializeAudio} from './audio';
import {initializeFullscreen} from './fullscreen';
import {initializeTooltips} from './tooltips';
initializeWebLayout();
initializeWebTheme();
initializeAudio();
initializeFullscreen();
initializeTooltips();

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
