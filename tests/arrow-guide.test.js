import { ArrowGuideEffect } from '../effect.js';

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

describe('ArrowGuideEffect', () => {
    it('should initialize with default arrow values', () => {
        const effect = new ArrowGuideEffect();
        expect(effect.arrowColor).to.equal('#00ffff');
        expect(effect.arrowSize).to.equal(30);
    });

    it('should create arrow actor with correct dimensions', () => {
        const effect = new ArrowGuideEffect();
        // The actor should be created during construction
        expect(effect._arrowActor).to.exist;
    });

    it('should update arrow color', () => {
        const effect = new ArrowGuideEffect();
        let styleCalled = false;
        let lastStyle = '';
        
        // Mock the set_style method
        if (effect._arrowActor) {
            effect._arrowActor.set_style = (style) => {
                styleCalled = true;
                lastStyle = style;
            };
        }
        
        effect.arrowColor = '#ff00ff';
        expect(effect.arrowColor).to.equal('#ff00ff');
        expect(styleCalled).to.be.true;
        expect(lastStyle).to.include('#ff00ff');
    });

    it('should update arrow size', () => {
        const effect = new ArrowGuideEffect();
        let sizeCalled = false;
        
        // Mock the set_size method
        if (effect._arrowActor) {
            effect._arrowActor.set_size = (w, h) => {
                sizeCalled = true;
                expect(w).to.equal(40 * 2);
                expect(h).to.equal(40 * 1.5);
            };
        }
        
        effect.arrowSize = 40;
        expect(effect.arrowSize).to.equal(40);
    });

    it('should position arrow with offset from cursor', () => {
        const effect = new ArrowGuideEffect();
        let lastX, lastY;
        effect.set_position = (x, y) => { 
            lastX = x; 
            lastY = y; 
        };

        effect.move(100, 200);
        // Arrow should be positioned with offset from cursor
        expect(lastX).to.be.closeTo(100 - 30 * 1.5, 1);
        expect(lastY).to.be.closeTo(200 - 30, 1);
    });

    it('should activate and add to UI group', () => {
        const effect = new ArrowGuideEffect();
        
        let addedChild = null;
        global.Main.uiGroup.add_child = (child) => { 
            addedChild = child; 
        };

        effect.activate();
        expect(addedChild).to.equal(effect);
        expect(effect.isWiggling).to.be.true;
    });

    it('should deactivate and remove from UI group', () => {
        const effect = new ArrowGuideEffect();
        
        let removedChild = null;
        global.Main.uiGroup.remove_child = (child) => { 
            removedChild = child; 
        };

        effect.deactivate();
        expect(removedChild).to.equal(effect);
        expect(effect.isWiggling).to.be.false;
    });

    it('should handle cursor hiding on activate when hidden', () => {
        const effect = new ArrowGuideEffect();
        effect.isHidden = true;
        
        let hideCalled = false;
        effect.cursor.hide = () => { 
            hideCalled = true; 
        };

        effect.activate();
        expect(hideCalled).to.be.true;
    });

    it('should handle cursor showing on deactivate when hidden', () => {
        const effect = new ArrowGuideEffect();
        effect.isHidden = true;
        
        let showCalled = false;
        effect.cursor.show = () => { 
            showCalled = true; 
        };

        effect.deactivate();
        expect(showCalled).to.be.true;
    });
});