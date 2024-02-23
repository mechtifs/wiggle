'use strict';

import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { getPointerWatcher } from 'resource:///org/gnome/shell/ui/pointerWatcher.js';

import History from './history.js';
import Effect from './effect.js';


export default class WiggleExtension extends Extension {
    updateCheckSettings() {
        if (this._checkTimer) {
            GLib.source_remove(this._checkTimer);
        }
        this._checkTimer = GLib.timeout_add(GLib.PRIORITY_DEFAULT, this._checkInterval, () => {
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

    updateDrawSettings() {
        if (this._drawTimer) {
            this._pointerWatcher._removeWatch(this._drawTimer);
        }
        this._drawTimer = this._pointerWatcher.addWatch(this._drawInterval, (x, y) => {
            this._history.push(x, y);
            if (this._effect.isWiggling) {
                this._effect.move(x, y);
            }
        });
    }

    enable() {
        this._settings = this.getSettings();
        this._checkTimer;
        this._drawTimer;
        this._pointerWatcher = getPointerWatcher();
        this._history = new History();
        this._effect = new Effect();
        this._effect.cursorSize = this._settings.get_int('cursor-size');
        this._effect.magnifyDuration = this._settings.get_int('magnify-duration');
        this._effect.unmagnifyDuration = this._settings.get_int('unmagnify-duration');
        this._sampleSize = this._settings.get_int('sample-size');
        this._radiansThreshold = this._settings.get_int('radians-threshold');
        this._distanceThreshold = this._settings.get_int('distance-threshold');
        this._checkInterval = this._settings.get_int('check-interval');
        this._drawInterval = this._settings.get_int('draw-interval');

        this._settings.connect('changed::cursor-size', () => {
            this._effect.cursorSize = this._settings.get_int('cursor-size');
        });
        this._settings.connect('changed::magnify-duration', () => {
            this._effect.magnifyDuration = this._settings.get_int('magnify-duration');
        });
        this._settings.connect('changed::unmagnify-duration', () => {
            this._effect.unmagnifyDuration = this._settings.get_int('unmagnify-duration');
        });
        this._settings.connect('changed::sample-size', () => {
            this._sampleSize = this._settings.get_int('sample-size');
        });
        this._settings.connect('changed::radians-threshold', () => {
            this._radiansThreshold = this._settings.get_int('radians-threshold');
        });
        this._settings.connect('changed::distance-threshold', () => {
            this._distanceThreshold = this._settings.get_int('distance-threshold');
        });
        this._settings.connect('changed::check-interval', () => {
            this._checkInterval = this._settings.get_int('check-interval');
            this.updateCheckSettings();
        });
        this._settings.connect('changed::draw-interval', () => {
            this._drawInterval = this._settings.get_int('draw-interval');
            this.updateDrawSettings();
        });

        this.updateCheckSettings();
        this.updateDrawSettings();
    }

    disable() {
        if (this._drawTimer) {
            this._pointerWatcher._removeWatch(this._drawTimer);
        }
        if (this._checkTimer) {
            GLib.source_remove(this._checkTimer);
        }
        delete this._settings;
        delete this._intervals;
        delete this._effect;
        delete this._drawTimer;
        delete this._pointerWatcher;
        delete this._history;
    }
}
