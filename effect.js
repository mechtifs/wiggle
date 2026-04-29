'use strict';

import Clutter from 'gi://Clutter';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import Graphene from 'gi://Graphene';
import St from 'gi://St';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

import Cursor from './cursor.js';

export class BaseEffect extends St.Widget {
    static {
        GObject.registerClass(this);
    }

    constructor() {
        super({
            width: 1,
            height: 1,
            reactive: false,
        });
        this.isHidden = true;
        this.isWiggling = false;
        this.cursor = new Cursor();
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
    static {
        GObject.registerClass(this);
    }

    constructor() {
        super();
        this.magnifyDuration = 250;
        this.unmagnifyDuration = 150;
        this.unmagnifyDelay = 0;
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

    activate() {
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

    deactivate() {
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
            this._unmagnifyDelayId = null;
            return GLib.SOURCE_REMOVE;
        });
    }

    destroy() {
        if (this._unmagnifyDelayId) {
            GLib.Source.remove(this._unmagnifyDelayId);
        }
        if (this.cursor) {
            this.cursor.destroy();
            this.cursor = null;
        }
    }
}

export class FindMouseEffect extends BaseEffect {
    static {
        GObject.registerClass(this);
    }

    constructor() {
        super();
        this.haloColor = '#ffffff';
        this.haloRadius = 50;
        this.haloOpacity = 0.5;

        // Create the halo using a circular shape
        // The actor itself will be the halo
        this._halo = new St.Widget({
            width: this.haloRadius * 2,
            height: this.haloRadius * 2,
            style: `background-color: ${this.haloColor}; opacity: ${this.haloOpacity}; border-radius: 100%;`
        });
        this.add_child(this._halo);
    }

    move(x, y) {
        // Center the halo on the cursor hot spot
        this.set_position(x - this._hotX, y - this._hotY);
    }

    activate() {
        this.isWiggling = true;
        Main.uiGroup.add_child(this);
        if (this.isHidden) {
            this.cursor.hide();
        }
    }

    deactivate() {
        if (this.isHidden) {
            this.cursor.show();
        }
        Main.uiGroup.remove_child(this);
        this.isWiggling = false;
    }
}

export class SpotlightEffect extends BaseEffect {
    static {
        GObject.registerClass(this);
    }

    constructor() {
        super();
        this.spotlightColor = '#ffff00';
        this.spotlightSize = 150;
        this.spotlightOpacity = 0.8;
        
        // Create spotlight actor with gradient effect
        this._spotlightActor = new St.Widget({
            width: this.spotlightSize * 2,
            height: this.spotlightSize * 2,
            style_class: 'spotlight-effect',
            style: `background: radial-gradient(circle, ${this.spotlightColor} ${this.spotlightOpacity}, rgba(0,0,0,0) 70%); border-radius: 50%;`
        });
        this.add_child(this._spotlightActor);
    }

    set spotlightColor(color) {
        this._spotlightColor = color;
        if (this._spotlightActor) {
            this._spotlightActor.set_style(`background: radial-gradient(circle, ${color} ${this.spotlightOpacity}, rgba(0,0,0,0) 70%); border-radius: 50%;`);
        }
    }

    set spotlightSize(size) {
        this._spotlightSize = size;
        if (this._spotlightActor) {
            this._spotlightActor.set_size(size * 2, size * 2);
        }
    }

    set spotlightOpacity(opacity) {
        this._spotlightOpacity = opacity;
        if (this._spotlightActor) {
            this._spotlightActor.set_style(`background: radial-gradient(circle, ${this.spotlightColor} ${opacity}, rgba(0,0,0,0) 70%); border-radius: 50%;`);
        }
    }

    get spotlightColor() {
        return this._spotlightColor;
    }

    get spotlightSize() {
        return this._spotlightSize;
    }

    get spotlightOpacity() {
        return this._spotlightOpacity;
    }

    move(x, y) {
        // Center the spotlight on the cursor hot spot
        this.set_position(x - this._hotX, y - this._hotY);
    }

    activate() {
        this.isWiggling = true;
        Main.uiGroup.add_child(this);
        if (this.isHidden) {
            this.cursor.hide();
        }
    }

    deactivate() {
        if (this.isHidden) {
            this.cursor.show();
        }
        Main.uiGroup.remove_child(this);
        this.isWiggling = false;
    }

    destroy() {
        // Cleanup resources
        if (this._spotlightActor && this.get_parent()) {
            this.remove_child(this._spotlightActor);
        }
    }
}

export class LaserPointerEffect extends BaseEffect {
    static {
        GObject.registerClass(this);
    }

    constructor() {
        super();
        this.laserColor = '#ff0000';
        this.laserThickness = 4;
        this.laserLength = 100;
        this._prevX = null;
        this._prevY = null;
        
        // Create laser line actor
        this._laserActor = new St.Widget({
            width: this.laserLength,
            height: this.laserThickness,
            style_class: 'laser-pointer',
            style: `background-color: ${this.laserColor}; border-radius: 2px;`
        });
        this.add_child(this._laserActor);
    }

