'use strict';

import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { getPointerWatcher } from 'resource:///org/gnome/shell/ui/pointerWatcher.js';

import { Field } from './const.js';
import { BaseEffect, MagnificationEffect, FindMouseEffect, SpotlightEffect, LaserPointerEffect, TrailEffect, ArrowGuideEffect } from './effect.js';
import History from './history.js';

const initSettings = (settings, entries) => {
    const getValue = (name, type) => ({
        'b': () => settings.get_boolean(name),
        'd': () => settings.get_double(name),
        'i': () => settings.get_int(name),
        's': () => settings.get_string(name),
    }[type]());
    entries.forEach(([name, type, func]) => {
        func(getValue(name, type));
        settings.connect(`changed::${name}`, () => func(getValue(name, type)));
    });
};

export default class WiggleExtension extends Extension {
    _onCheckIntervalChange(interval) {
        if (this._checkTimeoutId) {
            GLib.Source.remove(this._checkTimeoutId);
        }
        this._checkTimeoutId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, interval, () => {
            if (this._checkCursorHiddenByProgram()) {
                return GLib.SOURCE_CONTINUE;
            }

            const isMotionTrigger = this._settings.get_string(Field.TRIGGER) === 'motion';

            if (isMotionTrigger) {
                if (this._history.check()) {
                    if (!this._effect.isWiggling) {
                        this._effect.move(this._history.lastCoords.x, this._history.lastCoords.y);
                        this._effect.activate();
                    }
                } else if (this._effect.isWiggling) {
                    this._effect.deactivate();
                }
            }

            return GLib.SOURCE_CONTINUE;
        });
    }

    _onKeyPress(actor, event) {
        const triggerKey = this._settings.get_string(Field.T_KEY);
        // Note: In a real GNOME extension, we'd check the actual key symbol from the event.
        // For this implementation, we assume the setting matches the logic needed.
        // This is a simplified placeholder for the keypress detection logic.
        if (this._settings.get_string(Field.TRIGGER) === 'keypress') {
            // Simplified: trigger if any key is pressed that isn't handled elsewhere,
            // or specifically check against triggerKey.
            if (!this._effect.isWiggling) {
                const x = global.display.get_pointer().get_position().x;
                const y = global.display.get_pointer().get_position().y;
                this._effect.move(x, y);
                this._effect.activate();
            } else {
                this._effect.deactivate();
            }
        }
    }

    _checkCursorHiddenByProgram() {
        // different program might take other methods to hide the cursor, so this check should contain more conditions
        if (!this._effect.cursor.sprite) {
            if (!this._isHiddenByProgram) {
                this._togglePointerWatcher(false);
                this._isHiddenByProgram = true;
            }
            return true;
        } else if (this._isHiddenByProgram) {
            this._togglePointerWatcher(true);
            this._isHiddenByProgram = false;
        }
        return false;
    }

    _onDrawIntervalChange(interval) {
        this._drawInterval = interval;
        if (this._drawIntervalWatch) {
            this._pointerWatcher._removeWatch(this._drawIntervalWatch);
        }
        this._drawIntervalWatch = this._pointerWatcher.addWatch(interval, (x, y) => {
            this._history.push(x, y);
            if (this._effect.isWiggling) {
                this._effect.move(x, y);
            }
        });
    }

    _togglePointerWatcher(state) {
        if (state) {
            if (!this._drawIntervalWatch) {
                this._onDrawIntervalChange(this._drawInterval);
            }
        } else {
            if (this._effect.isWiggling) {
                this._effect.deactivate();
            }
            if (this._drawIntervalWatch) {
                this._pointerWatcher._removeWatch(this._drawIntervalWatch);
                this._drawIntervalWatch = null;
                this._history.clear();
            }
        }
    }

    _reapplySettings() {
        const settings = this._settings;
        const effect = this._effect;
        
        // Reapply all effect-related settings
        if (effect instanceof MagnificationEffect) {
            effect.cursorSize = settings.get_int(Field.SIZE);
            effect.cursorPath = settings.get_string(Field.PATH);
            effect.magnifyDuration = settings.get_int(Field.MAGN);
            effect.unmagnifyDuration = settings.get_int(Field.UMGN);
            effect.unmagnifyDelay = settings.get_int(Field.DLAY);
        } else if (effect instanceof FindMouseEffect) {
            effect.haloColor = settings.get_string(Field.HALO_COLOR);
            effect.haloRadius = settings.get_int(Field.HALO_RADIUS);
            effect.haloOpacity = settings.get_double(Field.HALO_OPACITY);
        } else if (effect instanceof SpotlightEffect) {
            effect.spotlightColor = settings.get_string(Field.SPOTLIGHT_COLOR);
            effect.spotlightSize = settings.get_int(Field.SPOTLIGHT_SIZE);
            effect.spotlightOpacity = settings.get_double(Field.SPOTLIGHT_OPACITY);
        } else if (effect instanceof LaserPointerEffect) {
            effect.laserColor = settings.get_string(Field.LASER_COLOR);
            effect.laserThickness = settings.get_int(Field.LASER_THICKNESS);
            effect.laserLength = settings.get_int(Field.LASER_LENGTH);
        } else if (effect instanceof TrailEffect) {
            effect.trailColor = settings.get_string(Field.TRAIL_COLOR);
            effect.trailLength = settings.get_int(Field.TRAIL_LENGTH);
            effect.fadeDuration = settings.get_int(Field.TRAIL_FADE);
        } else if (effect instanceof ArrowGuideEffect) {
            effect.arrowColor = settings.get_string(Field.ARROW_COLOR);
            effect.arrowSize = settings.get_int(Field.ARROW_SIZE);
        }
    }

    enable() {
        this._pointerWatcher = getPointerWatcher();
        this._history = new History();
        
        this._settings = this.getSettings();
        const mode = this._settings.get_string(Field.MODE);
        this._effect =
            mode === 'find-mouse' ? new FindMouseEffect() :
            mode === 'spotlight' ? new SpotlightEffect() :
            mode === 'laser-pointer' ? new LaserPointerEffect() :
            mode === 'trail' ? new TrailEffect() :
            mode === 'arrow-guide' ? new ArrowGuideEffect() :
            new MagnificationEffect();
        
        this._reapplySettings();

        // Handle keypress trigger if configured
        if (this._settings.get_string(Field.TRIGGER) === 'keypress') {
            // In a real implementation, we would use global.display.get_default_seat().connect('key-pressed', ...)
            // For now, we'll just prepare the structure.
        }

        initSettings(this._settings, [
            [Field.HIDE, 'b', (r) => {this._effect.isHidden = r}],
            [Field.SIZE, 'i', (r) => { if (this._effect instanceof MagnificationEffect) this._effect.cursorSize = r }],
            [Field.PATH, 's', (r) => { if (this._effect instanceof MagnificationEffect) this._effect.cursorPath = r }],
            [Field.MAGN, 'i', (r) => { if (this._effect instanceof MagnificationEffect) this._effect.magnifyDuration = r }],
            [Field.UMGN, 'i', (r) => { if (this._effect instanceof MagnificationEffect) this._effect.unmagnifyDuration = r }],
            [Field.DLAY, 'i', (r) => { if (this._effect instanceof MagnificationEffect) this._effect.unmagnifyDelay = r }],

            [Field.SAMP, 'i', (r) => {this._history.sampleSize = r}],
            [Field.RADI, 'i', (r) => {this._history.radiansThreshold = r}],
            [Field.DIST, 'i', (r) => {this._history.distanceThreshold = r}],
            [Field.CHCK, 'i', (r) => this._onCheckIntervalChange(r)],
            [Field.DRAW, 'i', (r) => this._onDrawIntervalChange(r)],

            // New settings
        [Field.MODE, 's', (r) => {
            this._effect.destroy();
            this._effect =
                r === 'find-mouse' ? new FindMouseEffect() :
                r === 'spotlight' ? new SpotlightEffect() :
                r === 'laser-pointer' ? new LaserPointerEffect() :
                r === 'trail' ? new TrailEffect() :
                r === 'arrow-guide' ? new ArrowGuideEffect() :
                new MagnificationEffect();
            // Reapply all current settings to the new effect
            this._reapplySettings();
        }],
            [Field.TRIGGER, 's', (r) => {
                // Logic to switch between motion and keypress monitoring
            }],
            [Field.T_KEY, 's', (r) => {}],
            [Field.HALO_COLOR, 's', (r) => { if(this._effect instanceof FindMouseEffect) { this._effect.haloColor = r; if (this._effect._halo) { this._effect._halo.set_style(`background-color: ${r}; opacity: ${this._effect.haloOpacity}; border-radius: 100%;`); } } }],
            [Field.HALO_RADIUS, 'i', (r) => { if(this._effect instanceof FindMouseEffect) { this._effect.haloRadius = r; if (this._effect._halo) { this._effect._halo.set_size(r*2, r*2); } } }],
            [Field.HALO_OPACITY, 'd', (r) => { if(this._effect instanceof FindMouseEffect) { this._effect.haloOpacity = r; if (this._effect._halo) { this._effect._halo.set_style(`background-color: ${this._effect.haloColor}; opacity: ${r}; border-radius: 100%;`); } } }],

            // Spotlight Effect Settings
            [Field.SPOTLIGHT_COLOR, 's', (r) => { if(this._effect instanceof SpotlightEffect) this._effect.spotlightColor = r; }],
            [Field.SPOTLIGHT_SIZE, 'i', (r) => { if(this._effect instanceof SpotlightEffect) this._effect.spotlightSize = r; }],
            [Field.SPOTLIGHT_OPACITY, 'd', (r) => { if(this._effect instanceof SpotlightEffect) this._effect.spotlightOpacity = r; }],

            // Laser Pointer Settings
            [Field.LASER_COLOR, 's', (r) => { if(this._effect instanceof LaserPointerEffect) this._effect.laserColor = r; }],
            [Field.LASER_THICKNESS, 'i', (r) => { if(this._effect instanceof LaserPointerEffect) this._effect.laserThickness = r; }],
            [Field.LASER_LENGTH, 'i', (r) => { if(this._effect instanceof LaserPointerEffect) this._effect.laserLength = r; }],

            // Trail Effect Settings
            [Field.TRAIL_COLOR, 's', (r) => { if(this._effect instanceof TrailEffect) this._effect.trailColor = r; }],
            [Field.TRAIL_LENGTH, 'i', (r) => { if(this._effect instanceof TrailEffect) this._effect.trailLength = r; }],
            [Field.TRAIL_FADE, 'i', (r) => { if(this._effect instanceof TrailEffect) this._effect.fadeDuration = r; }],

            // Arrow Guide Settings
            [Field.ARROW_COLOR, 's', (r) => { if(this._effect instanceof ArrowGuideEffect) this._effect.arrowColor = r; }],
            [Field.ARROW_SIZE, 'i', (r) => { if(this._effect instanceof ArrowGuideEffect) this._effect.arrowSize = r; }],
        ]);
    }

    disable() {
        if (this._checkTimeoutId) {
            GLib.Source.remove(this._checkTimeoutId);
        }
        this._togglePointerWatcher(false);
        this._effect.destroy();
        this._effect = null;
        this._pointerWatcher = null;
        this._history = null;
        this._settings = null;
    }
}
