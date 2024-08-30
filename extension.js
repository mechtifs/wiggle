'use strict';

import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { getPointerWatcher } from 'resource:///org/gnome/shell/ui/pointerWatcher.js';

import { Field } from './const.js';
import Effect from './effect.js';
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
            if (this._history.check()) {
                if (!this._effect.isWiggling) {
                    this._effect.move(this._history.lastCoords.x, this._history.lastCoords.y);
                    this._effect.magnify();
                }
            } else if (this._effect.isWiggling) {
                this._effect.unmagnify();
            }
            return GLib.SOURCE_CONTINUE;
        });
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
                this._effect.unmagnify();
            }
            if (this._drawIntervalWatch) {
                this._pointerWatcher._removeWatch(this._drawIntervalWatch);
                this._drawIntervalWatch = null;
                this._history.clear();
            }
        }
    }

    enable() {
        this._pointerWatcher = getPointerWatcher();
        this._history = new History();
        this._effect = new Effect();
        this._settings = this.getSettings();
        initSettings(this._settings, [
            [Field.HIDE, 'b', (r) => {this._effect.isHidden = r}],
            [Field.SIZE, 'i', (r) => {this._effect.cursorSize = r}],
            [Field.PATH, 's', (r) => {this._effect.cursorPath = r}],
            [Field.MAGN, 'i', (r) => {this._effect.magnifyDuration = r}],
            [Field.UMGN, 'i', (r) => {this._effect.unmagnifyDuration = r}],
            [Field.DLAY, 'i', (r) => {this._effect.unmagnifyDelay = r}],

            [Field.SAMP, 'i', (r) => {this._history.sampleSize = r}],
            [Field.RADI, 'i', (r) => {this._history.radiansThreshold = r}],
            [Field.DIST, 'i', (r) => {this._history.distanceThreshold = r}],
            [Field.CHCK, 'i', (r) => this._onCheckIntervalChange(r)],
            [Field.DRAW, 'i', (r) => this._onDrawIntervalChange(r)],
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
