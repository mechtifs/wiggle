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
        this.enlargedDuration = 500;
        this.isWiggling = false;
        this.showCursor = false;
        this.gicon = Gio.Icon.new_for_string(GLib.path_get_dirname(import.meta.url.slice(7))+'/icons/cursor.svg');
        this._cursor = new Cursor();
        [this._hotX, this._hotY] = this._cursor.hot;
        this._spriteSize = this._cursor.sprite ? this._cursor.sprite.get_width() : 24;
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
        this.gicon = Gio.Icon.new_for_string(path ? path : GLib.path_get_dirname(import.meta.url.slice(7))+'/icons/cursor.svg');
    }

    move(x, y) {
        this.set_position(
            x - this._hotX * this._ratio,
            y - this._hotY * this._ratio
        );
    }

    magnify() {
        this.isWiggling = true;
        Main.uiGroup.add_child(this);
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

    /*
    * Just a simple sleep function
    */
    async sleep(ms){
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Made this function async so that we can wait for the sleep
    async unmagnify() {
        await this.sleep(this.enlargedDuration);
        this.remove_all_transitions();
        this.ease({
            duration: this.unmagnifyDuration,
            mode: Clutter.AnimationMode.EASE_OUT_QUAD,
            scale_x: 1.0 / this._ratio,
            scale_y: 1.0 / this._ratio,
            pivot_point: this._pivot,
            onComplete: () => {
                Main.uiGroup.remove_child(this);
                this._cursor.show();
                this.isWiggling = false;
            }
        });
    }
}
