'use strict';

import * as math from './math.js';


export default class History {
    constructor() {
        this._samples = [];
        this.sampleSize = 25;
        this.radiansThreshold = 15;
        this.distanceThreshold = 180;
    }

    get lastCoords() {
        return this._samples[this._samples.length - 1];
    }

    check() {
        let now = new Date().getTime();

        for (let i = 0; i < this._samples.length; i++) {
            if (now - this._samples[i].t > this.sampleSize) {
                this._samples.splice(i, 1);
            }
        }

        let radians = 0;
        let distance = 0;
        for (let i = 2; i < this._samples.length; i++) {
            radians += math.gamma(this._samples[i-2], this._samples[i-1], this._samples[i]);
            distance = Math.max(distance, math.distance(this._samples[i-1], this._samples[i]));
        }
        return (radians > this.radiansThreshold && distance > this.distanceThreshold);
    }

    push(x, y) {
        this._samples.push({x: x, y: y, t: new Date().getTime()});
    }
}
