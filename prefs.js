'use strict';

import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';
import { ExtensionPreferences, gettext } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

import { Field } from './const.js';

const _ = (text) => (text === null ? null : gettext(text));

const nEntry = (title) => new Adw.EntryRow({
    title: _(title),
});

const nSpin = (title, subtitle, lower, upper, step_increment) => new Adw.SpinRow({
    title: _(title),
    subtitle: _(subtitle),
    numeric: true,
    adjustment: new Gtk.Adjustment({ lower, upper, step_increment }),
});

const nSwitch = (title, subtitle) => new Adw.SwitchRow({
    title: _(title),
    subtitle: _(subtitle),
});

const nCombo = (title, subtitle, options) => {
    const model = new Gtk.StringList();
    options.forEach(opt => model.append(opt));
    const row = new Adw.ComboRow({
        title: _(title),
        subtitle: _(subtitle),
        model,
    });
    row._options = options;
    return row;
};

class PrefGroup extends Adw.PreferencesGroup {
    static {
        GObject.registerClass(this);
    }

    constructor(title, description, rows, visible) {
        super({
            title: _(title),
            description: _(description),
            visible: visible !== false,
        });
        this._rows = rows;
    }

    bind(settings) {
        this._rows.forEach(([key, obj]) => {
            this.add(obj);
            if (obj.constructor.name === 'Adw_ComboRow') {
                const options = obj._options;
                const current = settings.get_string(key);
                obj.selected = options.indexOf(current);
                obj.connect('notify::selected', () => {
                    settings.set_string(key, options[obj.selected]);
                });
            } else {
                let prop = {
                    Adw_EntryRow: 'text',
                    Adw_SpinRow: 'value',
                    Adw_SwitchRow: 'active',
                }[obj.constructor.name];
                settings.bind(key, obj, prop, Gio.SettingsBindFlags.DEFAULT);
            }
        });
    }
}

class PrefPage extends Adw.PreferencesPage {
    static {
        GObject.registerClass(this);
    }

    constructor(title, icon_name, groups) {
        super({
            title: _(title),
            icon_name,
        });
        this._groups = groups;
        this._groups.forEach((group) => {
            this.add(group);
        });
    }

    bind(settings) {
        this._groups.forEach((group) => {
            group.bind(settings);
        });
        // Connect to mode changes to show/hide effect-specific settings
        settings.connect('changed::effect-mode', () => {
            const mode = settings.get_string('effect-mode');
            this._updateVisibility(mode);
        });
        // Set initial visibility
        this._updateVisibility(settings.get_string('effect-mode'));
    }

    _updateVisibility(mode) {
        this._groups.forEach((group) => {
            const title = group.title;
            if (title === 'Magnification Settings') {
                group.visible = (mode === 'magnification');
            } else if (title === 'Halo Settings') {
                group.visible = (mode === 'find-mouse');
            } else if (title === 'Spotlight Settings') {
                group.visible = (mode === 'spotlight');
            } else if (title === 'Laser Pointer Settings') {
                group.visible = (mode === 'laser-pointer');
            } else if (title === 'Trail Settings') {
                group.visible = (mode === 'trail');
            } else if (title === 'Arrow Guide Settings') {
                group.visible = (mode === 'arrow-guide');
            }
        });
    }
}

