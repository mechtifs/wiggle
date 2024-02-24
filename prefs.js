'use strict';

import {
    ExtensionPreferences,
    gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'
import { AppearancePage } from './preferences/appearance.js'
import { BehaviorPage } from './preferences/behavior.js'


export default class WigglePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window.set_title(_("Wiggle"));
        const _settings = this.getSettings();
        const _appearancePage = new AppearancePage(_settings);
        const _behaviorPage = new BehaviorPage(_settings);

        window.add(_appearancePage);
        window.add(_behaviorPage);
    }
}
