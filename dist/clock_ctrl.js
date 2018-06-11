'use strict';

System.register(['app/plugins/sdk', './lib/moment-timezone-with-data.min', './css/clock-panel.css!'], function (_export, _context) {
    "use strict";

    var PanelCtrl, moment, _createClass, panelDefaults, ClockCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    // Return the full Julian Date
    // It is important to remember to include the timezone 
    // offset if setting this with a string
    function getJulianDate(today) {
        // The Julian Date of the Unix Time epoch is 2440587.5
        if (!today) today = new Date();
        if (typeof today === "string") today = new Date(today);
        return (typeof today === "number" ? today : today.getTime()) / 86400000.0 + 2440587.5;
    }

    // Return the Greenwich Sidereal Time
    function getGST(clock) {
        if (typeof clock === "undefined") return { status: -1 };
        if (typeof clock === "string") clock = new Date(clock);else if (typeof clock === "number") clock = new Date(clock);
        var JD, JD0, S, T, T0, UT, A, GST;
        JD = getJulianDate(clock);
        JD0 = Math.floor(JD - 0.5) + 0.5;
        S = JD0 - 2451545.0;
        T = S / 36525.0;
        T0 = (6.697374558 + 2400.051336 * T + 0.000025862 * T * T) % 24;
        if (T0 < 0) T0 += 24;
        UT = ((clock.getUTCMilliseconds() / 1000 + clock.getUTCSeconds()) / 60 + clock.getUTCMinutes()) / 60 + clock.getUTCHours();
        A = UT * 1.002737909;
        T0 += A;
        GST = T0 % 24;
        if (GST < 0) GST += 24;
        return GST;
    }

    function zeropad(str) {
        return (str + '').padStart(2, "0");
    }

    function getLST(lon) {
        var clock = new Date();
        var GST = getGST(clock);
        var d = (GST + lon / 15.0) / 24.0;
        d = d - Math.floor(d);
        if (d < 0) d += 1;
        d *= 24;
        var h = Math.trunc(d);
        d -= h;
        var m = Math.trunc(60 * d);
        d -= m / 60;
        var s = Math.trunc(3600 * d);
        return zeropad(h) + ':' + zeropad(m) + ':' + zeropad(s);
    }

    return {
        setters: [function (_appPluginsSdk) {
            PanelCtrl = _appPluginsSdk.PanelCtrl;
        }, function (_libMomentTimezoneWithDataMin) {
            moment = _libMomentTimezoneWithDataMin.default;
        }, function (_cssClockPanelCss) {}],
        execute: function () {
            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            panelDefaults = {
                titleFontSize: '20px',
                clockFontSize: '28px',
                padding: '15px',
                fontWeight: 'normal',
                bgColor: null,
                longitude: 116.632311,
                clocks: [["UTC", "UTC"], ["LST", "Local Sidereal Time"], ["Browser", ""], ["MRO", "Australia/Perth"]]
            };

            _export('ClockCtrl', ClockCtrl = function (_PanelCtrl) {
                _inherits(ClockCtrl, _PanelCtrl);

                function ClockCtrl($scope, $injector) {
                    _classCallCheck(this, ClockCtrl);

                    var _this = _possibleConstructorReturn(this, (ClockCtrl.__proto__ || Object.getPrototypeOf(ClockCtrl)).call(this, $scope, $injector));

                    _.defaults(_this.panel, panelDefaults);

                    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
                    _this.events.on('panel-teardown', _this.onPanelTeardown.bind(_this));
                    _this.timezones = ["Local Sidereal Time"].concat(moment.tz.names());
                    _this.time = [];
                    _this.title = [];
                    _this.render();
                    // this.tz = moment.tz.guess();

                    // astrojs.importPackages(['dates']);
                    // astrojs.ready(function(e) {
                    // });
                    return _this;
                }

                _createClass(ClockCtrl, [{
                    key: 'onInitEditMode',
                    value: function onInitEditMode() {
                        this.addEditorTab('Options', 'public/plugins/atnf-astroclock-panel/editor.html', 2);
                    }
                }, {
                    key: 'onPanelTeardown',
                    value: function onPanelTeardown() {
                        this.$timeout.cancel(this.nextTickPromise);
                    }
                }, {
                    key: 'render',
                    value: function render() {
                        var _this2 = this;

                        if (this.elem != null) {
                            var rect = this.elem.getBoundingClientRect();
                            if (rect.width < 415) {
                                this.panel.titleFontSize = '8px';
                                this.panel.clockFontSize = '12px';
                            } else if (rect.width < 640) {
                                this.panel.titleFontSize = '12px';
                                this.panel.clockFontSize = '16px';
                            } else {
                                this.panel.titleFontSize = '20px';
                                this.panel.clockFontSize = '28px';
                            }
                            for (var i = 0; i < this.panel.clocks.length; i++) {
                                this.title[i] = this.panel.clocks[i][0];
                                if (this.panel.clocks[i][1] == "Local Sidereal Time") {
                                    this.time[i] = getLST(this.panel.longitude);
                                } else if (this.panel.clocks[i][1] == "") {
                                    // moment.tz.guess() not a function??
                                    this.time[i] = moment().format('HH:mm:ss z');
                                } else {
                                    this.time[i] = moment().tz(this.panel.clocks[i][1]).format('HH:mm:ss z');
                                }
                            }
                        }
                        this.$timeout(function () {
                            _this2.render();
                        }, 1000);
                    }
                }, {
                    key: 'link',
                    value: function link(scope, elem) {
                        var _this3 = this;

                        this.elem = elem.find('.clock-panel')[0];
                        this.events.on('render', function () {
                            var $panelContainer = elem.find('.panel-container');
                            if (_this3.panel.bgColor) {
                                $panelContainer.css('background-color', _this3.panel.bgColor);
                            } else {
                                $panelContainer.css('background-color', '');
                            }
                        });
                    }
                }]);

                return ClockCtrl;
            }(PanelCtrl));

            _export('ClockCtrl', ClockCtrl);

            ClockCtrl.templateUrl = 'module.html';
        }
    };
});
//# sourceMappingURL=clock_ctrl.js.map
