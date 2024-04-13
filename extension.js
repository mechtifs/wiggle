'use strict';

import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { getPointerWatcher } from 'resource:///org/gnome/shell/ui/pointerWatcher.js';

import History from './history.js';
import Effect from './effect.js';
import Cursor from './cursor.js';
import { initSettings } from './utils.js';
import { Field } from './const.js';


export default class WiggleExtension extends Extension {
    _onCheckIntervalChange(interval) {
        if (this._checkIntervalId) {
            GLib.source_remove(this._checkIntervalId);
        }
        this._checkIntervalId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, interval, () => {
            if (!this._cursor.sprite) {
                if (!this._isPaused) {
                    if (this._effect.isWiggling) {
                        this._effect.unmagnify();
                    }
                    this._removePointerWatch();
                    this._isPaused = true;
                }
                return true;
            }
            if (this._isPaused) {
                this._onDrawIntervalChange(this._drawInterval);
                this._isPaused = false;
            }
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

    _onDrawIntervalChange(interval) {
        this._drawInterval = interval
        if (this._drawIntervalId) {
            this._pointerWatcher._removeWatch(this._drawIntervalId);
        }
        this._drawIntervalId = this._pointerWatcher.addWatch(interval, (x, y) => {
            this._history.push(x, y);
            if (this._effect.isWiggling) {
                this._effect.move(x, y);
            }
        });
    }

    _removePointerWatch() {
        if (this._drawIntervalId) {
            this._pointerWatcher._removeWatch(this._drawIntervalId);
            this._drawIntervalId = null;
        }
    }

    enable() {
        this._pointerWatcher = getPointerWatcher();
        this._history = new History();
        this._cursor = new Cursor();
        this._effect = new Effect(this._cursor);
        this._settings = this.getSettings();
        initSettings(this._settings, [
            [Field.SIZE, 'i', (r) => this._effect.cursorSize = r],
            [Field.PATH, 's', (r) => this._effect.cursorPath = r],
            [Field.MAGN, 'i', (r) => this._effect.magnifyDuration = r],
            [Field.UMGN, 'i', (r) => this._effect.unmagnifyDuration = r],

            [Field.SAMP, 'i', (r) => this._history.sampleSize = r],
            [Field.RADI, 'i', (r) => this._history.radiansThreshold = r],
            [Field.DIST, 'i', (r) => this._history.distanceThreshold = r],
            [Field.CHCK, 'i', (r) => this._onCheckIntervalChange(r)],
            [Field.DRAW, 'i', (r) => this._onDrawIntervalChange(r)],
        ]);
    }

    disable() {
        if (this._checkIntervalId) {
            GLib.source_remove(this._checkIntervalId);
        }
        this._removePointerWatch();
        this._pointerWatcher = null;
        this._cursor = null;
        this._effect = null;
        this._history = null;
        this._settings = null;
    }
}
