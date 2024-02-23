'use strict';

import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import St from 'gi://St';
import Clutter from 'gi://Clutter';
import GLib from 'gi://GLib';
import Graphene from 'gi://Graphene';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import Cursor from './cursor.js';


export default class Effect extends St.Icon {
    static {
        GObject.registerClass(this);
    }

    constructor() {
        super();
        this.magnifyDuration = 250;
        this.unmagnifyDuration = 150;
        this.isWiggling = false;
        this._cursor = new Cursor();
        [this._hotX, this._hotY] = this._cursor.getHot();
        this.gicon = Gio.Icon.new_for_string(GLib.path_get_dirname(import.meta.url.slice(7))+'/icons/cursor.png');
        this._sprite = this._cursor.getSprite();
        this._spriteSize = this._sprite.get_width();
        this._pivot = new Graphene.Point({
            x: this._hotX / this._spriteSize,
            y: this._hotY / this._spriteSize,
        });
    }

    set cursorSize(size) {
        this.icon_size = size;
        this._ratio = size / this._spriteSize;
    }

    move(x, y) {
        this.set_position(
            x - this._hotX * this._ratio,
            y - this._hotY * this._ratio
        );
    }

    magnify() {
        this.isWiggling = true;
        Main.uiGroup.add_actor(this);
        this._cursor.hide();
        this.remove_all_transitions();
        this.ease({
            duration: this.magnifyDuration,
            transition: Clutter.AnimationMode.EASE_IN_QUAD,
            scale_x: 1.0,
            scale_y: 1.0,
            pivot_point: this._pivot,
        })
    }

    unmagnify() {
        this.remove_all_transitions();
        this.ease({
            duration: this.unmagnifyDuration,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            scale_x: 1.0 / this._ratio,
            scale_y: 1.0 / this._ratio,
            pivot_point: this._pivot,
            onComplete: () => {
                Main.uiGroup.remove_actor(this);
                this._cursor.show();
                this.isWiggling = false;
            }
        });
    }
}
