import { pathToFileURL } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

// Mock all the GJS modules globally before any imports happen
global.Clutter = {
    AnimationMode: {
        EASE_IN_QUAD: 1,
        EASE_OUT_QUAD: 2
    }
};

global.Gio = class Gio {
    static Icon() { return {}; }
    static new_for_string(path) { return { path }; }
};

global.GLib = class GLib {
    static timeout_add(priority, delay, callback) { return 1; }
    static Source() { 
        return { remove: () => true };
    }
    static get_monotonic_time() { return Date.now(); }
    static path_get_dirname(url) { return '/path/to/dir'; }
};

global.GObject = class GObject {
    static registerClass(cls) { cls._registered = true; return cls; }
};

// Define ActorBase first
const ActorBase = class {
    constructor(props) {
        Object.assign(this, props);
    }
    remove_all_transitions() {}
    ease(props) {
        if (props.onComplete) setTimeout(props.onComplete, props.duration || 0);
        return this;
    }
};

// Then define St class with reference to ActorBase and Widget
class Widget {
    constructor(props) {
        Object.assign(this, props);
        this.add_child = () => {};
    }
}

global.St = class St {
    static Actor() { 
        return class Actor extends ActorBase {};
    }
    
    static Widget = Widget;
};

global.Graphene = class Graphene {
    static Point(coords) { return coords; }
};

global.Main = {
    uiGroup: {
        add_child: () => {},
        remove_child: () => {}
    }
};

// Mock Cursor
class Cursor {
    constructor() {
        this.hot = [0, 0];
        this.sprite = { get_width: () => 24 };
    }
    hide() {}
    show() {}
}

global.Cursor = Cursor;

// Now load the actual test files manually
const { default: chai } = await import('chai');
const { expect } = chai;
global.expect = expect;

global.describe = global.describe || function(name, fn) {
    console.log(`\n${name}`);
    fn();
};

global.it = global.it || function(name, fn) {
    try {
        fn();
        console.log(`  ✓ ${name}`);
    } catch (error) {
        console.log(`  ✖ ${name}`);
        console.log(`    ${error.message}`);
    }
};

// Import and run the test files
const effectModule = await import('./effect-test.js');
const { BaseEffect, MagnificationEffect, FindMouseEffect } = effectModule;

// Import new effects for testing
const newEffectsModule = await import('./effects-test.js');
const { SpotlightEffect, LaserPointerEffect, TrailEffect, ArrowGuideEffect } = newEffectsModule;

// Import History for testing
const historyModule = await import('./history-test.js');
const History = historyModule.default;

// Import new effects for testing
const spotlightModule = await import('./spotlight.test.js');
const laserPointerModule = await import('./laser-pointer.test.js');
const trailModule = await import('./trail.test.js');
const arrowGuideModule = await import('./arrow-guide.test.js');

console.log('\nRunning tests...\n');

// Run the tests manually
describe('BaseEffect', () => {
    it('should be a base class that requires implementation', () => {
        const effect = new BaseEffect();
        expect(() => effect.move(0, 0)).to.throw('move() must be implemented by subclass');
        expect(() => effect.activate()).to.throw('activate() must be implemented by subclass');
        expect(() => effect.deactivate()).to.throw('deactivate() must be implemented by subclass');
    });
});

describe('MagnificationEffect', () => {
    it('should initialize with default values', () => {
        const effect = new MagnificationEffect();
        expect(effect.magnifyDuration).to.equal(250);
        expect(effect.unmagnifyDuration).to.equal(150);
        expect(effect.unmagnifyDelay).to.equal(0);
    });

    it('should set cursor size and path', () => {
        const effect = new MagnificationEffect();
        effect.cursorSize = 96;
        expect(effect.icon_size).to.equal(96);
        
        effect.cursorPath = '/path/to/cursor.svg';
        expect(effect.gicon.path).to.equal('/path/to/cursor.svg');
    });

    it('should move to specified coordinates', () => {
        const effect = new MagnificationEffect();
        // Mock set_position
        let lastX, lastY;
        effect.set_position = (x, y) => { lastX = x; lastY = y; };
        
        effect.move(100, 200);
        expect(lastX).to.be.closeTo(100, 5);
        expect(lastY).to.be.closeTo(200, 5);
    });
});

describe('FindMouseEffect', () => {
    it('should initialize with default halo values', () => {
        const effect = new FindMouseEffect();
        expect(effect.haloColor).to.equal('#ffffff');
        expect(effect.haloRadius).to.equal(50);
        expect(effect.haloOpacity).to.equal(0.5);
    });

    it('should move to specified coordinates', () => {
        const effect = new FindMouseEffect();
        // Mock set_position
        let lastX, lastY;
        effect.set_position = (x, y) => { lastX = x; lastY = y; };
        
        effect.move(100, 200);
        expect(lastX).to.equal(100);
        expect(lastY).to.equal(200);
    });

    it('should activate and deactivate', () => {
        const effect = new FindMouseEffect();
        
        // Mock Main.uiGroup
        let addedChild = null;
        global.Main.uiGroup.add_child = (child) => { addedChild = child; };
        
        effect.activate();
        expect(addedChild).to.equal(effect);
        expect(effect.isWiggling).to.be.true;
        
        let removedChild = null;
        global.Main.uiGroup.remove_child = (child) => { removedChild = child; };
        effect.deactivate();
        expect(removedChild).to.equal(effect);
        expect(effect.isWiggling).to.be.false;
    });
});

