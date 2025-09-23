'use strict';

import Clutter from 'gi://Clutter';
import * as Config from 'resource:///org/gnome/shell/misc/config.js';
import Meta from 'gi://Meta';

export default class Cursor {
    constructor() {
        if (Config.PACKAGE_VERSION < 48) {
            this._tracker = Meta.CursorTracker.get_for_display(global.display);
        } else {
            this._tracker = global.backend.get_cursor_tracker();
        }
    }

    get hot() {
        return this._tracker.get_hot();
    }

    get sprite() {
        return this._tracker.get_sprite();
    }

    controlCursorVisibility(showCursor) {
        if (Config.PACKAGE_VERSION < 49) {
            this._tracker.set_pointer_visible(showCursor);
        } else if (showCursor) {
            this._tracker.uninhibit_cursor_visibility();
        } else {
            this._tracker.inhibit_cursor_visibility();
        }
    }

    show() {
        const seat = Clutter.get_default_backend().get_default_seat();

        if (seat.is_unfocus_inhibited()) {
            seat.uninhibit_unfocus();
        }

        this._tracker.disconnectObject(this);
        this.controlCursorVisibility(true);
    }

    hide() {
        const seat = Clutter.get_default_backend().get_default_seat();

        if (!seat.is_unfocus_inhibited()) {
            seat.inhibit_unfocus();
        }

        this.controlCursorVisibility(false);
        this._tracker.disconnectObject(this);
        this._tracker.connectObject(
            'visibility-changed', () => {
                if (this._tracker.get_pointer_visible()) {
                    this.controlCursorVisibility(false);
                }
            },
            this
        );
    }
}
