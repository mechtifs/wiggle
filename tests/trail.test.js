import { TrailEffect } from '../effect.js';

// Mock GNOME libraries for testing
global.GLib = class GLib {
    static get_monotonic_time() {
        return Date.now();
    }
};

global.Main = {
    uiGroup: {
        add_child: () => {},
        remove_child: () => {}
    }
};

describe('TrailEffect', () => {
    it('should initialize with default trail values', () => {
        const effect = new TrailEffect();
        expect(effect.trailColor).to.equal('#00ff00');
        expect(effect.trailLength).to.equal(15);
        expect(effect.fadeDuration).to.equal(2000);
    });

    it('should initialize with empty trail points array', () => {
        const effect = new TrailEffect();
        expect(effect._trailPoints).to.exist;
        expect(effect._trailPoints.length).to.equal(0);
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

    it('should store trail points with timestamps', () => {
        const effect = new TrailEffect();
        
        // Mock the timestamp to be predictable for testing
        let callCount = 1000;
        global.GLib.get_monotonic_time = () => ++callCount;
        
        effect.move(100, 200);
        expect(effect._trailPoints.length).to.equal(1);
        expect(effect._trailPoints[0].x).to.equal(100);
        expect(effect._trailPoints[0].y).to.equal(200);
        expect(effect._trailPoints[0].timestamp).to.equal(1001);

        effect.move(300, 400);
        expect(effect._trailPoints.length).to.equal(2);
        expect(effect._trailPoints[1].x).to.equal(300);
        expect(effect._trailPoints[1].y).to.equal(400);
    });

    it('should limit trail to specified length', () => {
        const effect = new TrailEffect();
        effect.trailLength = 2;
        
        // Mock the timestamp
        let callCount = 1000;
        global.GLib.get_monotonic_time = () => ++callCount;
        
        effect.move(100, 200);
        effect.move(300, 400);
        effect.move(500, 600);

        expect(effect._trailPoints.length).to.equal(2);
    });

    it('should activate and add to UI group', () => {
        const effect = new TrailEffect();
        
        let addedChild = null;
        global.Main.uiGroup.add_child = (child) => { 
            addedChild = child; 
        };

        effect.activate();
        expect(addedChild).to.equal(effect);
        expect(effect.isWiggling).to.be.true;
    });

    it('should deactivate and remove from UI group', () => {
        const effect = new TrailEffect();
        
        let removedChild = null;
        global.Main.uiGroup.remove_child = (child) => { 
            removedChild = child; 
        };

        effect.deactivate();
        expect(removedChild).to.equal(effect);
        expect(effect.isWiggling).to.be.false;
    });

    it('should clear trail on deactivate', () => {
        const effect = new TrailEffect();
        
        // Mock the timestamp
        let callCount = 1000;
        global.GLib.get_monotonic_time = () => ++callCount;
        
        effect.move(100, 200);
        effect.move(300, 400);

        expect(effect._trailPoints.length).to.equal(2);

        effect.deactivate();
        expect(effect._trailPoints.length).to.equal(0);
    });

    it('should handle cursor hiding on activate when hidden', () => {
        const effect = new TrailEffect();
        effect.isHidden = true;
        
        let hideCalled = false;
        effect.cursor.hide = () => { 
            hideCalled = true; 
        };

        effect.activate();
        expect(hideCalled).to.be.true;
    });

    it('should handle cursor showing on deactivate when hidden', () => {
        const effect = new TrailEffect();
        effect.isHidden = true;
        
        let showCalled = false;
        effect.cursor.show = () => { 
            showCalled = true; 
        };

        effect.deactivate();
        expect(showCalled).to.be.true;
    });
});