// Run History tests
describe('History', () => {
    it('should initialize with default values', () => {
        const history = new History();
        expect(history.sampleSize).to.equal(25);
        expect(history.radiansThreshold).to.equal(15);
        expect(history.distanceThreshold).to.equal(180);
    });

    it('should store cursor coordinates with timestamps', () => {
        const history = new History();
        history.push(100, 200);
        
        expect(history._samples.length).to.equal(1);
        expect(history._samples[0].x).to.equal(100);
        expect(history._samples[0].y).to.equal(200);
    });

    it('should return the last coordinates', () => {
        const history = new History();
        history.push(50, 75);
        history.push(100, 200);
        
        expect(history.lastCoords.x).to.equal(100);
        expect(history.lastCoords.y).to.equal(200);
    });

    it('should clear all samples', () => {
        const history = new History();
        history.push(50, 75);
        history.push(100, 200);
        
        expect(history._samples.length).to.equal(2);
        
        history.clear();
        expect(history._samples.length).to.equal(0);
    });
});

// Run new effect tests
describe('SpotlightEffect', () => {
    it('should initialize with default spotlight values', () => {
        const effect = new SpotlightEffect();
        expect(effect.spotlightColor).to.equal('#ffff00');
        expect(effect.spotlightSize).to.equal(150);
        expect(effect.spotlightOpacity).to.equal(0.8);
    });

    it('should update spotlight color', () => {
        const effect = new SpotlightEffect();
        effect.spotlightColor = '#ff0000';
        expect(effect.spotlightColor).to.equal('#ff0000');
    });

    it('should update spotlight size', () => {
        const effect = new SpotlightEffect();
        effect.spotlightSize = 200;
        expect(effect.spotlightSize).to.equal(200);
    });

    it('should update spotlight opacity', () => {
        const effect = new SpotlightEffect();
        effect.spotlightOpacity = 0.5;
        expect(effect.spotlightOpacity).to.equal(0.5);
    });

    it('should move to specified coordinates', () => {
        const effect = new SpotlightEffect();
        let lastX, lastY;
        effect.set_position = (x, y) => { lastX = x; lastY = y; };

        effect.move(100, 200);
        expect(lastX).to.be.closeTo(100, 5);
        expect(lastY).to.be.closeTo(200, 5);
    });
});

describe('LaserPointerEffect', () => {
    it('should initialize with default laser values', () => {
        const effect = new LaserPointerEffect();
        expect(effect.laserColor).to.equal('#ff0000');
        expect(effect.laserThickness).to.equal(4);
        expect(effect.laserLength).to.equal(100);
    });

    it('should update laser color', () => {
        const effect = new LaserPointerEffect();
        effect.laserColor = '#00ff00';
        expect(effect.laserColor).to.equal('#00ff00');
    });

    it('should update laser thickness', () => {
        const effect = new LaserPointerEffect();
        effect.laserThickness = 6;
        expect(effect.laserThickness).to.equal(6);
    });

    it('should update laser length', () => {
        const effect = new LaserPointerEffect();
        effect.laserLength = 150;
        expect(effect.laserLength).to.equal(150);
    });
});

describe('TrailEffect', () => {
    it('should initialize with default trail values', () => {
        const effect = new TrailEffect();
        expect(effect.trailColor).to.equal('#00ff00');
        expect(effect.trailLength).to.equal(15);
        expect(effect.fadeDuration).to.equal(2000);
    });

    it('should update trail color', () => {
        const effect = new TrailEffect();
        effect.trailColor = '#ff00ff';
        expect(effect.trailColor).to.equal('#ff00ff');
    });

    it('should update trail length and trim excess points', () => {
        const effect = new TrailEffect();
        
        // Add some points
        effect._trailPoints = [{x: 1, y: 2}, {x: 3, y: 4}, {x: 5, y: 6}];
        expect(effect._trailPoints.length).to.equal(3);
        
        // Set a shorter length
        effect.trailLength = 1;
        expect(effect.trailLength).to.equal(1);
        expect(effect._trailPoints.length).to.equal(1);
    });

    it('should update fade duration', () => {
        const effect = new TrailEffect();
        effect.fadeDuration = 3000;
        expect(effect.fadeDuration).to.equal(3000);
    });
});

describe('ArrowGuideEffect', () => {
    it('should initialize with default arrow values', () => {
        const effect = new ArrowGuideEffect();
        expect(effect.arrowColor).to.equal('#00ffff');
        expect(effect.arrowSize).to.equal(30);
    });

    it('should update arrow color', () => {
        const effect = new ArrowGuideEffect();
        effect.arrowColor = '#ff00ff';
        expect(effect.arrowColor).to.equal('#ff00ff');
    });

    it('should update arrow size', () => {
        const effect = new ArrowGuideEffect();
        effect.arrowSize = 40;
        expect(effect.arrowSize).to.equal(40);
    });
});