'use strict';

import Clutter from 'gi://Clutter';
import Meta from 'gi://Meta';

export default class Cursor {
    constructor() {
        this._tracker = Meta.CursorTracker.get_for_display(global.display);
    }

    get hot() {
        return this._tracker.get_hot();
    }

    get sprite() {
        return this._tracker.get_sprite();
    }

    show() {
        const seat = Clutter.get_default_backend().get_default_seat();

        if (seat.is_unfocus_inhibited()) {
            seat.uninhibit_unfocus();
        }

        this._tracker.disconnectObject(this);
        this._tracker.set_pointer_visible(true);
    }

    hide() {
        const seat = Clutter.get_default_backend().get_default_seat();

        if (!seat.is_unfocus_inhibited()) {
            seat.inhibit_unfocus();
        }

        this._tracker.set_pointer_visible(false);
        this._tracker.disconnectObject(this);
        this._tracker.connectObject(
            'visibility-changed', () => {
                if (this._tracker.get_pointer_visible()) {
                    this._tracker.set_pointer_visible(false);
                }
            },
            this
        );
    }
}
