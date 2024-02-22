'use strict';

const HISTORY_MAX = 25;
const RADIANS_THRESHOLD = 15;
const DISTANCE_THRESHOLD = 180;

import * as math from './math.js';


export default class History {
    constructor() {
        this._history = [];
    }

    get lastCoords() {
        return this._history[this._history.length - 1];
    }

    check() {
        let now = new Date().getTime();

        for (let i = 0; i < this._history.length; i++) {
            if (now - this._history[i].t > HISTORY_MAX) {
                this._history.splice(i, 1);
            }
        }

        let radians = 0;
        let distance = 0;
        for (let i = 2; i < this._history.length; i++) {
            radians += math.gamma(this._history[i-2], this._history[i-1], this._history[i]);
            distance = Math.max(distance, math.distance(this._history[i-1], this._history[i]));
        }
        return (radians > RADIANS_THRESHOLD && distance > DISTANCE_THRESHOLD);
    }

    push(x, y) {
        this._history.push({x: x, y: y, t: new Date().getTime()});
    }
}
