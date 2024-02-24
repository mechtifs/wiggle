'use strict';

import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';


export default class Cursor {
    constructor() {
        this._cursorTracker = Meta.CursorTracker.get_for_display(global.display);
    }

    get hot() {
        return this._cursorTracker.get_hot();
    }

    get sprite() {
        return this._cursorTracker.get_sprite();
    }

    show() {
        const seat = Clutter.get_default_backend().get_default_seat();

        if (seat.is_unfocus_inhibited()) {
            seat.uninhibit_unfocus();
        }

        if (this._cursorVisibilityChangedId) {
            this._cursorTracker.disconnect(this._cursorVisibilityChangedId);
            delete this._cursorVisibilityChangedId;

            this._cursorTracker.set_pointer_visible(true);
        }
    }

    hide() {
        const seat = Clutter.get_default_backend().get_default_seat();

        if (!seat.is_unfocus_inhibited()) {
            seat.inhibit_unfocus();
        }

        if (!this._cursorVisibilityChangedId) {
            this._cursorTracker.set_pointer_visible(false);
            this._cursorVisibilityChangedId = this._cursorTracker.connect('visibility-changed', () => {
                if (this._cursorTracker.get_pointer_visible()) {
                    this._cursorTracker.set_pointer_visible(false);
                }
            });
        }
    }
}
