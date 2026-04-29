// Test-specific version of effect.js without gi:// imports
// This file is used only for running tests in Node.js environment

export class BaseEffect {
    constructor() {
        this.isHidden = true;
        this.isWiggling = false;
        this.cursor = new global.Cursor();
        [this._hotX, this._hotY] = this.cursor.hot;
    }

    move(x, y) {
        // To be implemented by subclasses
        throw new Error('move() must be implemented by subclass');
    }

    activate() {
        // To be implemented by subclasses
        throw new Error('activate() must be implemented by subclass');
    }

    deactivate() {
        // To be implemented by subclasses
        throw new Error('deactivate() must be implemented by subclass');
    }

    destroy() {
        // Cleanup if necessary
    }
}

export class MagnificationEffect extends BaseEffect {
    constructor() {
        super();
        this.magnifyDuration = 250;
        this.unmagnifyDuration = 150;
        this.unmagnifyDelay = 0;
        this._spriteSize = this.cursor.sprite ? this.cursor.sprite.get_width() : 24;
        this._ratio = 1; // Default ratio

        this._pivot = global.Graphene.Point({
            x: this._hotX / this._spriteSize,
            y: this._hotY / this._spriteSize,
        });
    }

    set cursorSize(size) {
        this.icon_size = size;
        this._ratio = size / this._spriteSize;
    }

    set cursorPath(path) {
        this.gicon = global.Gio.new_for_string(path || global.GLib.path_get_dirname(import.meta.url.slice(7)) + '/icons/cursor.svg');
    }

    move(x, y) {
        this.set_position(x - this._hotX * this._ratio, y - this._hotY * this._ratio);
    }

    activate() {
        this.isWiggling = true;
        global.Main.uiGroup.add_child(this);
        if (this.isHidden) {
            this.cursor.hide();
        }
        this.remove_all_transitions();
        this.ease({
            duration: this.magnifyDuration,
            transition: global.Clutter.AnimationMode.EASE_IN_QUAD,
            scale_x: 1.0,
            scale_y: 1.0,
            pivot_point: this._pivot,
        });
    }

    deactivate() {
        if (this._isInTransition) {
            return;
        }
        this._isInTransition = true;
        this._unmagnifyDelayId = global.GLib.timeout_add(global.GLib.PRIORITY_DEFAULT, this.unmagnifyDelay, () => {
            this.remove_all_transitions();
            this.ease({
                duration: this.unmagnifyDuration,
                mode: global.Clutter.AnimationMode.EASE_OUT_QUAD,
                scale_x: 1.0 / this._ratio,
                scale_y: 1.0 / this._ratio,
                pivot_point: this._pivot,
                onComplete: () => {
                    global.Main.uiGroup.remove_child(this);
                    if (this.isHidden) {
                        this.cursor.show();
                    }
                    this.isWiggling = false;
                    this._isInTransition = false;
                },
            });
            this._unmagnifyDelayId = null;
            return global.GLib.SOURCE_REMOVE;
        });
    }

    destroy() {
        if (this._unmagnifyDelayId) {
            global.GLib.Source.remove(this._unmagnifyDelayId);
        }
    }
}

export class FindMouseEffect extends BaseEffect {
    constructor() {
        super();
        this.haloColor = '#ffffff';
        this.haloRadius = 50;
        this.haloOpacity = 0.5;

        // Create the halo using a circular shape
        this._halo = new global.St.Widget({
            width: this.haloRadius * 2,
            height: this.haloRadius * 2,
            style: `background-color: ${this.haloColor}; opacity: ${this.haloOpacity}; border-radius: 100%;`
        });
    }

    move(x, y) {
        // Center the halo on the cursor hot spot
        this.set_position(x - this._hotX, y - this._hotY);
    }

    activate() {
        this.isWiggling = true;
        global.Main.uiGroup.add_child(this);
        if (this.isHidden) {
            this.cursor.hide();
        }
    }

    deactivate() {
        if (this.isHidden) {
            this.cursor.show();
        }
        global.Main.uiGroup.remove_child(this);
        this.isWiggling = false;
    }
}