'use strict';

import {
    ExtensionPreferences,
    gettext,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'

import * as UI from './ui.js'
import { Field } from './const.js'


export default class WigglePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window.set_title(gettext("Wiggle"));
        const _settings = this.getSettings();

        const _appearancePage = new UI.PrefPage('Appearance', 'org.gnome.Settings-appearance', [
            new UI.PrefGroup('Cursor Icon', 'Configure the appearance of the cursor icon.', [
                [Field.SIZE, UI.nSpin('Cursor Size', 'Configure the size of the cursor.', 24, 256, 1)],
                [Field.PATH, UI.nEntry('Cursor Icon Path')]
            ]),
            new UI.PrefGroup('Cursor Effect', 'Configure the appearance of the cursor effect.', [
                [Field.MAGN, UI.nSpin('Magnify Duration', 'Configure the duration (ms) of the magnify animation.', 0, 10000, 1)],
                [Field.UMGN, UI.nSpin('Unmagnify Duration', 'Configure the duration (ms) of the unmagify animation.', 0, 10000, 1)],
                [Field.DLAY, UI.nSpin('Unmagnify Delay', 'Configure the delay (ms) before the unmagnify animation is played.', 0, 10000, 1)]
            ])
        ]);

        const _behaviorPage = new UI.PrefPage('Behavior', 'org.gnome.Settings-mouse', [
            new UI.PrefGroup('Trigger Parameters', 'Configure the parameters to trigger the animation.', [
                [Field.SAMP, UI.nSpin('Sample Size', 'Configure the sample size of the cursor track.', 0, 1024, 1)],
                [Field.DIST, UI.nSpin('Distance Threshold', 'Configure the distance threshold to trigger the animation.', 0, 1920, 1)],
                [Field.RADI, UI.nSpin('Radians Threshold', 'Configure the angle threshold to trigger the animation.', 0, 512, 1)]
            ]),
            new UI.PrefGroup('Timer Intervals', 'Configure the intervals of the timers.', [
                [Field.CHCK, UI.nSpin('Check Interval', 'Configure the interval of checking if Wiggle should trigger the animation.', 0, 1000, 1)],
                [Field.DRAW, UI.nSpin('Draw/Sample Interval', 'Configure the interval of drawing the cursor and sampling the cursor track. You may need to adjust trigger parameters as well.', 0, 1000, 1)]
            ])
        ]);

        _appearancePage.bind(_settings);
        _behaviorPage.bind(_settings);

        window.add(_appearancePage);
        window.add(_behaviorPage);
    }
}
