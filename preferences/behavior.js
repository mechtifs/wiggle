'use strict';

import Gtk from 'gi://Gtk'
import Gio from 'gi://Gio'
import Adw from 'gi://Adw'
import GObject from 'gi://GObject';
import {
    gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js'


export const BehaviorPage = GObject.registerClass(
    class WiggleBehaviorPage extends Adw.PreferencesPage {
        _init(settings) {
            super._init({
                title: _('Behavior'),
                icon_name: 'org.gnome.Settings-mouse',
            })

            const sampleSizeRow = new Adw.SpinRow({
                title: _('Sample Size'),
                subtitle: _('Configure the sample size of the cursor track.'),
                numeric: true,
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: 1024,
                    step_increment: 1,
                }),
            })
            settings.bind('sample-size', sampleSizeRow, 'value', Gio.SettingsBindFlags.DEFAULT)

            const distanceSensitivityRow = new Adw.SpinRow({
                title: _('Distance Sensitivity'),
                subtitle: _('Configure the distance sensitivity to trigger the animation.'),
                numeric: true,
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: 1920,
                    step_increment: 1,
                }),
            })
            settings.bind('distance-threshold', distanceSensitivityRow, 'value', Gio.SettingsBindFlags.DEFAULT)

            const angleSensitivityRow = new Adw.SpinRow({
                title: _('Angle Sensitivity'),
                subtitle: _('Configure the angle sensitivity to trigger the animation.'),
                numeric: true,
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: 512,
                    step_increment: 1,
                }),
            })
            settings.bind('radians-threshold', angleSensitivityRow, 'value', Gio.SettingsBindFlags.DEFAULT)

            const checkIntervalRow = new Adw.SpinRow({
                title: _('Check Interval'),
                subtitle: _('Configure the interval of checking if Wiggle should trigger the animation.'),
                numeric: true,
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: 2000,
                    step_increment: 1,
                }),
            })
            settings.bind('check-interval', checkIntervalRow, 'value', Gio.SettingsBindFlags.DEFAULT)

            const drawIntervalRow = new Adw.SpinRow({
                title: _('Draw Interval'),
                subtitle: _('Configure the interval of drawing the cursor.'),
                numeric: true,
                adjustment: new Gtk.Adjustment({
                    lower: 0,
                    upper: 1000,
                    step_increment: 1,
                }),
            })
            settings.bind('draw-interval', drawIntervalRow, 'value', Gio.SettingsBindFlags.DEFAULT)


            var _triggerParametersGroup = new Adw.PreferencesGroup({
                title: _('Trigger Parameters'),
                description: _('Configure the parameters to trigger the animation.')
            });
            var _intervalsGroup = new Adw.PreferencesGroup({
                title: _('Timer Intervals'),
                description: _('Configure the intervals of the timers.')
            });

            this.add(_triggerParametersGroup);
            _triggerParametersGroup.add(sampleSizeRow)
            _triggerParametersGroup.add(distanceSensitivityRow)
            _triggerParametersGroup.add(angleSensitivityRow)
            this.add(_intervalsGroup);
            _intervalsGroup.add(checkIntervalRow)
            _intervalsGroup.add(drawIntervalRow)
        }
    }
)