export default class WigglePreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window.set_title(gettext('Wiggle'));
        const _settings = this.getSettings();

        const _appearancePage = new PrefPage('Appearance', 'org.gnome.Settings-appearance', [
            new PrefGroup('Cursor Icon', 'Configure the appearance of the cursor icon.', [
                [Field.HIDE, nSwitch('Hide Original Cursor', 'Hide the original cursor when magnified.')],
            ]),
        ]);

        const _behaviorPage = new PrefPage('Behavior', 'org.gnome.Settings-mouse', [
            new PrefGroup('Trigger Parameters', 'Configure the parameters to trigger the animation.', [
                [Field.SAMP, nSpin('Sample Size', 'Configure the sample size of the cursor track.', 0, 1024, 1)],
                [Field.DIST, nSpin('Distance Threshold', 'Configure the distance threshold to trigger the animation.', 0, 1920, 1)],
                [Field.RADI, nSpin('Radians Threshold', 'Configure the angle threshold to trigger the animation.', 0, 512, 1)],
            ]),
            new PrefGroup('Timer Intervals', 'Configure the intervals of the timers.', [
                [Field.CHCK, nSpin('Check Interval', 'Configure the interval of checking if Wiggle should trigger the animation.', 0, 1000, 1)],
                [Field.DRAW, nSpin('Draw/Sample Interval', 'Configure the interval of drawing the cursor and sampling the cursor track. You may need to adjust trigger parameters as well.', 0, 1000, 1)],
            ]),
        ]);

        const _effectPage = new PrefPage('Effect Mode', 'org.gnome.Settings-power', [
            new PrefGroup('Mode Settings', 'Choose between different cursor highlighting modes.', [
                [Field.MODE, nCombo('Effect Mode', 'Select the type of effect to use when triggered.', ['magnification', 'find-mouse', 'spotlight', 'laser-pointer', 'trail', 'arrow-guide'])],
            ]),
            new PrefGroup('Trigger Settings', 'Configure how the effect is activated.', [
                [Field.TRIGGER, nCombo('Trigger Type', 'Choose whether motion or keypress activates the effect.', ['motion', 'keypress'])],
                [Field.T_KEY, nEntry('Trigger Key', 'Specify the key to press (e.g., "Control" for Ctrl).')],
            ]),
            new PrefGroup('Magnification Settings', 'Configure the magnification effect.', [
                [Field.SIZE, nSpin('Cursor Size', 'Configure the size of the cursor.', 24, 256, 1)],
                [Field.PATH, nEntry('Cursor Icon Path')],
                [Field.MAGN, nSpin('Magnify Duration', 'Configure the duration (ms) of the magnify animation.', 0, 10000, 1)],
                [Field.UMGN, nSpin('Unmagnify Duration', 'Configure the duration (ms) of the unmagify animation.', 0, 10000, 1)],
                [Field.DLAY, nSpin('Unmagnify Delay', 'Configure the delay (ms) before the unmagnify animation is played.', 0, 10000, 1)],
            ]),
            new PrefGroup('Halo Settings', 'Configure the appearance of the Find My Mouse halo.', [
                [Field.HALO_COLOR, nEntry('Halo Color', 'Color of the highlight (hex format, e.g., #ffffff).')],
                [Field.HALO_RADIUS, nSpin('Halo Radius', 'Size of the highlight area in pixels.', 10, 256, 1)],
                [Field.HALO_OPACITY, nSpin('Halo Opacity', 'Transparency level (0.0 to 1.0).', 0.0, 1.0, 0.05)],
            ]),
            new PrefGroup('Spotlight Settings', 'Configure the appearance of the spotlight effect.', [
                [Field.SPOTLIGHT_COLOR, nEntry('Spotlight Color', 'Color of the spotlight (hex format, e.g., #ffff00).')],
                [Field.SPOTLIGHT_SIZE, nSpin('Spotlight Size', 'Radius of the spotlight in pixels.', 50, 300, 5)],
                [Field.SPOTLIGHT_OPACITY, nSpin('Spotlight Opacity', 'Transparency level (0.0 to 1.0).', 0.0, 1.0, 0.05)],
            ]),
            new PrefGroup('Laser Pointer Settings', 'Configure the appearance of the laser pointer.', [
                [Field.LASER_COLOR, nEntry('Laser Color', 'Color of the laser (hex format, e.g., #ff0000).')],
                [Field.LASER_THICKNESS, nSpin('Laser Thickness', 'Thickness of the laser line in pixels.', 1, 20, 1)],
                [Field.LASER_LENGTH, nSpin('Laser Length', 'Length of the laser line in pixels.', 50, 500, 10)],
            ]),
            new PrefGroup('Trail Settings', 'Configure the cursor trail effect.', [
                [Field.TRAIL_COLOR, nEntry('Trail Color', 'Color of the trail (hex format, e.g., #00ff00).')],
                [Field.TRAIL_LENGTH, nSpin('Trail Length', 'Number of trail points to keep.', 5, 50, 1)],
                [Field.TRAIL_FADE, nSpin('Fade Duration', 'Duration for trail to fade in milliseconds.', 500, 5000, 100)],
            ]),
            new PrefGroup('Arrow Guide Settings', 'Configure the arrow guide appearance.', [
                [Field.ARROW_COLOR, nEntry('Arrow Color', 'Color of the arrow (hex format, e.g., #00ffff).')],
                [Field.ARROW_SIZE, nSpin('Arrow Size', 'Size of the arrow in pixels.', 20, 100, 5)],
            ]),
        ]);

        _appearancePage.bind(_settings);
        _behaviorPage.bind(_settings);
        _effectPage.bind(_settings);

        window.add(_appearancePage);
        window.add(_behaviorPage);
        window.add(_effectPage);
    }
}