    set laserColor(color) {
        this._laserColor = color;
        if (this._laserActor) {
            this._laserActor.set_style(`background-color: ${color}; border-radius: 2px;`);
        }
    }

    set laserThickness(thickness) {
        this._laserThickness = thickness;
        if (this._laserActor) {
            this._laserActor.set_size(this.laserLength, thickness);
        }
    }

    set laserLength(length) {
        this._laserLength = length;
        if (this._laserActor) {
            this._laserActor.set_size(length, this.laserThickness);
        }
    }

    get laserColor() {
        return this._laserColor;
    }

    get laserThickness() {
        return this._laserThickness;
    }

    get laserLength() {
        return this._laserLength;
    }

    move(x, y) {
        if (this._prevX !== null && this._prevY !== null) {
            // Draw line from previous to current position
            // For simplicity, we'll just update the position to show the laser
            // In a real implementation, this would create a line between points
            this.set_position(this._prevX - this._hotX, this._prevY - this._hotY);
        }
        this._prevX = x;
        this._prevY = y;
    }

    activate() {
        this.isWiggling = true;
        Main.uiGroup.add_child(this);
        if (this.isHidden) {
            this.cursor.hide();
        }
    }

    deactivate() {
        if (this.isHidden) {
            this.cursor.show();
        }
        Main.uiGroup.remove_child(this);
        this.isWiggling = false;
        // Clear previous position
        this._prevX = null;
        this._prevY = null;
    }

    destroy() {
        // Cleanup resources
        if (this._laserActor && this.get_parent()) {
            this.remove_child(this._laserActor);
        }
    }
}

export class TrailEffect extends BaseEffect {
    static {
        GObject.registerClass(this);
    }

    constructor() {
        super();
        this.trailColor = '#00ff00';
        this.trailLength = 15;
        this.fadeDuration = 2000;
        // Array to store trail points with timestamps
        this._trailPoints = [];
    }

    set trailColor(color) {
        this._trailColor = color;
    }

    set trailLength(length) {
        this._trailLength = length;
        // Remove excess points if we exceed the new limit
        while (this._trailPoints.length > length) {
            this._trailPoints.shift();
        }
    }

    set fadeDuration(duration) {
        this._fadeDuration = duration;
    }

    get trailColor() {
        return this._trailColor;
    }

    get trailLength() {
        return this._trailLength;
    }

    get fadeDuration() {
        return this._fadeDuration;
    }

    move(x, y) {
        const timestamp = GLib.get_monotonic_time();
        this._trailPoints.push({x, y, timestamp});

        // Remove old points if we exceed the trail length
        while (this._trailPoints.length > this.trailLength) {
            this._trailPoints.shift();
        }
    }

    activate() {
        this.isWiggling = true;
        Main.uiGroup.add_child(this);
        if (this.isHidden) {
            this.cursor.hide();
        }
    }

    deactivate() {
        if (this.isHidden) {
            this.cursor.show();
        }
        Main.uiGroup.remove_child(this);
        this.isWiggling = false;
        // Clear trail
        this._trailPoints = [];
    }

    destroy() {
        // Cleanup resources
        this._trailPoints = null;
    }
}

export class ArrowGuideEffect extends BaseEffect {
    static {
        GObject.registerClass(this);
    }

    constructor() {
        super();
        this.arrowColor = '#00ffff';
        this.arrowSize = 30;
        
        // Create arrow shape using a widget with CSS triangle
        this._arrowActor = new St.Widget({
            width: this.arrowSize * 2,
            height: this.arrowSize * 1.5,
            style_class: 'arrow-guide',
            style: `background-color: ${this.arrowColor}; clip-path: polygon(0% 50%, 100% 0%, 100% 100%);`
        });
        this.add_child(this._arrowActor);
    }

    set arrowColor(color) {
        this._arrowColor = color;
        if (this._arrowActor) {
            this._arrowActor.set_style(`background-color: ${color}; clip-path: polygon(0% 50%, 100% 0%, 100% 100%);`);
        }
    }

    set arrowSize(size) {
        this._arrowSize = size;
        if (this._arrowActor) {
            this._arrowActor.set_size(size * 2, size * 1.5);
        }
    }

    get arrowColor() {
        return this._arrowColor;
    }

    get arrowSize() {
        return this._arrowSize;
    }

    move(x, y) {
        // Position arrow near cursor with offset for better visibility
        // Arrow points toward the cursor from a distance
        this.set_position(x - this._hotX - this.arrowSize * 1.5,
                         y - this._hotY - this.arrowSize);
    }

    activate() {
        this.isWiggling = true;
        Main.uiGroup.add_child(this);
        if (this.isHidden) {
            this.cursor.hide();
        }
    }

    deactivate() {
        if (this.isHidden) {
            this.cursor.show();
        }
        Main.uiGroup.remove_child(this);
        this.isWiggling = false;
    }

    destroy() {
        // Cleanup resources
        if (this._arrowActor && this.get_parent()) {
            this.remove_child(this._arrowActor);
        }
    }
}
