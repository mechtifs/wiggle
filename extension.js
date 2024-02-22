'use strict';

import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { getPointerWatcher } from 'resource:///org/gnome/shell/ui/pointerWatcher.js';

import History from './history.js';
import Effect from './effect.js';

const CHECK_INTERVAL = 200;
const DRAW_INTERVAL = 8;


export default class WiggleExtension extends Extension {
    enable() {
        this._intervals = [];
        this._pointerListener;
        this._pointerWatcher = getPointerWatcher();
        this._history = new History();
        this._effect = new Effect();

        this._pointerListener = this._pointerWatcher.addWatch(DRAW_INTERVAL, (x, y) => {
            this._history.push(x, y);
            if (this._effect.isWiggling) {
                this._effect.move(x, y);
            }
        });
        this._intervals.push(GLib.timeout_add(GLib.PRIORITY_DEFAULT, CHECK_INTERVAL, () => {
            if (this._history.check()) {
                if (!this._effect.isWiggling) {
                    this._effect.move(this._history.lastCoords.x, this._history.lastCoords.y);
                    this._effect.magnify();
                }
            } else if (this._effect.isWiggling) {
                this._effect.unmagnify();
            }
            return true;
        }));
    }

    disable() {
        if (this._pointerListener) {
            this._pointerWatcher._removeWatch(this._pointerListener);
        }
        this._intervals.map(i => GLib.source_remove(i));
        delete this._intervals;
        delete this._effect;
        delete this._pointerListener;
        delete this._pointerWatcher;
        delete this._history;
    }
}
