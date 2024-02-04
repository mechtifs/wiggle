'use strict';

const HISTORY_MAX = 25;
const RADIANS_THRESHOLD = 15;
const DISTANCE_THRESHOLD = 180;

import * as math from './math.js';


export default class History {
    constructor() {
        this.history = [];
        this.lastX = 0;
        this.lastY = 0;
    }

    check() {
        let now = new Date().getTime();

        for (let i = 0; i < this.history.length; i++) {
            if (now - this.history[i].t > HISTORY_MAX) {
                this.history.splice(i, 1);
            }
        }

        let radians = 0;
        let distance = 0;
        for (let i = 2; i < this.history.length; i++) {
            radians += math.gamma(this.history[i-2], this.history[i-1], this.history[i]);
            distance = Math.max(distance, math.distance(this.history[i-1], this.history[i]));
        }
        return (radians > RADIANS_THRESHOLD && distance > DISTANCE_THRESHOLD);
    }

    push(x, y) {
        this.history.push({x: this.lastX = x, y: this.lastY = y, t: new Date().getTime()});
    }
}
