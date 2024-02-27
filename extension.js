'use strict';

import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { getPointerWatcher } from 'resource:///org/gnome/shell/ui/pointerWatcher.js';

import History from './history.js';
import Effect from './effect.js';


export default class WiggleExtension extends Extension {
    _setCheckInterval(interval) {
        if (this._checkTimer) {
            GLib.source_remove(this._checkTimer);
        }
        this._checkTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, interval, () => {
            if (this._history.check()) {
                if (!this._effect.isWiggling) {
                    this._effect.move(this._history.lastCoords.x, this._history.lastCoords.y);
                    this._effect.magnify();
                }
            } else if (this._effect.isWiggling) {
                this._effect.unmagnify();
            }
            return true;
        });
    }

    _setDrawInterval(interval) {
        if (this._drawTimer) {
            this._pointerWatcher._removeWatch(this._drawTimer);
        }
        this._drawTimer = this._pointerWatcher.addWatch(interval, (x, y) => {
            this._history.push(x, y);
            if (this._effect.isWiggling) {
                this._effect.move(x, y);
            }
        });
    }

    _initSettings() {
        const entries = [
            ['cursor-size', 'i', (r) => this._effect.cursorSize = r],
            ['magnify-duration', 'i', (r) => this._effect.magnifyDuration = r],
            ['unmagnify-duration', 'i', (r) => this._effect.unmagnifyDuration = r],
            ['sample-size', 'i', (r) => this._history.sampleSize = r],
            ['radians-threshold', 'i', (r) => this._history.radiansThreshold = r],
            ['distance-threshold', 'i', (r) => this._history.distanceThreshold = r],
            ['check-interval', 'i', (r) => this._setCheckInterval(r)],
            ['draw-interval', 'i', (r) => this._setDrawInterval(r)],
        ]
        const getPrefValue = (name, type) => {
            switch (type) {
                case 'i':
                    return this._settings.get_int(name);
                case 'b':
                    return this._settings.get_boolean(name);
                case 's':
                    return this._settings.get_string(name);
                case 'd':
                    return this._settings.get_double(name);
                default:
                    throw new Error(`Unknown type: ${type}`);
            }
        }
        this._settings = this.getSettings();
        entries.forEach(([name, type, func]) => {
            func(getPrefValue(name, type));
            this._settings.connect(`changed::${name}`, () => {
                func(getPrefValue(name, type));
            });
        });
    }

    enable() {
        this._pointerWatcher = getPointerWatcher();
        this._history = new History();
        this._effect = new Effect();
        this._initSettings();
    }

    disable() {
        if (this._drawTimer) {
            this._pointerWatcher._removeWatch(this._drawTimer);
        }
        if (this._checkTimer) {
            GLib.source_remove(this._checkTimer);
        }
        delete this._settings;
        delete this._effect;
        delete this._drawTimer;
        delete this._pointerWatcher;
        delete this._history;
    }
}
