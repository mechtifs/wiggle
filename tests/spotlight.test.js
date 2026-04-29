import { SpotlightEffect } from '../effect.js';

// Mock GNOME libraries for testing
global.St = class St {
    static Widget(props) {
        return {
            set_size: () => {},
            set_style: () => {},
            remove_child: () => {}
        };
    }
};

global.Main = {
    uiGroup: {
        add_child: () => {},
        remove_child: () => {}
    }
};

describe('SpotlightEffect', () => {
    it('should initialize with default spotlight values', () => {
        const effect = new SpotlightEffect();
        expect(effect.spotlightColor).to.equal('#ffff00');
        expect(effect.spotlightSize).to.equal(150);
        expect(effect.spotlightOpacity).to.equal(0.8);
    });

    it('should create spotlight actor with correct dimensions', () => {
        const effect = new SpotlightEffect();
        // The actor should be created during construction
        expect(effect._spotlightActor).to.exist;
    });

    it('should update spotlight color', () => {
        const effect = new SpotlightEffect();
        let styleCalled = false;
        let lastStyle = '';
        
        // Mock the set_style method
        if (effect._spotlightActor) {
            effect._spotlightActor.set_style = (style) => {
                styleCalled = true;
                lastStyle = style;
            };
        }
        
        effect.spotlightColor = '#ff0000';
        expect(effect.spotlightColor).to.equal('#ff0000');
        expect(styleCalled).to.be.true;
        expect(lastStyle).to.include('#ff0000');
    });

    it('should update spotlight size', () => {
        const effect = new SpotlightEffect();
        let sizeCalled = false;
        
        // Mock the set_size method
        if (effect._spotlightActor) {
            effect._spotlightActor.set_size = (w, h) => {
                sizeCalled = true;
                expect(w).to.equal(200 * 2);
                expect(h).to.equal(200 * 2);
            };
        }
        
        effect.spotlightSize = 200;
        expect(effect.spotlightSize).to.equal(200);
    });

    it('should update spotlight opacity', () => {
        const effect = new SpotlightEffect();
        let styleCalled = false;
        let lastStyle = '';
        
        // Mock the set_style method
        if (effect._spotlightActor) {
            effect._spotlightActor.set_style = (style) => {
                styleCalled = true;
                lastStyle = style;
            };
        }
        
        effect.spotlightOpacity = 0.6;
        expect(effect.spotlightOpacity).to.equal(0.6);
        expect(styleCalled).to.be.true;
        expect(lastStyle).to.include('0.6');
    });

    it('should move to specified coordinates', () => {
        const effect = new SpotlightEffect();
        let lastX, lastY;
        effect.set_position = (x, y) => { 
            lastX = x; 
            lastY = y; 
        };

        effect.move(100, 200);
        expect(lastX).to.equal(100);
        expect(lastY).to.equal(200);
    });

    it('should activate and add to UI group', () => {
        const effect = new SpotlightEffect();
        
        let addedChild = null;
        global.Main.uiGroup.add_child = (child) => { 
            addedChild = child; 
        };

        effect.activate();
        expect(addedChild).to.equal(effect);
        expect(effect.isWiggling).to.be.true;
    });

    it('should deactivate and remove from UI group', () => {
        const effect = new SpotlightEffect();
        
        let removedChild = null;
        global.Main.uiGroup.remove_child = (child) => { 
            removedChild = child; 
        };

        effect.deactivate();
        expect(removedChild).to.equal(effect);
        expect(effect.isWiggling).to.be.false;
    });

    it('should handle cursor hiding on activate when hidden', () => {
        const effect = new SpotlightEffect();
        effect.isHidden = true;
        
        let hideCalled = false;
        effect.cursor.hide = () => { 
            hideCalled = true; 
        };

        effect.activate();
        expect(hideCalled).to.be.true;
    });

    it('should handle cursor showing on deactivate when hidden', () => {
        const effect = new SpotlightEffect();
        effect.isHidden = true;
        
        let showCalled = false;
        effect.cursor.show = () => { 
            showCalled = true; 
        };

        effect.deactivate();
        expect(showCalled).to.be.true;
    });
});