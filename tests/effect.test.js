import { BaseEffect, MagnificationEffect, FindMouseEffect } from '../effect.js';
import { Field } from '../const.js';

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
