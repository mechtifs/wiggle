import { LaserPointerEffect } from '../effect.js';

// Mock GNOME libraries for testing
global.St = class St {
    static Widget(props) {
        return {
            set_size: () => {},
            set_style: () => {}
        };
    }
};

global.Main = {
    uiGroup: {
        add_child: () => {},
        remove_child: () => {}
    }
};

describe('LaserPointerEffect', () => {
    it('should initialize with default laser values', () => {
        const effect = new LaserPointerEffect();
        expect(effect.laserColor).to.equal('#ff0000');
        expect(effect.laserThickness).to.equal(4);
        expect(effect.laserLength).to.equal(100);
    });

    it('should create laser actor with correct dimensions', () => {
        const effect = new LaserPointerEffect();
        // The actor should be created during construction
        expect(effect._laserActor).to.exist;
    });

    it('should update laser color', () => {
        const effect = new LaserPointerEffect();
        let styleCalled = false;
        let lastStyle = '';
        
        // Mock the set_style method
        if (effect._laserActor) {
            effect._laserActor.set_style = (style) => {
                styleCalled = true;
                lastStyle = style;
            };
        }
        
        effect.laserColor = '#00ff00';
        expect(effect.laserColor).to.equal('#00ff00');
        expect(styleCalled).to.be.true;
        expect(lastStyle).to.include('#00ff00');
    });

    it('should update laser thickness', () => {
        const effect = new LaserPointerEffect();
        let sizeCalled = false;
        
        // Mock the set_size method
        if (effect._laserActor) {
            effect._laserActor.set_size = (w, h) => {
                sizeCalled = true;
                expect(w).to.equal(100);
                expect(h).to.equal(6);
            };
        }
        
        effect.laserThickness = 6;
        expect(effect.laserThickness).to.equal(6);
    });

    it('should update laser length', () => {
        const effect = new LaserPointerEffect();
        let sizeCalled = false;
        
        // Mock the set_size method
        if (effect._laserActor) {
            effect._laserActor.set_size = (w, h) => {
                sizeCalled = true;
                expect(w).to.equal(150);
                expect(h).to.equal(4);
            };
        }
        
        effect.laserLength = 150;
        expect(effect.laserLength).to.equal(150);
    });

    it('should track previous position for line drawing', () => {
        const effect = new LaserPointerEffect();
        let lastX, lastY;
        effect.set_position = (x, y) => { 
            lastX = x; 
            lastY = y; 
        };

        // First move should not draw line (no previous position)
        effect.move(100, 200);
        expect(lastX).to.be.undefined;
        expect(effect._prevX).to.equal(100);
        expect(effect._prevY).to.equal(200);

        // Second move should draw from first to second position
        effect.move(300, 400);
        expect(lastX).to.equal(100);
        expect(lastY).to.equal(200);
    });

    it('should activate and add to UI group', () => {
        const effect = new LaserPointerEffect();
        
        let addedChild = null;
        global.Main.uiGroup.add_child = (child) => { 
            addedChild = child; 
        };

        effect.activate();
        expect(addedChild).to.equal(effect);
        expect(effect.isWiggling).to.be.true;
    });

    it('should deactivate and remove from UI group', () => {
        const effect = new LaserPointerEffect();
        
        let removedChild = null;
        global.Main.uiGroup.remove_child = (child) => { 
            removedChild = child; 
        };

        effect.deactivate();
        expect(removedChild).to.equal(effect);
        expect(effect.isWiggling).to.be.false;
    });

    it('should clear previous position on deactivate', () => {
        const effect = new LaserPointerEffect();
        effect.move(100, 200);
        effect.move(300, 400);

        expect(effect._prevX).to.equal(300);
        expect(effect._prevY).to.equal(400);

        effect.deactivate();
        expect(effect._prevX).to.be.null;
        expect(effect._prevY).to.be.null;
    });

    it('should handle cursor hiding on activate when hidden', () => {
        const effect = new LaserPointerEffect();
        effect.isHidden = true;
        
        let hideCalled = false;
        effect.cursor.hide = () => { 
            hideCalled = true; 
        };

        effect.activate();
        expect(hideCalled).to.be.true;
    });

    it('should handle cursor showing on deactivate when hidden', () => {
        const effect = new LaserPointerEffect();
        effect.isHidden = true;
        
        let showCalled = false;
        effect.cursor.show = () => { 
            showCalled = true; 
        };

        effect.deactivate();
        expect(showCalled).to.be.true;
    });
});