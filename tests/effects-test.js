// Test-specific versions of the new effect classes
// This file is used only for running tests in Node.js environment

export class LaserPointerEffect {
    constructor() {
        this.isHidden = true;
        this.isWiggling = false;
        this.cursor = new global.Cursor();
        [this._hotX, this._hotY] = this.cursor.hot;
        
        this.laserColor = '#ff0000';
        this.laserThickness = 4;
        this.laserLength = 100;
        this._prevX = null;
        this._prevY = null;
        
        // Create laser line actor
        this._laserActor = new global.St.Widget({
            width: this.laserLength,
            height: this.laserThickness,
            style_class: 'laser-pointer',
            style: `background-color: ${this.laserColor}; border-radius: 2px;`
        });
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
            this.set_position(this._prevX - this._hotX, this._prevY - this._hotY);
        }
        this._prevX = x;
        this._prevY = y;
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

    set_position(x, y) {}
    get_content() { return this._laserActor; }
    get_parent() { return null; }
    remove_child(child) {}
}

export class TrailEffect {
    constructor() {
        this.isHidden = true;
        this.isWiggling = false;
        this.cursor = new global.Cursor();
        [this._hotX, this._hotY] = this.cursor.hot;
        
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
        const timestamp = global.GLib.get_monotonic_time();
        this._trailPoints.push({x, y, timestamp});

        // Remove old points if we exceed the trail length
        while (this._trailPoints.length > this.trailLength) {
            this._trailPoints.shift();
        }
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
        // Clear trail
        this._trailPoints = [];
    }

    destroy() {
        // Cleanup resources
        this._trailPoints = null;
    }

    set_position(x, y) {}
    get_content() { return null; }
    get_parent() { return null; }
    remove_child(child) {}
}

export class ArrowGuideEffect {
    constructor() {
        this.isHidden = true;
        this.isWiggling = false;
        this.cursor = new global.Cursor();
        [this._hotX, this._hotY] = this.cursor.hot;
        
        this.arrowColor = '#00ffff';
        this.arrowSize = 30;
        
        // Create arrow shape using a widget with CSS triangle
        this._arrowActor = new global.St.Widget({
            width: this.arrowSize * 2,
            height: this.arrowSize * 1.5,
            style_class: 'arrow-guide',
            style: `background-color: ${this.arrowColor}; clip-path: polygon(0% 50%, 100% 0%, 100% 100%);`
        });
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
        this.set_position(x - this._hotX - this.arrowSize * 1.5,
                         y - this._hotY - this.arrowSize);
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

    destroy() {
        // Cleanup resources
        if (this._arrowActor && this.get_parent()) {
            this.remove_child(this._arrowActor);
        }
    }

    set_position(x, y) {}
    get_content() { return this._arrowActor; }
    get_parent() { return null; }
    remove_child(child) {}
}