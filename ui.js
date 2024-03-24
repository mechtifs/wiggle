'use strict';

import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import Gio from 'gi://Gio';
import GObject from 'gi://GObject';
import { gettext } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'


const _ = (text) => text == null ? null : gettext(text);

export const nCombo = (title, subtitle, items, selected) => new Adw.ComboRow({
    title: _(title),
    subtitle: _(subtitle),
    model: new Gtk.StringList({
        strings: items,
    }),
    selected: selected
});

export const nEntry = (title) => new Adw.EntryRow({
    title: _(title)
});

export const nSpin = (title, subtitle, min, max, step) => new Adw.SpinRow({
    title: _(title),
    subtitle: _(subtitle),
    numeric: true,
    adjustment: new Gtk.Adjustment({
        lower: min,
        upper: max,
        step_increment: step,
    })
});

export const nSwitch = (title, subtitle) => new Adw.SwitchRow({
    title: _(title),
    subtitle: _(subtitle)
});

export class PrefGroup extends Adw.PreferencesGroup {
    static {
        GObject.registerClass(this);
    }

    constructor(title, description, rows) {
        super({
            title: _(title),
            description: _(description)
        });
        this._rows = rows;
    }

    bind(settings) {
        this._rows.forEach(([key, obj]) => {
            let prop;
            switch (obj.constructor.name) {
            case 'Adw_ComboRow':
                prop = 'selected';
                break;
            case 'Adw_EntryRow':
                prop = 'text';
                break;
            case 'Adw_SpinRow':
                prop = 'value';
                break;
            case 'Adw_SwitchRow':
                prop = 'active';
                break;
            default:
                throw new Error('Unsupported object type');
            }
            this.add(obj);
            settings.bind(key, obj, prop, Gio.SettingsBindFlags.DEFAULT);
        });
    }
}

export class PrefPage extends Adw.PreferencesPage {
    static {
        GObject.registerClass(this);
    }

    constructor(title, icon, groups) {
        super({
            title: _(title),
            icon_name: icon
        });
        this._groups = groups;
    }

    bind(settings) {
        this._groups.forEach((group) => {
            group.bind(settings);
            this.add(group);
        });
    }
}
