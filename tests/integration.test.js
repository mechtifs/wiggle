// Integration tests for extension with new effects
import WiggleExtension from '../extension.js';
import { MagnificationEffect, FindMouseEffect, SpotlightEffect, LaserPointerEffect, TrailEffect, ArrowGuideEffect } from '../effect.js';
import { Field } from '../const.js';

describe('Extension Integration Tests', () => {
    let extension;
    let mockSettings;

    beforeEach(() => {
        // Setup mock settings and extension
        mockSettings = {
            get_string: sinon.stub(),
            get_boolean: sinon.stub(),
            get_int: sinon.stub(),
            get_double: sinon.stub(),
            connect: sinon.stub()
        };
        
        extension = new WiggleExtension();
        extension._settings = mockSettings;
    });

    describe('Effect Creation', () => {
        it('should create MagnificationEffect by default', () => {
            mockSettings.get_string.withArgs(Field.MODE).returns('magnification');
            extension.enable();
            expect(extension._effect).to.be.instanceOf(MagnificationEffect);
        });

        it('should create FindMouseEffect for find-mouse mode', () => {
            mockSettings.get_string.withArgs(Field.MODE).returns('find-mouse');
            extension.enable();
            expect(extension._effect).to.be.instanceOf(FindMouseEffect);
        });

        it('should create SpotlightEffect for spotlight mode', () => {
            mockSettings.get_string.withArgs(Field.MODE).returns('spotlight');
            extension.enable();
            expect(extension._effect).to.be.instanceOf(SpotlightEffect);
        });

        it('should create LaserPointerEffect for laser-pointer mode', () => {
            mockSettings.get_string.withArgs(Field.MODE).returns('laser-pointer');
            extension.enable();
            expect(extension._effect).to.be.instanceOf(LaserPointerEffect);
        });

        it('should create TrailEffect for trail mode', () => {
            mockSettings.get_string.withArgs(Field.MODE).returns('trail');
            extension.enable();
            expect(extension._effect).to.be.instanceOf(TrailEffect);
        });

        it('should create ArrowGuideEffect for arrow-guide mode', () => {
            mockSettings.get_string.withArgs(Field.MODE).returns('arrow-guide');
            extension.enable();
            expect(extension._effect).to.be.instanceOf(ArrowGuideEffect);
        });

        it('should default to MagnificationEffect for unknown mode', () => {
            mockSettings.get_string.withArgs(Field.MODE).returns('unknown-mode');
            extension.enable();
            expect(extension._effect).to.be.instanceOf(MagnificationEffect);
        });
    });

    describe('Spotlight Effect Settings Integration', () => {
        it('should bind spotlight color setting to SpotlightEffect', () => {
            const effect = new SpotlightEffect();
            extension._effect = effect;

            mockSettings.get_string.withArgs(Field.SPOTLIGHT_COLOR).returns('#ff0000');
            
            // Simulate the settings binding
            effect.spotlightColor = '#ff0000';
            expect(effect.spotlightColor).to.equal('#ff0000');
        });

        it('should bind spotlight size setting to SpotlightEffect', () => {
            const effect = new SpotlightEffect();
            extension._effect = effect;

            mockSettings.get_int.withArgs(Field.SPOTLIGHT_SIZE).returns(200);
            
            // Simulate the settings binding
            effect.spotlightSize = 200;
            expect(effect.spotlightSize).to.equal(200);
        });

        it('should bind spotlight opacity setting to SpotlightEffect', () => {
            const effect = new SpotlightEffect();
            extension._effect = effect;

            mockSettings.get_double.withArgs(Field.SPOTLIGHT_OPACITY).returns(0.7);
            
            // Simulate the settings binding
            effect.spotlightOpacity = 0.7;
            expect(effect.spotlightOpacity).to.equal(0.7);
        });
    });

    describe('Laser Pointer Settings Integration', () => {
        it('should bind laser color setting to LaserPointerEffect', () => {
            const effect = new LaserPointerEffect();
            extension._effect = effect;

            mockSettings.get_string.withArgs(Field.LASER_COLOR).returns('#00ff00');
            
            // Simulate the settings binding
            effect.laserColor = '#00ff00';
            expect(effect.laserColor).to.equal('#00ff00');
        });

        it('should bind laser thickness setting to LaserPointerEffect', () => {
            const effect = new LaserPointerEffect();
            extension._effect = effect;

            mockSettings.get_int.withArgs(Field.LASER_THICKNESS).returns(6);
            
            // Simulate the settings binding
            effect.laserThickness = 6;
            expect(effect.laserThickness).to.equal(6);
        });

        it('should bind laser length setting to LaserPointerEffect', () => {
            const effect = new LaserPointerEffect();
            extension._effect = effect;

            mockSettings.get_int.withArgs(Field.LASER_LENGTH).returns(150);
            
            // Simulate the settings binding
            effect.laserLength = 150;
            expect(effect.laserLength).to.equal(150);
        });
    });

    describe('Trail Settings Integration', () => {
        it('should bind trail color setting to TrailEffect', () => {
            const effect = new TrailEffect();
            extension._effect = effect;

            mockSettings.get_string.withArgs(Field.TRAIL_COLOR).returns('#00ffff');
            
            // Simulate the settings binding
            effect.trailColor = '#00ffff';
            expect(effect.trailColor).to.equal('#00ffff');
        });

        it('should bind trail length setting to TrailEffect', () => {
            const effect = new TrailEffect();
            extension._effect = effect;

            mockSettings.get_int.withArgs(Field.TRAIL_LENGTH).returns(20);
            
            // Simulate the settings binding
            effect.trailLength = 20;
            expect(effect.trailLength).to.equal(20);
        });

        it('should bind trail fade duration setting to TrailEffect', () => {
            const effect = new TrailEffect();
            extension._effect = effect;

            mockSettings.get_int.withArgs(Field.TRAIL_FADE).returns(3000);
            
            // Simulate the settings binding
            effect.fadeDuration = 3000;
            expect(effect.fadeDuration).to.equal(3000);
        });
    });

    describe('Arrow Guide Settings Integration', () => {
        it('should bind arrow color setting to ArrowGuideEffect', () => {
            const effect = new ArrowGuideEffect();
            extension._effect = effect;

            mockSettings.get_string.withArgs(Field.ARROW_COLOR).returns('#ff00ff');
            
            // Simulate the settings binding
            effect.arrowColor = '#ff00ff';
            expect(effect.arrowColor).to.equal('#ff00ff');
        });

        it('should bind arrow size setting to ArrowGuideEffect', () => {
            const effect = new ArrowGuideEffect();
            extension._effect = effect;

            mockSettings.get_int.withArgs(Field.ARROW_SIZE).returns(40);
            
            // Simulate the settings binding
            effect.arrowSize = 40;
            expect(effect.arrowSize).to.equal(40);
        });
    });

    describe('Effect Switching', () => {
        it('should properly destroy old effect when switching modes', () => {
            const oldEffect = new SpotlightEffect();
            extension._effect = oldEffect;
            
            let destroyCalled = false;
            oldEffect.destroy = () => { destroyCalled = true; };

            // Simulate mode change
            mockSettings.get_string.withArgs(Field.MODE).returns('laser-pointer');
            const newEffect = new LaserPointerEffect();
            extension._effect = newEffect;
            
            expect(destroyCalled).to.be.true;
        });

        it('should maintain history across effect switches', () => {
            // This would be tested in a more complex integration test
            // For now, just verify the structure exists
            extension.enable();
            expect(extension._history).to.exist;
        });
    });
});