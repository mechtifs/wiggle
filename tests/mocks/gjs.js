// Mock GJS modules for Mocha tests
// This file should be required before any test imports

global.Clutter = {
    AnimationMode: {
        EASE_IN_QUAD: 1,
        EASE_OUT_QUAD: 2
    }
};

global.Gio = class Gio {
    static Icon() { return {}; }
    static new_for_string(path) { return { path }; }
};

global.GLib = class GLib {
    static timeout_add(priority, delay, callback) { return 1; }
    static Source() { 
        return { remove: () => true };
    }
    static get_monotonic_time() { return Date.now(); }
    static path_get_dirname(url) { return '/path/to/dir'; }
};

global.GObject = class GObject {
    static registerClass(cls) { cls._registered = true; return cls; }
};

// Define ActorBase first
const ActorBase = class {
    constructor(props) {
        Object.assign(this, props);
    }
    remove_all_transitions() {}
    ease(props) {
        if (props.onComplete) setTimeout(props.onComplete, props.duration || 0);
        return this;
    }
};

// Then define St class with reference to ActorBase and Widget
class Widget {
    constructor(props) {
        Object.assign(this, props);
        this.add_child = () => {};
    }
}

global.St = class St {
    static Actor() { 
        return class Actor extends ActorBase {};
    }
    
    static Widget = Widget;
};

global.Graphene = class Graphene {
    static Point(coords) { return coords; }
};

global.Main = {
    uiGroup: {
        add_child: () => {},
        remove_child: () => {}
    }
};

// Mock Cursor
class Cursor {
    constructor() {
        this.hot = [0, 0];
        this.sprite = { get_width: () => 24 };
    }
    hide() {}
    show() {}
}

global.Cursor = Cursor;