'use strict';

export default class Cursor {
    constructor() {
        this._tracker = global.backend.get_cursor_tracker();
        this._isHidden = false;
    }

    get hot() {
        return this._tracker.get_hot();
    }

    get sprite() {
        return this._tracker.get_sprite();
    }

    show() {
        if (this._isHidden) {
            this._tracker.uninhibit_cursor_visibility();
            this._isHidden = false;
        }
    }

    hide() {
        if (!this._isHidden) {
            this._tracker.inhibit_cursor_visibility();
            this._isHidden = true;
        }
    }
}