'use strict';

import GLib from 'gi://GLib';
import { Extension } from 'resource:///org/gnome/shell/extensions/extension.js';
import { getPointerWatcher } from 'resource:///org/gnome/shell/ui/pointerWatcher.js';

import History from './history.js';
import Effect from './effect.js';

const CHECK_INTERVAL = 200;
const DRAW_INTERVAL = 10;


export default class WiggleExtension extends Extension {
    enable() {
        this.intervals = [];
        this.wiggling = false;
        this.pointerListener;
        this.pointerWatcher = getPointerWatcher();
        this.history = new History();
        let effect = new Effect();

        this.pointerListener = this.pointerWatcher.addWatch(DRAW_INTERVAL, (x, y) => {
            this.history.push(x, y);
            effect.move(x, y);
        });
        this.intervals.push(GLib.timeout_add(GLib.PRIORITY_DEFAULT, CHECK_INTERVAL, () => {
            if (this.history.check()) {
                if (!this.wiggling) {
                    this.wiggling = true;
                    effect.magnify();
                }
            } else if (this.wiggling) {
                this.wiggling = false;
                effect.unmagnify();
            }
            effect.move(this.history.lastX, this.history.lastY);
            return true;
        }));
    }

    disable() {
        this.wiggling = false;
        if (this.pointerListener) {
            this.pointerWatcher._removeWatch(this.pointerListener);
        }
        this.intervals.map(i => GLib.source_remove(i));
        this.intervals = [];
        delete this.pointerListener;
        delete this.pointerWatcher;
        delete this.history;
    }
}
