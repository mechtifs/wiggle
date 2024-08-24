'use strict';

import GLib from 'gi://GLib';

const calcDistance = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

const calcGamma = (st, nd, rd) => {
    var a = Math.sqrt(Math.pow(st.x - nd.x, 2) + Math.pow(st.y - nd.y, 2));
    var b = Math.sqrt(Math.pow(nd.x - rd.x, 2) + Math.pow(nd.y - rd.y, 2));
    var c = Math.sqrt(Math.pow(rd.x - st.x, 2) + Math.pow(rd.y - st.y, 2));

    if (a * b === 0) {
        return 0;
    }
    return Math.PI - Math.acos((Math.pow(a, 2) + Math.pow(b, 2) - Math.pow(c, 2)) / (2 * a * b));
};

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

    clear() {
        this._samples = [];
    }

    check() {
        let now = GLib.get_monotonic_time();

        for (let i = 0; i < this._samples.length; i++) {
            if (now - this._samples[i].t > this.sampleSize * 1000) {
                this._samples.splice(i, 1);
            }
        }

        let radians = 0;
        let distance = 0;
        for (let i = 2; i < this._samples.length; i++) {
            radians += calcGamma(this._samples[i - 2], this._samples[i - 1], this._samples[i]);
            distance = Math.max(distance, calcDistance(this._samples[i - 1], this._samples[i]));
        }
        return radians > this.radiansThreshold && distance > this.distanceThreshold;
    }

    push(x, y) {
        this._samples.push({ x: x, y: y, t: GLib.get_monotonic_time() });
    }
}
