'use strict';

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Graphene from 'gi://Graphene';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import Cursor from './cursor.js';

export default class Effect extends St.Icon {
    static {
        GObject.registerClass(this);
    }

    constructor() {
        super();
        this.isHidden = true;
        this.magnifyDuration = 250;
        this.unmagnifyDuration = 150;
        this.unmagnifyDelay = 0;
        this.isWiggling = false;
        this.cursor = new Cursor();
        [this._hotX, this._hotY] = this.cursor.hot;
        this._spriteSize = this.cursor.sprite ? this.cursor.sprite.get_width() : 24;

        this._pivot = new Graphene.Point({
            x: this._hotX / this._spriteSize,
            y: this._hotY / this._spriteSize,
        });
    }

    set cursorSize(size) {
        this.icon_size = size;
        this._ratio = size / this._spriteSize;
    }

    set cursorPath(path) {
        this.gicon = Gio.Icon.new_for_string(path || GLib.path_get_dirname(import.meta.url.slice(7)) + '/icons/cursor.svg');
    }

    move(x, y) {
        this.set_position(x - this._hotX * this._ratio, y - this._hotY * this._ratio);
    }

    magnify() {
        this.isWiggling = true;
        Main.uiGroup.add_child(this);
        if (this.isHidden) {
            this.cursor.hide();
        }
        this.remove_all_transitions();
        this.ease({
            duration: this.magnifyDuration,
            transition: Clutter.AnimationMode.EASE_IN_QUAD,
            scale_x: 1.0,
            scale_y: 1.0,
            pivot_point: this._pivot,
        });
    }

    unmagnify() {
        if (this._isInTransition) {
            return;
        }
        this._isInTransition = true;
        this._unmagnifyDelayId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, this.unmagnifyDelay, () => {
            this.remove_all_transitions();
            this.ease({
                duration: this.unmagnifyDuration,
                mode: Clutter.AnimationMode.EASE_OUT_QUAD,
                scale_x: 1.0 / this._ratio,
                scale_y: 1.0 / this._ratio,
                pivot_point: this._pivot,
                onComplete: () => {
                    Main.uiGroup.remove_child(this);
                    if (this.isHidden) {
                        this.cursor.show();
                    }
                    this.isWiggling = false;
                    this._isInTransition = false;
                },
            });
        });
    }

    destroy() {
        if (this._unmagnifyDelayId) {
            GLib.source_remove(this._unmagnifyDelayId);
        }
    }
}
