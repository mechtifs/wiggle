'use strict';

import Gtk from 'gi://Gtk'
import Gio from 'gi://Gio'
import Adw from 'gi://Adw'
import GObject from 'gi://GObject';
import {
    gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'


export const ApperancePage = GObject.registerClass(
    class WiggleApperancePage extends Adw.PreferencesPage {
        _init(settings) {
            super._init({
                title: _('Appearance'),
                icon_name: 'org.gnome.Settings-appearance',
            })

            const cursorSizeRow = new Adw.SpinRow({
                title: _('Cursor Size'),
                subtitle: _('Configure the size of the cursor.'),
                numeric: true,
                adjustment: new Gtk.Adjustment({
                    lower: 24,
                    upper: 256,
                    step_increment: 1,
                }),
            })
            settings.bind('cursor-size', cursorSizeRow, 'value', Gio.SettingsBindFlags.DEFAULT)

            const magnifyDurationRow = new Adw.SpinRow({
                title: _('Magnify Duration'),
                subtitle: _('Configure the duration of the magnify effect.'),
                numeric: true,
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: 10000,
                    step_increment: 50,
                }),
            })
            settings.bind('magnify-duration', magnifyDurationRow, 'value', Gio.SettingsBindFlags.DEFAULT)

            const unmagnifyDurationRow = new Adw.SpinRow({
                title: _('Unmagify Duration'),
                subtitle: _('Configure the duration of the unmagify effect.'),
                numeric: true,
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: 10000,
                    step_increment: 50,
                }),
            })
            settings.bind('unmagnify-duration', unmagnifyDurationRow, 'value', Gio.SettingsBindFlags.DEFAULT)


            var _iconGroup = new Adw.PreferencesGroup({
                title: _('Cursor Icon'),
                description: _('Configure the appearance of the cursor icon.')
            });
            var _effectGroup = new Adw.PreferencesGroup({
                title: _('Cursor Effect'),
                description: _('Configure the appearance of the cursor effect.')
            });

            this.add(_iconGroup);
            _iconGroup.add(cursorSizeRow)
            this.add(_effectGroup);
            _effectGroup.add(magnifyDurationRow)
            _effectGroup.add(unmagnifyDurationRow)
        }
    }
)
