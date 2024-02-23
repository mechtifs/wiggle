'use strict';

import {
    ExtensionPreferences,
    gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'
import { ApperancePage } from './preferences/apperance.js'
import { BehaviorPage } from './preferences/behavior.js'


export default class WigglePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window.set_title(_("Wiggle"));
        const _settings = this.getSettings();
        const _apperancePage = new ApperancePage(_settings);
        const _behaviorPage = new BehaviorPage(_settings);

        window.add(_apperancePage);
        window.add(_behaviorPage);
    }
}
