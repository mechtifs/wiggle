import History from '../history.js';

// Mock GLib for testing
global.GLib = class GLib {
    static get_monotonic_time() { return Date.now(); }
};

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

    it('should remove old samples based on sampleSize', () => {
        const history = new History();
        history.sampleSize = 1; // 1 second in ms
        
        history.push(50, 75);
        
        // Wait a bit to ensure timestamp difference
        setTimeout(() => {
            history.push(100, 200);
            expect(history._samples.length).to.equal(1);
        }, 10);
    });
});
