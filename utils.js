'use strict';

export const getPrefValue = (settings, name, type) => {
    switch (type) {
    case 'i':
        return settings.get_int(name);
    case 'b':
        return settings.get_boolean(name);
    case 's':
        return settings.get_string(name);
    case 'd':
        return settings.get_double(name);
    default:
        throw new Error(`Unknown type: ${type}`);
    }
}

export const initSettings = (settings, entries) => {
    entries.forEach(([name, type, func]) => {
        func(getPrefValue(settings, name, type));
        settings.connect(`changed::${name}`, () => {
            func(getPrefValue(settings, name, type));
        });
    });
}
