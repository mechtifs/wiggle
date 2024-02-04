'use strict';

export const distance = (p1, p2) => Math.sqrt(Math.pow(p2.x-p1.x, 2)+Math.pow(p2.y-p1.y, 2));

export const gamma = (st, nd, rd) => {
    var a = Math.sqrt(Math.pow(st.x-nd.x, 2)+Math.pow(st.y-nd.y, 2));
    var b = Math.sqrt(Math.pow(nd.x-rd.x, 2)+Math.pow(nd.y-rd.y, 2));
    var c = Math.sqrt(Math.pow(rd.x-st.x, 2)+Math.pow(rd.y-st.y, 2));

    if (a * b === 0) {
        return 0;
    }
    return Math.PI-Math.acos((Math.pow(a, 2)+Math.pow(b, 2)-Math.pow(c, 2))/(2*a*b));
}
