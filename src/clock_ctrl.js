import {PanelCtrl} from 'app/plugins/sdk';
import moment from './lib/moment-timezone-with-data.min';
//import astrojs from './lib/astro.js';
import './css/clock-panel.css!';

const panelDefaults = {
    titleFontSize: 20,
    clockFontSize: 28,
    padding: 15,
    fontWeight: 'normal',
    bgColor: null,
    longitude: 116.632311,
    clocks : [["UTC", "UTC"], ["LST", "Local Sidereal Time"], ["Browser", ""], ["MRO", "Australia/Perth"]]
};

// Return the full Julian Date
// It is important to remember to include the timezone 
// offset if setting this with a string
function getJulianDate(today) {
    // The Julian Date of the Unix Time epoch is 2440587.5
    if(!today) today = new Date();
    if(typeof today==="string") today = new Date(today);
    return ( ((typeof today==="number") ? today : today.getTime()) / 86400000.0 ) + 2440587.5;
}

// Return the Greenwich Sidereal Time
function getGST(clock){
    if(typeof clock==="undefined") return { status: -1 };
    if(typeof clock==="string") clock = new Date(clock);
    else if(typeof clock==="number") clock = new Date(clock);
    var JD, JD0, S, T, T0, UT, A, GST;
    JD = getJulianDate(clock);
    JD0 = Math.floor(JD-0.5)+0.5;
    S = JD0-2451545.0;
    T = S/36525.0;
    T0 = (6.697374558 + (2400.051336*T) + (0.000025862*T*T))%24;
    if(T0 < 0) T0 += 24;
    UT = (((clock.getUTCMilliseconds()/1000 + clock.getUTCSeconds())/60) + clock.getUTCMinutes())/60 + clock.getUTCHours();
    A = UT*1.002737909;
    T0 += A;
    GST = T0%24;
    if(GST < 0) GST += 24;
    return GST;
}

function zeropad(str) {
    return (str + '').padStart(2, "0");
}

function getLST(lon){
    var clock = new Date();
    var GST = getGST(clock);
    var d = (GST + lon/15.0)/24.0;
    d = d - Math.floor(d);
    if(d < 0) d += 1;
    d *= 24;
    var h = Math.trunc(d);
    d -= h;
    var m = Math.trunc(60 * d);
    d -= m / 60;
    var s = Math.trunc(3600 * d);
    return zeropad(h) + ':' + zeropad(m) + ':' + zeropad(s);
}


export class ClockCtrl extends PanelCtrl {

    constructor($scope, $injector) {
        super($scope, $injector);
        _.defaults(this.panel, panelDefaults);

        this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
        this.events.on('panel-teardown', this.onPanelTeardown.bind(this));
        this.timezones = ["Local Sidereal Time"].concat(moment.tz.names());
        this.time = []; 
        this.title = [];
        this.render();
        this.titleFontSize = this.panel.titleFontSize.toString() + "px";
        this.clockFontSize = this.panel.clockFontSize.toString() + "px";
        this.padding = this.panel.padding.toString() + "px";
        // this.tz = moment.tz.guess();
             
        // astrojs.importPackages(['dates']);
        // astrojs.ready(function(e) {
        // });
    }

    onInitEditMode() {
        this.addEditorTab('Options', 'public/plugins/atnf-astroclock-panel/editor.html', 2);
    }
    
    onPanelTeardown() {
        this.$timeout.cancel(this.nextTickPromise);
    }
    
    render() {
        var scale = 1.0;
        if (this.elem != null) {
            var rect = this.elem.getBoundingClientRect();
            if (rect.width < 415) {
                scale = 0.4;
            }
            else if (rect.width < 640) {
                scale = 0.6;
            }
            this.titleFontSize = Math.floor(this.panel.titleFontSize * scale).toString() + "px";
            this.clockFontSize = Math.floor(this.panel.clockFontSize * scale).toString() + "px";
            this.padding = this.panel.padding.toString() + "px";
            for (var i = 0; i < this.panel.clocks.length; i++) {
                this.title[i] = this.panel.clocks[i][0];
                if (this.panel.clocks[i][1] == "Local Sidereal Time") {
                    this.time[i] = getLST(this.panel.longitude);
                }
                else if (this.panel.clocks[i][1] == "") {
                    // moment.tz.guess() not a function??
                    this.time[i] = moment().format('HH:mm:ss z');
                }
                else {
                    this.time[i] = moment().tz(this.panel.clocks[i][1]).format('HH:mm:ss z');
                }
            }
        }
        this.$timeout(() => { this.render(); }, 1000);
    }

    link(scope, elem) {
        this.elem = elem.find('.clock-panel')[0];
        this.events.on('render', () => {
            const $panelContainer = elem.find('.panel-container');
            if (this.panel.bgColor) {
                $panelContainer.css('background-color', this.panel.bgColor);
            } else {
                $panelContainer.css('background-color', '');
            }
        });
    }
}

ClockCtrl.templateUrl = 'module.html';
